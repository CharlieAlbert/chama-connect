"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInRequest } from "@/lib/supabase/server-extended/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type SignInSuccess = {
  success: boolean;
  message: string;
  data?: any;
};

type SignInError = {
  error: string;
};

type SignInResult = SignInSuccess | SignInError;

const loginAction = async (
  _prevState: SignInResult | null,
  formData: FormData
): Promise<SignInResult> => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const result = await SignInRequest({ email, password });
    return result;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  // Get redirect URL from query params
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Setup form state with useActionState
  const [loginState, loginFormAction] = useActionState<SignInResult, FormData>(
    loginAction,
    { error: "" }
  );

  // Effect to handle successful login
  useEffect(() => {
    if (loginState && "success" in loginState && loginState.success) {
      // Set timeout to give user time to see success message
      const timer = setTimeout(() => {
        router.push(redirectTo);
        // Force a refresh to ensure middleware picks up the new session
        router.refresh();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loginState, router, redirectTo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full">
      <form action={loginFormAction} className="space-y-6">
        {loginState && "error" in loginState && loginState.error && (
          <Alert variant="destructive">
            <AlertDescription>{loginState.error}</AlertDescription>
          </Alert>
        )}

        {loginState && "success" in loginState && loginState.success && (
          <Alert>
            <AlertDescription>
              {loginState.message} Redirecting...
            </AlertDescription>
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
              value={formValues.email}
              onChange={handleInputChange}
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
              value={formValues.password}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
