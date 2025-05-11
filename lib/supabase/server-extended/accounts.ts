"use server";

import { createClient } from "../server";
import { Database } from "../types";
import { getAuthenticatedUser } from "./auth-helpers";
import { checkUserRole } from "./profile";

export type Account = Database["public"]["Tables"]["accounts"]["Row"];

export type ContributionStatus = "paid" | "partial" | "unpaid";

export type AddAccountInput = {
  amount: number;
  contribution_month: string;
  payment_method?: string;
  payment_proof?: string | null;
  user_id: string;
  status: ContributionStatus;
};

export const getAccountDetails = async () => {
  const supabase = createClient();

  await getAuthenticatedUser();

  const { data, error } = await supabase.from("accounts").select("*");
  if (error) {
    throw error;
  }
  return data;
};

export const getAccountDetailsById = async (id: string) => {
  const supabase = createClient();

  await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
};

export const addAccountDetails = async (input: AddAccountInput) => {
  const supabase = createClient();
  const user = await getAuthenticatedUser();

  await checkUserRole(user.id, ["treasurer", "super-admin"]);

  if (
    !input.amount ||
    !input.contribution_month ||
    !input.user_id ||
    !input.status
  ) {
    throw new Error(
      "Missing required fields: amount, contribution_month, user_id, status"
    );
  }

  const allowedStatuses: ContributionStatus[] = ["paid", "partial", "unpaid"];
  if (!allowedStatuses.includes(input.status)) {
    throw new Error(
      `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
    );
  }

  const insertData = {
    amount: input.amount,
    contribution_month: input.contribution_month,
    payment_method: input.payment_method ?? "mpesa",
    payment_proof: input.payment_proof ?? null,
    user_id: input.user_id,
    status: input.status,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("accounts")
    .insert(insertData)
    .select();
  if (error) {
    throw error;
  }
  return data;
};
