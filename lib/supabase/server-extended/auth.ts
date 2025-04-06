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

  // Start with OTP flow only - don't create password account yet
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        password, // Store password to use after verification
        name,
        phone,
        avatar_url,
      },
    },
  });

  if (otpError) {
    console.error("OTP error:", otpError.message);
    if (otpError.message.includes("email") || otpError.message.includes("smtp")) {
      return { error: "Email delivery issue. Please try again later" };
    }
    return {
      error: "Unable to send verification code. Please try again later",
    };
  }

  // Store credentials in session storage for the verification step
  if (typeof window !== "undefined") {
    sessionStorage.setItem("signup_email", email);
    sessionStorage.setItem("signup_password", password);
  }

  return { success: true, message: "Verification code sent to your email" };
};

type validateOTP = {
  email: string;
  otp: string;
  password?: string;
};

export const ValidateOTP = async ({ email, otp, password }: validateOTP) => {
  const supabase = await createClient();
  try {
    // First verify the OTP
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      return { error: verifyError.message };
    }

    // Get user metadata from the OTP session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "User session not found" };
    }

    const userPassword = password || user.user_metadata?.password;
    const userData = user.user_metadata || {};

    if (!userPassword) {
      return { error: "Password not found. Please try signing up again." };
    }

    // Sign out of the OTP session
    await supabase.auth.signOut();

    // Now create the permanent password-based account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: userPassword,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          avatar_url: userData.avatar_url,
        },
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    // Attempt to sign in with the new account
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: userPassword,
    });

    if (signInError) {
      return {
        success: true,
        message: "Account created. Please sign in with your password.",
        requireManualSignin: true,
      };
    }

    return {
      success: true,
      message: "Account created and signed in successfully",
      data: signInData,
      requireManualSignin: false,
    };

  } catch (error) {
    console.error("Validation error:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
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
