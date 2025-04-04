"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  SignUpRequest,
  ValidateOTP,
} from "@/lib/supabase/server-extended/auth";
import { uploadProfileImage } from "@/lib/supabase/server-extended/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, ArrowRight } from "lucide-react";
import Image from "next/image";

type SignUpSuccess = {
  success: boolean;
  message: string;
};

type SignUpError = {
  error: string;
};

type SignUpResult = SignUpSuccess | SignUpError;

type OTPValidationSuccess = {
  success: boolean;
  message: string;
  data?: any;
};

type OTPValidationError = {
  error: string;
};

type OTPValidationResult = OTPValidationSuccess | OTPValidationError;

const signupAction = async (
  _prevState: SignUpResult,
  formData: FormData
): Promise<SignUpResult> => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const avatarFile = formData.get("avatar") as File;

    const confirmPassword = formData.get("confirmPassword") as string;
    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    let avatar_url = "";
    if (avatarFile && avatarFile.size > 0) {
      const { url, error } = await uploadProfileImage(avatarFile);
      if (error) {
        return { error: error };
      }
      avatar_url = url || "";
    }

    const result = await SignUpRequest({
      email,
      password,
      name,
      phone,
      avatar_url,
    });

    return result;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

const validateOTPAction = async (
  _prevState: OTPValidationResult,
  formData: FormData
): Promise<OTPValidationResult> => {
  try {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;
    const password = formData.get("password") as string;

    if (!email || !otp || !password) {
      return {
        error: `Required fields are missing: ${!email ? "email" : ""} ${
          !otp ? "otp" : ""
        } ${!password ? "password" : ""}`.trim(),
      };
    }

    const result = await ValidateOTP({
      email,
      otp,
      password,
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
      return result as OTPValidationSuccess;
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending verification code...
        </>
      ) : (
        "Continue"
      )}
    </Button>
  );
}

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
        "Create account"
      )}
    </Button>
  );
}

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const wrappedSignupAction = async (
    prevState: SignUpResult,
    formData: FormData
  ): Promise<SignUpResult> => {
    setUserData({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
    });
    return signupAction(prevState, formData);
  };

  const [signupState, signupFormAction] = useActionState<
    SignUpResult,
    FormData
  >(wrappedSignupAction, { error: "" });

  const wrappedValidateOTPAction = async (
    prevState: OTPValidationResult,
    formData: FormData
  ): Promise<OTPValidationResult> => {
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    return validateOTPAction(prevState, formData);
  };

  const [otpState, otpFormAction] = useActionState<
    OTPValidationResult,
    FormData
  >(wrappedValidateOTPAction, { error: "" });

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (signupState && "success" in signupState && signupState.success) {
      setCurrentStep(2);
    }
  }, [signupState]);

  return (
    <div className="space-y-6">
      {currentStep === 1 && (
        <form id="signup-form" action={signupFormAction} className="space-y-6">
          {signupState && "error" in signupState && signupState.error && (
            <Alert variant="destructive">
              <AlertDescription>{signupState.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4">
            <Label
              htmlFor="avatar"
              className="text-sm font-medium text-gray-700"
            >
              Profile Picture
            </Label>
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center h-full w-full">
                    <Upload size={24} />
                    <span className="text-xs mt-1">Upload</span>
                  </div>
                )}
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  aria-label="Remove avatar"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-center w-full">
              <Input
                id="avatar"
                name="avatar"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? "Change Avatar" : "Select Avatar"}
              </Button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full name
            </Label>
            <div className="mt-1">
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full"
                value={formValues.name}
                onChange={handleInputChange}
              />
            </div>
          </div>

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
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone number
            </Label>
            <div className="mt-1">
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="block w-full"
                value={formValues.phone}
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
                autoComplete="new-password"
                required
                className="block w-full"
                value={formValues.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </Label>
            <div className="mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <SubmitButton />
          </div>
        </form>
      )}

      {currentStep === 2 && (
        <form action={otpFormAction} className="space-y-6">
          {otpState && "error" in otpState && otpState.error && (
            <Alert variant="destructive">
              <AlertDescription>{otpState.error}</AlertDescription>
            </Alert>
          )}

          {otpState && "success" in otpState && otpState.success && (
            <Alert>
              <AlertDescription>{otpState.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Verify your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification code to{" "}
              <span className="font-medium">{userData.email}</span>
            </p>
          </div>

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
              />
            </div>
          </div>

          <div>
            <VerifyButton />
          </div>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-emerald-600 hover:text-emerald-500"
            >
              Go back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
