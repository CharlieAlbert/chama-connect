"use server";

import { createClient } from "../server";
import { Database } from "../types";
import { checkUserRole } from "./profile";

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

  if (user.role !== "super-admin") {
    throw new Error("You do not have permission to perform this action");
  }

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
