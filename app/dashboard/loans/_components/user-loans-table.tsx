"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  PiggyBank,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { LoanDetailsDialog } from "./loan-details-dialog"; // Import the new component

export type UserLoan = {
  id: string;
  amount: number;
  loan_type: string;
  status: "in_review" | "accepted" | "rejected";
  application_date: string;
  interest_rate: number;
  repayment_terms: string;
  purpose?: string;
  remaining_balance?: number;
  next_payment_date?: string;
  issue_date?: string;
  users?: { phone?: string };
};

interface UserLoansTableProps {
  loans: UserLoan[];
}

function calculateMonthlyPayment(
  amount: number,
  interestRate: number,
  term: string
) {
  // Extract number of months from term (e.g. "6 months")
  const match = term.match(/(\d+)/);
  const months = match ? Number.parseInt(match[1], 10) : 1;
  // monthly = (amount + (amount * interestRate)) / months
  const total = amount + amount * interestRate;
  return total / months;
}

function calculateDueDate(issueDate?: string, term?: string) {
  if (!issueDate || !term) return "-";
  const match = term.match(/(\d+)/);
  const months = match ? Number.parseInt(match[1], 10) : 0;
  const date = new Date(issueDate);
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserLoansTable({ loans }: UserLoansTableProps) {
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "pending" | "rejected"
  >("all");
  const [sortField, setSortField] = useState<"date" | "amount" | "type">(
    "date"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLoan, setSelectedLoan] = useState<UserLoan | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Calculate summary statistics
  const totalLoans = loans.length;
  const activeLoans = loans.filter((loan) => loan.status === "accepted").length;
  const pendingLoans = loans.filter(
    (loan) => loan.status === "in_review"
  ).length;
  const totalBorrowed = loans
    .filter((loan) => loan.status === "accepted")
    .reduce((sum, loan) => sum + loan.amount, 0);

  // Filter loans based on active tab
  const filteredLoans = loans.filter((loan) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return loan.status === "accepted";
    if (activeTab === "pending") return loan.status === "in_review";
    if (activeTab === "rejected") return loan.status === "rejected";
    return true;
  });

  // Sort loans
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.application_date).getTime();
      const dateB = new Date(b.application_date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortField === "type") {
      return sortDirection === "asc"
        ? a.loan_type.localeCompare(b.loan_type)
        : b.loan_type.localeCompare(a.loan_type);
    }
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: "date" | "amount" | "type") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: "date" | "amount" | "type") => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpZA className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDownAZ className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {activeLoans}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently outstanding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingLoans}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Borrowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBorrowed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active loans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Loans</CardTitle>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "all" | "active" | "pending" | "rejected")
            }
            className="mt-2"
          >
            <TabsList>
              <TabsTrigger value="all" className="text-xs">
                All Loans
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                Active
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("amount")}
                      className="flex items-center focus:outline-none hover:text-foreground"
                    >
                      Amount {getSortIcon("amount")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("type")}
                      className="flex items-center focus:outline-none hover:text-foreground"
                    >
                      Type {getSortIcon("type")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort("date")}
                      className="flex items-center focus:outline-none hover:text-foreground"
                    >
                      Applied {getSortIcon("date")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {sortedLoans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <PiggyBank className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium">No loans found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activeTab === "all"
                            ? "You haven't applied for any loans yet."
                            : `You don't have any ${activeTab} loans.`}
                        </p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Apply for a Loan
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium">
                          {formatCurrency(loan.amount)}
                        </div>
                        {loan.remaining_balance !== undefined &&
                          loan.status === "accepted" && (
                            <div className="mt-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>
                                  Remaining:{" "}
                                  {formatCurrency(loan.remaining_balance)}
                                </span>
                                <span>
                                  {Math.round(
                                    (1 - loan.remaining_balance / loan.amount) *
                                      100
                                  )}
                                  % paid
                                </span>
                              </div>
                              <Progress
                                value={Math.round(
                                  (1 - loan.remaining_balance / loan.amount) *
                                    100
                                )}
                                className="h-1"
                              />
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="capitalize">
                          {loan.loan_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {loan.status === "in_review" && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" /> In Review
                          </Badge>
                        )}
                        {loan.status === "accepted" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Accepted
                          </Badge>
                        )}
                        {loan.status === "rejected" && (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>
                            {loan.application_date
                              ? new Date(
                                  loan.application_date
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(loan.interest_rate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {loan.repayment_terms}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {sortedLoans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                  <PiggyBank className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium">No loans found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "You haven't applied for any loans yet."
                      : `You don't have any ${activeTab} loans.`}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Apply for a Loan
                  </Button>
                </div>
              </div>
            ) : (
              sortedLoans.map((loan) => (
                <Card key={loan.id} className="overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          {formatCurrency(loan.amount)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground capitalize">
                          {loan.loan_type} Loan
                        </p>
                      </div>
                      {loan.status === "in_review" && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" /> In Review
                        </Badge>
                      )}
                      {loan.status === "accepted" && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Accepted
                        </Badge>
                      )}
                      {loan.status === "rejected" && (
                        <Badge
                          variant="outline"
                          className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" /> Rejected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 pt-0 px-4">
                    {loan.remaining_balance !== undefined &&
                      loan.status === "accepted" && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>
                              Remaining:{" "}
                              {formatCurrency(loan.remaining_balance)}
                            </span>
                            <span>
                              {Math.round(
                                (1 - loan.remaining_balance / loan.amount) * 100
                              )}
                              % paid
                            </span>
                          </div>
                          <Progress
                            value={Math.round(
                              (1 - loan.remaining_balance / loan.amount) * 100
                            )}
                            className="h-1"
                          />
                        </div>
                      )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Applied</p>
                        <p>
                          {loan.application_date
                            ? new Date(
                                loan.application_date
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Interest Rate
                        </p>
                        <p>{(loan.interest_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Term</p>
                        <p>{loan.repayment_terms}</p>
                      </div>
                      {loan.next_payment_date && loan.status === "accepted" && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Next Payment
                          </p>
                          <p>
                            {new Date(
                              loan.next_payment_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-3 bg-muted/30 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Details
                    </Button>
                    {loan.status === "accepted" && (
                      <Button variant="ghost" size="sm" className="text-xs h-8">
                        <FileText className="h-3 w-3 mr-1" /> Schedule
                      </Button>
                    )}
                    {loan.status === "in_review" && (
                      <Button variant="ghost" size="sm" className="text-xs h-8">
                        <RefreshCw className="h-3 w-3 mr-1" /> Check Status
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 flex justify-between">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" /> Export All
          </Button>
          <Button size="sm" className="text-xs">
            Apply for a New Loan
          </Button>
        </CardFooter>
      </Card>

      {/* Enhanced Loan Details Dialog */}
      <LoanDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        selectedLoan={selectedLoan}
        calculateMonthlyPayment={calculateMonthlyPayment}
        calculateDueDate={calculateDueDate}
      />
    </div>
  );
}
