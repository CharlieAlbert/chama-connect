"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInRequest } from "@/lib/supabase/server-extended/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    if (result.error) {
      return { error: result.error };
    }
    return { success: true, message: "Login successful" };
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
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </>
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-muted/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={loginFormAction} className="space-y-4">
          {loginState && "error" in loginState && loginState.error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{loginState.error}</AlertDescription>
            </Alert>
          )}

          {loginState && "success" in loginState && loginState.success && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 animate-in fade-in-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {loginState.message} Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                className="pl-10"
                value={formValues.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="pl-10"
                value={formValues.password}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me for 30 days
            </label>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t px-6 py-4 bg-muted/10">
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
