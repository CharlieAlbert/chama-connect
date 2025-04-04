"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { SignInRequest } from "@/lib/supabase/server-extended/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Define return types from SignInRequest to match exactly what the function returns
type SignInSuccess = {
  success: boolean;
  message: string;
  data?: any;
};

type SignInError = {
  error: string;
};

type SignInResult = SignInSuccess | SignInError;

// Create a server action wrapper for SignInRequest
const loginAction = async (
  _prevState: SignInResult,
  formData: FormData
): Promise<SignInResult> => {
  try {
    // Extract form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    // Call the actual SignInRequest function
    return await SignInRequest({
      email,
      password,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

export function LoginForm() {
  // Initialize with a type that matches what SignInRequest can return
  const [state, formAction] = useActionState<SignInResult, FormData>(
    loginAction,
    { error: "" } // Initial state as an error object with empty message
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Display error message if present */}
      {"error" in state && state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Display success message if present */}
      {"success" in state && state.success && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </Label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full"
          />
        </div>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
