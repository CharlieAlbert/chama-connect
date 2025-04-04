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

type UserData = Database["public"]["Tables"]["users"]["Row"];

/**
 * Handles user signup with OTP verification.
 *
 * @param {SignUp} data - User data containing email, password, name, phone, and avatar_url.
 * @returns {Promise<{ success: boolean, message: string, data: any }>} - Success message and user data.
 */
export const SignUpRequest = async ({
  email,
  password,
  name,
  phone,
  avatar_url,
}: SignUp) => {
  const supabase = await createClient();

  if (!email || !password || name || phone) {
    throw new Error("Required fields are missing");
  }

  // Using OTP-based signup flow instead of direct password signup
  // This allows for email verification before account creation
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

    // Special handling for SMTP/email delivery issues
    // Provides a more user-friendly error message
    if (error.message.includes("email") || error.message.includes("smtp")) {
      console.error("Email delivery issue. Please try again later");
      return { error: "Email delivery issue. Please try again later" };
    }

    throw new Error("Unable to send verification code. Please try again later");
  }

  return { success: true, message: "Verification code sent to your email" };
};

type validateOTP = {
  email: string;
  otp: string;
  password: string;
};

/**
 * Validates the OTP sent during signup and creates a permanent account.
 *
 * @param {validateOTP} data - User data containing email, otp, and password.
 * @returns {Promise<{ success: boolean, message: string, data: any }>} - Success message and user data.
 */
export const ValidateOTP = async ({ email, otp, password }: validateOTP) => {
  const supabase = await createClient();

  if (!email || !otp || !password) {
    throw new Error("Required fields are missing");
  }

  // Verify the OTP sent during signup
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error || !data.user) {
    console.error("OTP validation error:", error);
    return { error: "Invalid verification code" };
  }

  if (data.user && data.user.identities?.length) {
    const userData = data.user.user_metadata;
    const userPassword = userData.password;

    console.log("Creating password-based account");

    await supabase.auth.signOut();

    const { error: updatedError } = await supabase.auth.signUp({
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

    if (updatedError) {
      console.error("Failed to create account:", updatedError);
      return { error: "Account creation error" };
    }

    // Auto sign-in after account creation for better UX
    const { data: SignInData, error: SignInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: userPassword,
      });

    if (SignInError) {
      console.error("Failed to sign in:", SignInError);
      return {
        error: "Unable to sign you in automatically. Please log in manually",
      };
    }

    const sessionData = SignInData;

    const { data: existingAccount } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingAccount) {
      console.error("User account already exists");
      return { data: sessionData };
    }

    const { data: userAccount, error: userAccountError } = await supabase
      .from("users")
      .insert({
        email,
        name: userData.name,
        phone: userData.phone,
        role: "member", // Default role assignment
        avatar_url: userData.avatar_url,
      });

    if (userAccountError) {
      console.error("Failed to create user:", userAccountError);
      return { error: "User creation error" };
    }

    return { data: sessionData };
  }

  return { success: true, message: "Account created successfully", data };
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
