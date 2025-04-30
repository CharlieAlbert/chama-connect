"use server";

import { createClient } from "../server";
import { TablesInsert, TablesUpdate, Database } from "../types";
import { checkUserRole } from "./profile";

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
}: {
  loan_id: string;
  approved: boolean;
  reviewer_id: string;
}) {
  const supabase = await createClient();

  // Fetch reviewer profile to check role
  await checkUserRole(reviewer_id, ["treasurer", "super-admin"]);

  const status: LoanStatus = approved ? "accepted" : "rejected";
  const issue_date = approved ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("loan_requests")
    .update({
      status,
      issue_date,
      approved_by: reviewer_id,
    })
    .eq("id", loan_id);
  if (error) throw error;
  return data;
}
