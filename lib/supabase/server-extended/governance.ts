"use server";

import { createClient } from "../server";
import { Database } from "../types";
import { checkUserRole } from "./auth-helpers";
import { parseMpesaMessage } from "../scripts";

type Users = Database["public"]["Tables"]["users"]["Row"][];

export async function getUsers(): Promise<Users> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function ToggleStatus(user_id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication is required for this operation");

  await checkUserRole(user.id, ["super-admin"]);

  const { data, error } = await supabase
    .from("users")
    .update({
      status,
    })
    .eq("id", user_id);
  if (error) throw error;
  return data;
}

export async function ToggleRole(user_id: string, role: string) {
  const allowedRoles = ["treasurer", "super-admin", "secretary", "member"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role value");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication is required");

  await checkUserRole(user.id, ["super-admin"]);

  const { data, error } = await supabase
    .from("users")
    .update({
      role,
    })
    .eq("id", user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

type LoanRepayment = Database["public"]["Tables"]["loan_repayments"]["Row"];

export async function recordLoanRepayment({
  loan_id,
  user_id,
  transaction_message,
  status,
}: {
  loan_id: string;
  user_id: string;
  transaction_message: string;
  status: "on_time" | "late" | "partial" | "missed";
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication is required");

  await checkUserRole(user.id, ["treasurer", "super-admin"]);

  const { amount, payment_date } = parseMpesaMessage(transaction_message);

  const { data, error } = await supabase
    .from("loan_repayments")
    .insert([
      {
        loan_id,
        amount,
        user_id,
        payment_date,
        status,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserLoanRepayments(user_id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication is required");

  const { data, error } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("user_id", user_id);
  if (error) throw error;
  return data;
}
