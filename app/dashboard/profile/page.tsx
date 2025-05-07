"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/utils/initials";
import { toast } from "sonner";
import {
  updateUserProfile,
  uploadProfileImage,
} from "@/lib/supabase/server-extended/profile";
import {
  Camera,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { user, revalidate } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = user?.avatar_url;

      // Upload avatar if a new one was selected
      if (avatarFile) {
        const uploadResult = await uploadProfileImage(avatarFile);
        if (uploadResult.error) {
          toast.error(uploadResult.error);
          setIsSubmitting(false);
          return;
        }
        avatarUrl = uploadResult.url;
      }

      // Update profile with form data and new avatar URL if applicable
      const updateData: {
        name: string;
        phone: string;
        email: string;
        avatar_url?: string;
      } = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      };

      // Only add avatar_url if it's a valid string and different from current
      if (avatarUrl && avatarUrl !== user?.avatar_url) {
        updateData.avatar_url = avatarUrl;
      }

      const { error } = await updateUserProfile(updateData);

      if (error) {
        toast.error(error);
      } else {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        setAvatarPreview(null);
        setAvatarFile(null);
        await revalidate();
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate credibility score percentage for progress bar
  const credibilityScore = user?.credibility_score || 0;
  const credibilityPercentage = Math.min(Math.max(credibilityScore, 0), 100);

  // Determine status color
  const getStatusColor = (status = "active") => {
    const statusMap: Record<string, string> = {
      active: "bg-green-500",
      pending: "bg-yellow-500",
      suspended: "bg-red-500",
    };
    return statusMap[status.toLowerCase()] || "bg-green-500";
  };

  // Determine loan status badge variant
  const getLoanStatusVariant = (status = "") => {
    const statusMap: Record<
      string,
      "default" | "outline" | "secondary" | "destructive"
    > = {
      completed: "default",
      pending: "secondary",
      rejected: "destructive",
      "no loans": "outline",
    };
    return statusMap[status.toLowerCase()] || "outline";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account settings
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="shrink-0">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left column - Profile summary */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 h-24"></div>
            <CardContent className="pt-0 relative">
              <div className="flex flex-col items-center -mt-12">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background">
                    <AvatarImage
                      src={avatarPreview || user?.avatar_url || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {getInitials(user?.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:bg-primary/90 transition-colors"
                      aria-label="Change profile picture"
                    >
                      <Camera size={16} />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </button>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <div className="flex items-center justify-center mt-1 gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                        user?.status
                      )}`}
                    ></span>
                    <p className="text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Award size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Credibility Score
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{credibilityScore}</p>
                      <Progress
                        value={credibilityPercentage}
                        className="h-2 w-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <CreditCard size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Loan</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="capitalize"
                        variant={getLoanStatusVariant(
                          user?.last_loan_status ?? ""
                        )}
                      >
                        {user?.last_loan_status || "No loans"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Calendar size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Member Since
                    </p>
                    <p className="font-medium">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Clock size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {user?.last_login
                        ? new Date(user.last_login).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Profile details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update your personal information below"
                  : "Your personal information and contact details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <Mail size={16} className="text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2"
                      >
                        <Phone size={16} className="text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarPreview(null);
                        setAvatarFile(null);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                        });
                      }}
                      className="h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 min-w-[120px]"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </p>
                      </div>
                      <p className="font-medium">
                        {user?.name || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Email Address
                        </p>
                      </div>
                      <p className="font-medium">
                        {user?.email || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Phone Number
                        </p>
                      </div>
                      <p className="font-medium">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Member Status
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${getStatusColor(
                            user?.status
                          )}`}
                        ></span>
                        <p className="font-medium capitalize">
                          {user?.status || "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Your account performance and activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Credibility Score
                    </h3>
                    <span className="text-sm font-medium">
                      {credibilityScore}/100
                    </span>
                  </div>
                  <Progress value={credibilityPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Your credibility score affects your loan eligibility and
                    terms
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Last Loan Status
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getLoanStatusVariant(
                        user?.last_loan_status ?? ""
                      )}
                      className="capitalize"
                    >
                      {user?.last_loan_status || "No loans"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Status of your most recent loan application
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </h3>
                  <p className="font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Date when your account was first created
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </h3>
                  <p className="font-medium">
                    {user?.last_login
                      ? new Date(user.last_login).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Date and time of your most recent login to the system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
