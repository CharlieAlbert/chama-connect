"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { SignUpRequest } from "@/lib/supabase/server-extended/auth";
import { uploadProfileImage } from "@/lib/supabase/server-extended/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

type SignUpSuccess = {
  success: boolean;
  message: string;
};

type SignUpError = {
  error: string;
};

type SignUpResult = SignUpSuccess | SignUpError;

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

    // The password will be stored in user_metadata on the server now
    // We no longer need to store it in sessionStorage after the signup request
    const result = await SignUpRequest({
      email,
      password,
      name,
      phone,
      avatar_url,
    });

    // Still store in sessionStorage as fallback for the OTP page
    if (result.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("signup_email", email);
        sessionStorage.setItem("signup_password", password);
      }
    }

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
          Sending verification code...
        </>
      ) : (
        "Continue"
      )}
    </Button>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup form state with useActionState 
  const [signupState, signupFormAction] = useActionState<
    SignUpResult,
    FormData
  >(signupAction, { error: "" });

  // Effect to handle successful OTP request
  useEffect(() => {
    if (signupState && "success" in signupState && signupState.success) {
      // Password is now stored in user_metadata on the server
      // But we've already stored credentials in sessionStorage as a fallback
      
      // Set timeout to give user time to see success message
      const timer = setTimeout(() => {
        router.push("/auth/verify-otp");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [signupState, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

  return (
    <div className="w-full">
      <form action={signupFormAction} className="space-y-6">
        {signupState && "error" in signupState && signupState.error && (
          <Alert variant="destructive">
            <AlertDescription>{signupState.error}</AlertDescription>
          </Alert>
        )}

        {signupState && "success" in signupState && signupState.success && (
          <Alert>
            <AlertDescription>
              {signupState.message} Redirecting to verification page...
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <div className="relative w-24 h-24 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            {avatar ? (
              <>
                <Image
                  src={avatar}
                  alt="Avatar preview"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <label
                htmlFor="avatar"
                className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs mt-1">Upload</span>
              </label>
            )}
          </div>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
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
    </div>
  );
}
