import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  UserMinus,
  ShieldX,
  ShieldCheck,
  Shield,
  UserCheck,
  ClipboardList,
} from "lucide-react";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1"
        >
          <UserMinus className="h-3 w-3" /> Inactive
        </Badge>
      );
    case "suspended":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
        >
          <ShieldX className="h-3 w-3" /> Suspended
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          {status}
        </Badge>
      );
  }
};

export const getRoleBadge = (role: string | null) => {
  if (!role) return null;

  switch (role.toLowerCase()) {
    case "admin":
    case "super-admin":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
        >
          <ShieldCheck className="h-3 w-3" /> {role}
        </Badge>
      );
    case "treasurer":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <Shield className="h-3 w-3" /> {role}
        </Badge>
      );
    case "secretary":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1"
        >
          <ClipboardList className="h-3 w-3" /> {role}
        </Badge>
      );
    case "member":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <UserCheck className="h-3 w-3" /> {role}
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 capitalize"
        >
          {role}
        </Badge>
      );
  }
};

// Get role icon based on role name
export const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "super-admin":
      return <ShieldCheck className="h-4 w-4 mr-2 text-purple-600" />;
    case "treasurer":
      return <Shield className="h-4 w-4 mr-2 text-blue-600" />;
    case "secretary":
      return <ClipboardList className="h-4 w-4 mr-2 text-indigo-600" />;
    default:
      return <UserCheck className="h-4 w-4 mr-2 text-gray-600" />;
  }
};

export const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500 text-white",
    "bg-orange-500 text-white",
    "bg-amber-500 text-white",
    "bg-yellow-500 text-black", // yellow is lighter; black text for contrast
    "bg-lime-500 text-white",
    "bg-green-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
    "bg-cyan-500 text-black", // cyan can be bright
    "bg-sky-500 text-white",
    "bg-blue-500 text-white",
    "bg-indigo-500 text-white",
    "bg-violet-500 text-white",
    "bg-purple-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-pink-500 text-white",
    "bg-rose-500 text-white",
  ];

  // Generate a consistent index based on the name
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Get a positive index within the colors array range
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
