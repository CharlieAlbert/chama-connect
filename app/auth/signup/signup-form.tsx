"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { SignUpRequest } from "@/lib/supabase/server-extended/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

// Define return types from SignUpRequest to match exactly what the function returns
type SignUpSuccess = { 
  success: boolean; 
  message: string;
}

type SignUpError = { 
  error: string;
}

type SignUpResult = SignUpSuccess | SignUpError;

// Create a server action wrapper for SignUpRequest
const signupAction = async (_prevState: SignUpResult, formData: FormData): Promise<SignUpResult> => {
  try {
    // Extract form data
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const avatarFile = formData.get('avatar') as File
    
    // Check if passwords match
    const confirmPassword = formData.get('confirmPassword') as string
    if (password !== confirmPassword) {
      return { error: "Passwords do not match" }
    }
    
    // Process avatar if provided
    let avatar_url = ""
    if (avatarFile && avatarFile.size > 0) {
      // In a real app, you'd upload this to storage and get a URL
      // For now, we'll just pass it along
      avatar_url = "placeholder_url"
    }
    
    // Call the actual SignUpRequest function
    return await SignUpRequest({
      email,
      password,
      name,
      phone,
      avatar_url
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create account"
      )}
    </Button>
  )
}

export function SignupForm() {
  // Initialize with a type that matches what SignUpRequest can return
  const [state, formAction] = useFormState<SignUpResult, FormData>(
    signupAction, 
    { error: "" } // Initial state as an error object with empty message
  )
  
  const [avatar, setAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatar(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Display error message if present */}
      {'error' in state && state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Display success message if present */}
      {'success' in state && state.success && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center space-y-4">
        <Label htmlFor="avatar" className="text-sm font-medium text-gray-700">
          Profile Picture
        </Label>
        <div className="relative">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
            {avatar ? (
              <Image
                src={avatar || "/placeholder.svg"}
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
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            {avatar ? "Change Avatar" : "Select Avatar"}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full name
        </Label>
        <div className="mt-1">
          <Input id="name" name="name" type="text" autoComplete="name" required className="block w-full" />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </Label>
        <div className="mt-1">
          <Input id="email" name="email" type="email" autoComplete="email" required className="block w-full" />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone number
        </Label>
        <div className="mt-1">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" required className="block w-full" />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
          />
        </div>
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
          />
        </div>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
