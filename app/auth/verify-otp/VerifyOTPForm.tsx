"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { ValidateOTP } from "@/lib/supabase/server-extended/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type OTPValidationSuccess = {
  success: boolean;
  message: string;
  data?: any;
  requireManualSignin?: boolean;
};

type OTPValidationError = {
  error: string;
};

type OTPValidationResult = OTPValidationSuccess | OTPValidationError;

// Server action wrapper for OTP validation
const validateOTPAction = async (
  prevState: OTPValidationResult | null,
  formData: FormData
): Promise<OTPValidationResult> => {
  try {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;
    
    // Password is now optional, as it's stored in user_metadata
    // But we'll pass it as a fallback just in case
    const password = formData.get("password") as string;

    if (!email || !otp) {
      return {
        error: "Email and verification code are required",
      };
    }

    const result = await ValidateOTP({
      email,
      otp,
      password, // This is optional now in the server function
    });

    if ("error" in result && result.error) {
      return { error: result.error };
    }

    if ("data" in result) {
      return {
        success: true,
        message: "Account created successfully",
        data: result.data,
      };
    }

    if ("success" in result && result.success) {
      // Type assertion to handle the type mismatch
      const successResult = result as OTPValidationSuccess;
      return {
        success: true,
        message: successResult.message || "Verification completed",
        data: successResult.data,
      };
    }

    return {
      success: true,
      message: "Verification completed",
    };
  } catch (error) {
    console.error("OTP Validation Error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

function VerifyButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        "Verify & Create Account"
      )}
    </Button>
  );
}

export function VerifyOTPForm() {
  const router = useRouter();
  const [storedData, setStoredData] = useState<{
    email: string;
    password: string;
  } | null>(null);
  
  // Initialize with a properly typed empty state
  const initialState: OTPValidationResult = { error: "" };
  
  const [otpState, formAction] = useActionState<
    OTPValidationResult,
    FormData
  >(validateOTPAction, initialState);

  // Retrieve stored credentials from sessionStorage when component mounts
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== "undefined") {
      try {
        const storedEmail = sessionStorage.getItem("signup_email");
        const storedPassword = sessionStorage.getItem("signup_password");
        
        if (!storedEmail) {
          // Redirect to signup if credentials aren't found
          console.log("No email found in session storage, redirecting to signup");
          router.push("/auth/signup");
          return;
        }
        
        setStoredData({
          email: storedEmail,
          password: storedPassword || "",
        });
      } catch (error) {
        console.error("Error retrieving session data:", error);
        router.push("/auth/signup");
      }
    }
  }, [router]);

  // Redirect to dashboard/login on successful verification
  useEffect(() => {
    if (otpState && "success" in otpState && otpState.success) {
      // Clear session storage on successful verification
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("signup_email");
        sessionStorage.removeItem("signup_password");
      }
      
      // Set timeout to give user time to see success message
      const timer = setTimeout(() => {
        // Check if manual signin is required
        if (otpState.requireManualSignin) {
          console.log("Auto-signin failed, redirecting to login page");
          router.push("/auth/login");
        } else {
          console.log("Auto-signin successful, redirecting to dashboard");
          router.push("/dashboard");
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [otpState, router]);

  // If no stored data yet, show loading
  if (!storedData) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="w-full">
      {"error" in otpState && otpState.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{otpState.error}</AlertDescription>
        </Alert>
      )}

      {"success" in otpState && otpState.success && (
        <Alert className="mb-6">
          <AlertDescription>{otpState.message}</AlertDescription>
        </Alert>
      )}

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification code to{" "}
          <span className="font-medium">{storedData.email}</span>
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Hidden fields for email and password */}
        <input 
          type="hidden" 
          name="email" 
          value={storedData.email} 
        />
        <input 
          type="hidden" 
          name="password" 
          value={storedData.password} 
        />

        <div>
          <Label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700"
          >
            Verification code
          </Label>
          <div className="mt-1">
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter the 6-digit code"
              required
              className="block w-full text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />
          </div>
        </div>

        <div>
          <VerifyButton />
        </div>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="text-emerald-600 hover:text-emerald-500"
          >
            Go back to signup
          </button>
        </div>
      </form>
    </div>
  );
}
