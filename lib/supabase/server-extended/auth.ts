"use server";

import { createClient } from "../server";
import { Database } from "../types";

type SignUp = {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatar_url: string;
};

export const SignUpRequest = async ({
  email,
  password,
  name,
  phone,
  avatar_url,
}: SignUp) => {
  const supabase = await createClient();

  if (!email || !password || !name || !phone) {
    return { error: "Required fields are missing" };
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existingUser) {
    return { error: "User with this email already exists" };
  }

  // Send OTP
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        name,
        phone,
        avatar_url,
      },
    },
  });

  if (error) {
    console.error("OTP error:", error.message);
    if (error.message.includes("email") || error.message.includes("smtp")) {
      return { error: "Email delivery issue. Please try again later" };
    }
    return {
      error: "Unable to send verification code. Please try again later",
    };
  }

  return { success: true, message: "Verification code sent to your email" };
};

type validateOTP = {
  email: string;
  otp: string;
  password: string;
};

export const ValidateOTP = async ({ email, otp, password }: validateOTP) => {
  const supabase = await createClient();

  if (!email || !otp || !password) {
    return { error: "Required fields are missing" };
  }

  // Verify OTP
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error || !data.user) {
    console.error("OTP validation error:", error);
    return { error: "Invalid verification code" };
  }

  try {
    // Create permanent account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            name: data.user.user_metadata?.name,
            phone: data.user.user_metadata?.phone,
            avatar_url: data.user.user_metadata?.avatar_url,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      }
    );

    if (signUpError) {
      console.error("Failed to create account:", signUpError);
      return { error: signUpError.message };
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      email,
      name: data.user.user_metadata?.name,
      phone: data.user.user_metadata?.phone,
      avatar_url: data.user.user_metadata?.avatar_url,
      role: "member",
    });

    if (profileError) {
      console.error("Failed to create user profile:", profileError);
      return { error: "Failed to create user profile" };
    }

    // IMPORTANT: Add a small delay to ensure user is fully created
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Attempt sign-in with the same credentials
    const { data: sessionData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      console.error("Sign-in error details:", {
        emailUsed: email,
        passwordLength: password.length,
        passwordHash: btoa(password),
        error: signInError,
      });

      // Return success but indicate manual sign-in is needed
      return {
        success: true,
        message: "Account created successfully. Please sign in.",
        data: signUpData,
      };
    }

    return {
      success: true,
      message: "Account created and signed in successfully",
      data: sessionData,
    };
  } catch (err) {
    console.error("Unexpected error during account creation:", err);
    return { error: "An unexpected error occurred during account creation" };
  }
};

/**
 * Handles user signin with password authentication.
 *
 * @param {SignIn} data - User data containing email and password.
 * @returns {Promise<{ success: boolean, message: string, data: any }>} - Success message and user data.
 */
type SignIn = {
  email: string;
  password: string;
};

export const SignInRequest = async ({ email, password }: SignIn) => {
  const supabase = await createClient();

  if (!email || !password) {
    throw new Error("Required fields are missing");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error.message);
    return { error: "Invalid email or password" };
  }

  return { success: true, message: "Successfully signed in", data };
};

type PasswordResetRequest = {
  email: string;
};

type PasswordResetVerify = {
  email: string;
  otp: string;
  newPassword: string;
};

/**
 * Initiates password reset process by sending an OTP to the user's email.
 *
 * @param {PasswordResetRequest} data - Object containing user's email.
 * @returns {Promise<{ success: boolean, message: string, error?: string }>} - Result of the reset request.
 */
export const RequestPasswordReset = async ({ email }: PasswordResetRequest) => {
  const supabase = await createClient();

  if (!email) {
    throw new Error("Email is required");
  }

  // Check if user exists
  const { data: userExists, error: userCheckError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (userCheckError && !userCheckError.message.includes("No rows found")) {
    console.error("Error checking user:", userCheckError);
    return { error: "An error occurred. Please try again later." };
  }

  if (!userExists) {
    return {
      success: true,
      message:
        "If your email exists in our system, you will receive a reset code",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password/verify`,
  });

  if (error) {
    console.error("Password reset error:", error.message);

    if (error.message.includes("email") || error.message.includes("smtp")) {
      return { error: "Email delivery issue. Please try again later" };
    }

    return { error: "Unable to send reset code. Please try again later" };
  }

  return { success: true, message: "Password reset code sent to your email" };
};

/**
 * Verifies the OTP and updates the user's password.
 *
 * @param {PasswordResetVerify} data - Object containing email, OTP, and new password.
 * @returns {Promise<{ success: boolean, message: string, error?: string }>} - Result of the password update.
 */
export const VerifyPasswordReset = async ({
  email,
  otp,
  newPassword,
}: PasswordResetVerify) => {
  const supabase = await createClient();

  if (!email || !otp || !newPassword) {
    throw new Error("Required fields are missing");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });

  if (error || !data.user) {
    console.error("OTP validation error:", error);
    return { error: "Invalid verification code" };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("Password update error:", updateError);
    return { error: "Failed to update password. Please try again." };
  }

  return { success: true, message: "Password updated successfully" };
};
