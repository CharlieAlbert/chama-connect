"use server";

import { createClient } from "../server";

export const getAuthenticatedUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication is required");
  return user;
};

/**
 * Checks if a user has one of the allowed roles.
 * @param user_id - The user's ID (primary key in users table)
 * @param allowedRoles - Array of allowed roles (e.g. ["treasurer", "super-admin", "secretary", "member"])
 * @returns The user's role if allowed, otherwise throws an error.
 */
export async function checkUserRole(user_id: string, allowedRoles: string[]) {
  const supabase = createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user_id)
    .single();
  if (error) throw error;
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error(`User does not have required role for this operation.`);
  }
  return user.role;
}
