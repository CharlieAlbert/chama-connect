"use client";

import { useState } from "react";
import { AccountsTable } from "@/components/accounts-table";
import { AccountForm } from "@/components/account-form";
import {
  addAccountDetails,
  type Account,
  type AddAccountInput,
} from "@/lib/supabase/server-extended/accounts";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  CreditCard,
  FileText,
  PlusCircle,
  Search,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface FinancesClientProps {
  initialAccounts: Account[];
  users: { id: string; name: string; role: string }[];
}

export function FinancesClient({
  initialAccounts,
  users,
}: FinancesClientProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("view");

  // Check if user has permission to manage accounts (treasurer or super-admin)
  const canManageAccounts =
    user && (user.role === "treasurer" || user.role === "super-admin");

  // Filter accounts based on search term and status filter
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.contribution_month
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      account.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.payment_proof &&
        account.payment_proof.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && account.status === statusFilter;
  });

  // Calculate summary statistics
  const totalContributions = accounts.reduce(
    (sum, account) => sum + account.amount,
    0
  );
  const paidContributions = accounts.filter(
    (account) => account.status === "paid"
  ).length;
  const partialContributions = accounts.filter(
    (account) => account.status === "partial"
  ).length;
  const unpaidContributions = accounts.filter(
    (account) => account.status === "unpaid"
  ).length;

  // Handler for adding account details
  const handleAddAccount = async (input: AddAccountInput) => {
    setFormLoading(true);
    setFormError(null);
    setSuccessMsg("");
    try {
      const newAccounts = await addAccountDetails(input);
      setSuccessMsg("Account record added successfully.");
      // Update accounts state with new data
      setAccounts((prev) => [...prev, ...newAccounts]);
      // Switch to view tab after successful addition
      setTimeout(() => {
        setActiveTab("view");
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Failed to add account record");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">
            Financial Records
          </h1>
          <p className="text-muted-foreground">
            Manage and view contribution records
          </p>
        </div>
        {canManageAccounts && (
          <Button
            onClick={() => setActiveTab("add")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalContributions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {paidContributions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fully paid contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partial Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {partialContributions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Partially paid contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {unpaidContributions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending contributions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="view">
            <FileText className="h-4 w-4 mr-2" />
            View Records
          </TabsTrigger>
          {canManageAccounts && (
            <TabsTrigger value="add">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Record
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Contribution Records</CardTitle>
              <CardDescription>
                View and manage financial contribution records
              </CardDescription>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search records..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AccountsTable accounts={filteredAccounts} />
            </CardContent>
          </Card>
        </TabsContent>

        {canManageAccounts && (
          <TabsContent value="add">
            <Card>
              <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-emerald-600" />
                  Add Contribution Record
                </CardTitle>
                <CardDescription>
                  Record a new financial contribution
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {formError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                {successMsg && (
                  <Alert className="mb-6 bg-emerald-50 text-emerald-800 border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                )}

                <AccountForm
                  onSubmit={handleAddAccount}
                  users={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))}
                  loading={formLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
