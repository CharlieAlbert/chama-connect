"use server";

import { createClient } from "../server";

function getNextMeetingDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let date = new Date(year, month, 5);
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  if (now > date) {
    const nextMonth = (month + 1) % 12;
    const nextYear = nextMonth === 0 ? year + 1 : year;
    date = new Date(nextYear, nextMonth, 5);
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1);
    }
  }
  return date.toISOString();
}

export interface DashboardMetrics {
  totalContributions: number;
  activeLoans: number;
  nextMeeting: string | null;
  rufflePot: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export async function getDashboardMetrics(): Promise<
  DashboardMetrics & { memberCount: number }
> {
  const totalContributions = 0;

  const supabase = await createClient();
  const { data: activeLoansData } = await supabase
    .from("loan_requests")
    .select("amount")
    .eq("status", "accepted");
  const activeLoans = (activeLoansData || []).reduce(
    (sum: number, l: any) => sum + (l.amount || 0),
    0
  );

  const { count: memberCount } = await supabase
    .from("users")
    .select("id", { count: "exact" })
    .eq("role", "member")
    .eq("status", "active");

  const nextMeeting = getNextMeetingDate();

  const rufflePot = 8000;

  return {
    totalContributions,
    activeLoans,
    nextMeeting,
    rufflePot,
    memberCount: memberCount || 0,
  };
}

export async function getRecentActivity(
  userId?: string
): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const [contrib, loans, minutes] = await Promise.all([
    supabase
      .from("contributions")
      .select("id, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("loan_requests")
      .select("id, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("minutes")
      .select("id, title, meeting_date, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const activities: ActivityItem[] = [];
  (contrib.data || []).forEach((c: any) => {
    activities.push({
      id: c.id,
      type: "contribution",
      title: "Contribution Received",
      description: `KES ${c.amount} contributed`,
      timestamp: c.created_at,
    });
  });
  (loans.data || []).forEach((l: any) => {
    activities.push({
      id: l.id,
      type: "loan",
      title: `Loan ${l.status === "approved" ? "Approved" : "Requested"}`,
      description: `Loan for KES ${l.amount}`,
      timestamp: l.created_at,
    });
  });
  (minutes.data || []).forEach((m: any) => {
    activities.push({
      id: m.id,
      type: "minutes",
      title: "New Meeting Minutes",
      description: m.title,
      timestamp: m.created_at || m.meeting_date,
    });
  });

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return activities.slice(0, 5);
}
