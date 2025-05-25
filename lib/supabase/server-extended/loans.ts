"use server";

import { createClient } from "../server";
import { TablesInsert, TablesUpdate, Database } from "../types";
import { checkUserRole } from "./profile";
import { sendLoanStatusEmail } from "../../email-service";

type LoanRequestInsert = TablesInsert<"loan_requests">;
type LoanRequestUpdate = TablesUpdate<"loan_requests">;

type LoanStatus = "in_review" | "accepted" | "rejected";
type LoanType = "regular" | "special";

export async function getLoanRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loan_requests")
    .select(`*, users:user_id(name, avatar_url, role)`);
  if (error) {
    throw error;
  }
  return data;
}

export async function getAllLoansWithUsers() {
  const supabase = await createClient();

  // Only fetch loans with status 'accepted' and join user info
  const { data, error } = await supabase
    .from("loan_requests")
    .select(
      `
    *,
    users:user_id (
      id,
      avatar_url,
      name,
      email,
      phone
    )
  `
    )
    .eq("status", "accepted");

  if (error) throw error;

  // Ensure .users is always an array for UI compatibility
  return (data ?? []).map((loan) => ({
    ...loan,
    users: loan.users ? [loan.users] : [],
  }));
}

export async function RequestLoan(
  request: Omit<
    LoanRequestInsert,
    | "user_id"
    | "status"
    | "interest_rate"
    | "repayment_terms"
    | "application_date"
  > & { loan_type: LoanType }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: UserError,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const now = new Date();
  const application_date = now.toISOString();
  const interest_rate = 0.1; // 10%
  const repayment_terms = "6 months";
  const status: LoanStatus = "in_review";

  const { data, error } = await supabase.from("loan_requests").insert({
    ...request,
    user_id: user.id,
    status,
    interest_rate,
    repayment_terms,
    application_date,
  });
  if (error) throw error;
  return data;
}

export async function ReviewLoanRequest({
  loan_id,
  approved,
  reviewer_id,
  reason,
}: {
  loan_id: string;
  approved: boolean;
  reviewer_id: string;
  reason?: string;
}) {
  const supabase = await createClient();

  await checkUserRole(reviewer_id, ["treasurer", "super-admin"]);

  const status: LoanStatus = approved ? "accepted" : "rejected";
  const issue_date = approved ? new Date().toISOString() : null;

  const { data: loanRequest, error: fetchError } = await supabase
    .from("loan_requests")
    .select(
      `
      *,
      users:user_id (
        email,
        name
      )
    `
    )
    .eq("id", loan_id)
    .single();

  if (fetchError) throw fetchError;
  if (!loanRequest) throw new Error("Loan request not found");

  const { error: updateError } = await supabase
    .from("loan_requests")
    .update({
      status,
      issue_date,
      approved_by: reviewer_id,
    })
    .eq("id", loan_id);

  if (updateError) throw updateError;

  await sendLoanStatusEmail(
    {
      email: loanRequest.users.email,
      name: loanRequest.users.name,
    },
    approved ? "approved" : "rejected",
    loanRequest.amount,
    approved
      ? ""
      : reason || "Your loan application did not meet the required criteria."
  );

  return loanRequest;
}

export async function getSelfLoans() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");
  const { data, error } = await supabase
    .from("loan_requests")
    .select(
      "id, amount, loan_type, status, application_date, interest_rate, repayment_terms"
    )
    .eq("user_id", user.id)
    .order("application_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getSelfLoansWithDetails() {
  const supabase = await createClient();
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");
  // Fetch loans for this user with extra details (phone, issue_date)
  const { data, error } = await supabase
    .from("loan_requests")
    .select(
      `id, amount, loan_type, status, application_date, interest_rate, repayment_terms, issue_date, users:user_id(phone)`
    ) // users: join to get phone
    .eq("user_id", user.id)
    .order("application_date", { ascending: false });
  if (error) throw error;
  return data || [];
}
