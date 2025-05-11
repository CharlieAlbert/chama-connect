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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Camera,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

type SignUpSuccess = {
  success: boolean;
  message: string;
  requireManualSignin?: boolean;
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Account
        </>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup form state with useActionState
  const [signupState, signupFormAction] = useActionState<
    SignUpResult,
    FormData
  >(signupAction, { error: "" });

  // Effect to handle successful signup
  useEffect(() => {
    if (signupState && "success" in signupState && signupState.success) {
      // Check if manual signin is required
      if (signupState.requireManualSignin) {
        // Redirect to login page if manual signin is required
        const timer = setTimeout(() => {
          router.push("/auth/login");
        }, 1500);

        return () => clearTimeout(timer);
      } else {
        // User is already signed in, redirect to dashboard or home
        const timer = setTimeout(() => {
          router.push("/dashboard");
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [signupState, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Calculate password strength when password changes
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-muted/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signupFormAction} className="space-y-4">
          {signupState && "error" in signupState && signupState.error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{signupState.error}</AlertDescription>
            </Alert>
          )}

          {signupState && "success" in signupState && signupState.success && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 animate-in fade-in-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {signupState.message}{" "}
                {signupState.requireManualSignin
                  ? "Redirecting to login page..."
                  : "Redirecting to dashboard..."}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-24 h-24 overflow-hidden rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
                    {avatar ? (
                      <>
                        <Image
                          src={avatar || "/placeholder.svg"}
                          alt="Avatar preview"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <label
                        htmlFor="avatar"
                        className="cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-xs mt-1">Add photo</span>
                      </label>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload a profile picture (optional)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                className="pl-10"
                value={formValues.name}
                onChange={handleInputChange}
              />
            </div>
          </div>

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
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+1 (555) 123-4567"
                className="pl-10"
                value={formValues.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

            {formValues.password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Progress
                    value={passwordStrength}
                    className={cn("h-1", getPasswordStrengthColor())}
                  />
                  <span className="text-xs text-muted-foreground ml-2">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use 8+ characters with a mix of letters, numbers & symbols
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                className={cn(
                  "pl-10",
                  formValues.confirmPassword &&
                    formValues.password !== formValues.confirmPassword &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                value={formValues.confirmPassword}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {formValues.confirmPassword &&
              formValues.password !== formValues.confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t px-6 py-4 bg-muted/10">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
