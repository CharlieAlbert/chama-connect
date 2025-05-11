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
