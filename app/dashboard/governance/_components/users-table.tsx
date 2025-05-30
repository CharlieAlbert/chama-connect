"use client";

import { useState, useEffect } from "react";
import type { Database } from "@/lib/supabase/types";
import {
  ToggleStatus,
  ToggleRole,
} from "@/lib/supabase/server-extended/governance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserMinus,
  UserX,
  UserCog,
} from "lucide-react";
import {
  getRoleBadge,
  getRoleIcon,
  getStatusBadge,
  getAvatarColor,
} from "@/utils/badges";

type User = Database["public"]["Tables"]["users"]["Row"];

type UserProps = {
  usersDisplay: User[];
};

const UsersTable = ({ usersDisplay }: UserProps) => {
  const [users, setUsers] = useState<User[]>(usersDisplay);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(usersDisplay);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    action: "activate" | "deactivate" | "suspend";
    userName: string;
  }>({
    open: false,
    userId: "",
    action: "activate",
    userName: "",
  });

  const allowedRoles = ["treasurer", "super-admin", "secretary", "member"];
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    currentRole: string;
    newRole: string;
  }>({
    open: false,
    userId: "",
    userName: "",
    currentRole: "",
    newRole: "",
  });

  // Get unique roles from users
  const uniqueRoles = Array.from(
    new Set(users.map((user) => user.role))
  ).filter(Boolean) as string[];

  useEffect(() => {
    // Filter users based on search term, status filter, and role filter
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleToggleStatus = async (
    userId: string,
    currentStatus: string,
    userName: string
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = currentStatus === "active" ? "deactivate" : "activate";

    setConfirmDialog({
      open: true,
      userId,
      action: action as "activate" | "deactivate" | "suspend",
      userName,
    });
  };

  const handleSuspend = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      userId,
      action: "suspend",
      userName,
    });
  };

  const handleRoleChange = (
    userId: string,
    userName: string,
    currentRole: string,
    newRole: string
  ) => {
    setRoleDialog({
      open: true,
      userId,
      userName,
      currentRole,
      newRole,
    });
  };

  const confirmAction = async () => {
    setIsLoading(true);
    try {
      const { userId, action } = confirmDialog;
      let newStatus: string;

      switch (action) {
        case "activate":
          newStatus = "active";
          break;
        case "deactivate":
          newStatus = "inactive";
          break;
        case "suspend":
          newStatus = "suspended";
          break;
        default:
          newStatus = "active";
      }

      await ToggleStatus(userId, newStatus);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      console.log(`User ${userId} status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const confirmRoleChange = async () => {
    setIsLoading(true);
    try {
      const { userId, newRole } = roleDialog;
      await ToggleRole(userId, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      console.log(`User ${userId} role changed to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsLoading(false);
      setRoleDialog({ ...roleDialog, open: false });
    }
  };

  return (
    <div className="space-y-6 px-6">
      {/* Header and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <Tabs
            defaultValue="all"
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <UserX className="h-8 w-8 mb-2 text-muted-foreground/60" />
                        <p>No users found</p>
                        <p className="text-sm">
                          {searchTerm
                            ? `No results for "${searchTerm}"`
                            : statusFilter !== "all" || roleFilter !== "all"
                              ? "Try changing your filters"
                              : "No users available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={user.avatar_url || undefined}
                              alt={user.name || ""}
                            />
                            <AvatarFallback
                              className={getAvatarColor(user.name || "?")}
                            >
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium capitalize">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  user.id,
                                  user.status,
                                  user.name || "this user"
                                )
                              }
                              disabled={user.status === "suspended"}
                              className={
                                user.status === "suspended"
                                  ? "text-muted-foreground"
                                  : ""
                              }
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserMinus className="h-4 w-4 mr-2" /> Set
                                  Inactive
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" /> Set
                                  Active
                                </>
                              )}
                            </DropdownMenuItem>

                            {user.status !== "suspended" && (
                              <>
                                <DropdownMenuSeparator />

                                {/* Role Management Sub-Menu */}
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <UserCog className="h-4 w-4 mr-2" />
                                    <span>Change Role</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="min-w-[180px]">
                                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                        Current:{" "}
                                        <span className="font-medium">
                                          {user.role}
                                        </span>
                                      </div>
                                      <DropdownMenuSeparator />
                                      {allowedRoles
                                        .filter((r) => r !== user.role)
                                        .map((role) => (
                                          <DropdownMenuItem
                                            key={role}
                                            onClick={() =>
                                              handleRoleChange(
                                                user.id,
                                                user.name || "this user",
                                                user.role,
                                                role
                                              )
                                            }
                                          >
                                            {getRoleIcon(role)}
                                            <span className="capitalize">
                                              {role}
                                            </span>
                                          </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSuspend(
                                      user.id,
                                      user.name || "this user"
                                    )
                                  }
                                  className="text-amber-600"
                                >
                                  <ShieldAlert className="h-4 w-4 mr-2" />{" "}
                                  Suspend User
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {filteredUsers.length > 0 && (
          <CardFooter className="flex justify-between py-4 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <Button variant="outline" size="sm" disabled>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Export Users
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className={
                confirmDialog.action === "suspend" ? "text-amber-600" : ""
              }
            >
              {confirmDialog.action === "activate"
                ? "Activate User"
                : confirmDialog.action === "deactivate"
                  ? "Deactivate User"
                  : "Suspend User"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "activate"
                ? "This will allow the user to access the system again."
                : confirmDialog.action === "deactivate"
                  ? "This will prevent the user from accessing the system until reactivated."
                  : "This action is irreversible. The user will be permanently suspended and cannot be reactivated."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-4 py-4">
            {confirmDialog.action === "suspend" && (
              <div className="rounded-full bg-amber-100 p-2 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            )}
            <div>
              <p className="font-medium">
                Are you sure you want to{" "}
                {confirmDialog.action === "activate"
                  ? "activate"
                  : confirmDialog.action === "deactivate"
                    ? "deactivate"
                    : "suspend"}{" "}
                <span className="font-bold">{confirmDialog.userName}</span>?
              </p>
              {confirmDialog.action === "suspend" && (
                <p className="text-sm text-muted-foreground mt-2">
                  This will permanently prevent the user from accessing the
                  system and cannot be undone.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isLoading}
              variant={
                confirmDialog.action === "suspend" ? "destructive" : "default"
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : confirmDialog.action === "activate" ? (
                "Activate User"
              ) : confirmDialog.action === "deactivate" ? (
                "Deactivate User"
              ) : (
                "Suspend User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              You are about to change this user's permissions in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-4 py-4">
            <div className="rounded-full bg-blue-50 p-2 flex-shrink-0">
              <UserCog className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">
                Change <span className="font-bold">{roleDialog.userName}</span>
                's role from{" "}
                <Badge variant="outline" className="font-normal ml-1 mr-1">
                  {roleDialog.currentRole}
                </Badge>{" "}
                to{" "}
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 font-normal ml-1"
                >
                  {roleDialog.newRole}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This will modify the user's permissions and access level within
                the system.
              </p>

              <div className="mt-4 bg-muted/50 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Role permissions:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {roleDialog.newRole === "super-admin" && (
                    <>
                      <li>Full system access</li>
                      <li>Manage all users and their roles</li>
                      <li>Access all financial records</li>
                      <li>Approve or reject all requests</li>
                    </>
                  )}
                  {roleDialog.newRole === "treasurer" && (
                    <>
                      <li>Manage financial records</li>
                      <li>Process loan applications</li>
                      <li>Generate financial reports</li>
                      <li>Limited user management</li>
                    </>
                  )}
                  {roleDialog.newRole === "secretary" && (
                    <>
                      <li>Manage meeting minutes</li>
                      <li>Send notifications</li>
                      <li>Update organization records</li>
                      <li>Limited user management</li>
                    </>
                  )}
                  {roleDialog.newRole === "member" && (
                    <>
                      <li>View personal records</li>
                      <li>Submit loan applications</li>
                      <li>Update personal profile</li>
                      <li>No administrative access</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={() => setRoleDialog({ ...roleDialog, open: false })}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Confirm Role Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTable;
