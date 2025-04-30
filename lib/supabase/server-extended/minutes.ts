"use server";

import { createClient } from "../server";
import { Database } from "../types";
import { checkUserRole } from "./profile";

type MinutesInsert = Database["public"]["Tables"]["minutes"]["Row"];

type MinutesUpdate = Database["public"]["Tables"]["minutes"]["Row"];

export async function uploadMinutes({
  file,
  user_id,
  title,
  meeting_date,
  description,
}: {
  file: File;
  user_id: string;
  title: string;
  meeting_date: string;
  description?: string;
}) {
  await checkUserRole(user_id, ["secretary", "super-admin"]);

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }

  const MAX_SIZE = 3 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 3MB limit.");
  }

  const supabase = await createClient();
  const timestamp = Date.now();
  const filePath = `${timestamp}-${file.name}`;

  // Upload the file to storage
  const { error: uploadError } = await supabase.storage
    .from("minutes")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("minutes")
    .getPublicUrl(filePath);

  // Insert record into minutes table
  const { data, error } = await supabase
    .from("minutes")
    .insert([
      {
        title,
        meeting_date,
        description: description || null,
        doc_url: urlData?.publicUrl,
        created_by: user_id,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateMinutes({
  id,
  user_id,
  updates,
}: {
  id: string;
  user_id: string;
  updates: Partial<Omit<MinutesUpdate, "id" | "created_by" | "created_at">>;
}) {
  await checkUserRole(user_id, ["secretary", "super-admin"]);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("minutes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteMinutes({
  id,
  user_id,
}: {
  id: string;
  user_id: string;
}) {
  await checkUserRole(user_id, ["secretary", "super-admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("minutes").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
}

export async function getMinutes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("minutes").select("*");
  if (error) {
    throw error;
  }
  return data;
}

export async function getMinutesById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("minutes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
