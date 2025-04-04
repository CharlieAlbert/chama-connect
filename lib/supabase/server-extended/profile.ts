"use server";

import { createClient } from "../server";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a profile image to Supabase storage and returns the URL
 *
 * @param file - The file to upload (must be an image)
 * @returns An object containing the URL of the uploaded image or an error message
 */
export async function uploadProfileImage(
  file: File
): Promise<{ url?: string; error?: string }> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { error: "File must be an image" };
    }

    // Maximum file size: 2MB
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Image size should not exceed 2MB" };
    }

    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Initialize Supabase client
    const supabase = createClient();

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { error: "Failed to upload image" };
    }

    // Get the public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Return the URL
    return { url: data.publicUrl };
  } catch (error) {
    console.error("Error in uploadProfileImage:", error);
    return { error: "An unexpected error occurred" };
  }
}
