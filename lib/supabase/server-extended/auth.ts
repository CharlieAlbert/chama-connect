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

  // Sign up with auto-confirm enabled
  const { data: SignupData, error: SignupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        avatar_url,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (SignupError) {
    console.error("Sign up error:", SignupError.message);
    return { error: "An error occurred. Please try again later." };
  }

  const userId = SignupData?.user?.id;

  if (!userId) {
    console.error("User ID not found in signup response");
    return { error: "An error occurred. Please try again later." };
  }

  // Check if email confirmation is required
  const emailConfirmationRequired = !SignupData.session;

  // Insert user data into users table
  const { data: AccountData, error: AccountError } = await supabase
    .from("users")
    .insert({
      id: userId,
      email,
      name,
      phone,
      avatar_url,
      role: "member",
    })
    .single();

  if (AccountError) {
    console.error("Account creation error:", AccountError.message);
    return { error: "An error occurred. Please try again later." };
  }

  // If we already have a session from signup, use it instead of trying to sign in again
  if (SignupData.session) {
    return {
      success: true,
      message: "Your account is created successfully and you're now signed in",
      data: { session: SignupData.session, user: SignupData.user },
      requireManualSignin: false,
    };
  }

  // If email confirmation is required, don't attempt auto sign-in
  if (emailConfirmationRequired) {
    return {
      success: true,
      message: "Please check your email to confirm your account before signing in.",
      requireManualSignin: true,
    };
  }

  // Only try auto sign-in if email confirmation is not required
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    console.error("Auto sign-in error:", signInError.message);
    // Return success but indicate manual sign-in is required
    return {
      success: true,
      message:
        "Your account is created successfully. Please sign in with your password.",
      requireManualSignin: true,
    };
  }

  // Return success with session data
  return {
    success: true,
    message: "Your account is created successfully and you're now signed in",
    data: signInData,
    requireManualSignin: false,
  };
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
