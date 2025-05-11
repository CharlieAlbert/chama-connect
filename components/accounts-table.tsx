"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Account,
  ContributionStatus,
} from "@/lib/supabase/server-extended/accounts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Clock,
  Download,
  FileText,
  MoreHorizontal,
  XCircle,
  Receipt,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currency";

interface AccountsTableProps {
  accounts: Account[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  const { user } = useAuth();
  const [sortField, setSortField] = useState<"month" | "amount" | "status">(
    "month"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  if (!user)
    return (
      <div className="p-8 text-center">
        Please sign in to view your accounts.
      </div>
    );

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No Records Found</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          There are no contribution records available at this time.
        </p>
      </div>
    );
  }

  // Calculate total amount
  const totalAmount = accounts.reduce((sum, account) => sum + account.amount, 0);

  // Sort accounts
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (sortField === "month") {
      return sortDirection === "asc"
        ? a.contribution_month.localeCompare(b.contribution_month)
        : b.contribution_month.localeCompare(a.contribution_month);
    } else if (sortField === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortField === "status") {
      return sortDirection === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: "month" | "amount" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Format date from YYYY-MM to Month YYYY
  const formatMonth = (dateString: string) => {
    if (!dateString) return "-";
    const [year, month] = dateString.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  };

  // Get status badge
  const getStatusBadge = (status: ContributionStatus) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> Partial
          </Badge>
        );
      case "unpaid":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" /> Unpaid
          </Badge>
        );
    }
  };

  // Handle view details
  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setDetailsDialogOpen(true);
  };

  // Handle download receipt
  const handleDownloadReceipt = (account: Account) => {
    setSelectedAccount(account);
    setReceiptDialogOpen(true);
  };

  // Generate and download receipt
  const downloadReceipt = () => {
    if (!selectedAccount) return;

    // Create receipt content
    const receiptContent = `
RECEIPT
==============================
Organization: Money Mongers
Receipt No: ${selectedAccount.id.substring(0, 8).toUpperCase()}
Date: ${new Date().toLocaleDateString()}
-------------------------------
Contribution Month: ${formatMonth(selectedAccount.contribution_month)}
Amount: ${formatCurrency(selectedAccount.amount)}
Status: ${selectedAccount.status.toUpperCase()}
Payment Method: ${selectedAccount.payment_method}
-------------------------------
Payment Reference:
${selectedAccount.payment_proof || "N/A"}
==============================
This is an official receipt for your records.
Thank you for your contribution!
    `;

    // Create a blob and download link
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${selectedAccount.id.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close the dialog
    setReceiptDialogOpen(false);
  };

  // Print receipt
  const printReceipt = () => {
    if (!selectedAccount) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${selectedAccount.id
          .substring(0, 8)
          .toUpperCase()}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .receipt {
            border: 1px solid #ccc;
            padding: 20px;
            margin-bottom: 20px;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .receipt-subtitle {
            color: #666;
            margin: 5px 0;
          }
          .receipt-body {
            margin-bottom: 20px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .receipt-label {
            font-weight: bold;
            color: #555;
          }
          .receipt-value {
          }
          .receipt-footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .receipt-status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
          }
          .receipt-status-paid {
            background-color: #d1fae5;
            color: #047857;
          }
          .receipt-status-partial {
            background-color: #fef3c7;
            color: #92400e;
          }
          .receipt-status-unpaid {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .receipt-proof {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 14px;
            white-space: pre-wrap;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <h1 class="receipt-title">RECEIPT</h1>
            <p class="receipt-subtitle">Community Savings Group</p>
            <p class="receipt-subtitle">Receipt No: ${selectedAccount.id
              .substring(0, 8)
              .toUpperCase()}</p>
            <p class="receipt-subtitle">Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="receipt-body">
            <div class="receipt-row">
              <span class="receipt-label">Contribution Month:</span>
              <span class="receipt-value">${formatMonth(
                selectedAccount.contribution_month
              )}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Amount:</span>
              <span class="receipt-value">${formatCurrency(
                selectedAccount.amount
              )}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Status:</span>
              <span class="receipt-status receipt-status-${
                selectedAccount.status
              }">${selectedAccount.status.toUpperCase()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Payment Method:</span>
              <span class="receipt-value">${
                selectedAccount.payment_method
              }</span>
            </div>
            
            <div class="receipt-row" style="flex-direction: column;">
              <span class="receipt-label">Payment Reference:</span>
              <div class="receipt-proof">${
                selectedAccount.payment_proof || "N/A"
              }</div>
            </div>
          </div>
          
          <div class="receipt-footer">
            This is an official receipt for your records.<br>
            Thank you for your contribution!
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Receipt</button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #e5e7eb; color: #374151; border: none; border-radius: 4px; margin-left: 10px; cursor: pointer;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Total Amount (Desktop) */}
      <div className="hidden md:flex justify-end mb-2">
        <div className="text-sm font-semibold text-muted-foreground">
          Total Amount: <span className="font-bold text-emerald-700">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("month")}
              >
                <div className="flex items-center">
                  Month
                  {sortField === "month" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("amount")}
              >
                <div className="flex items-center">
                  Amount
                  {sortField === "amount" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortField === "status" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Proof</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAccounts.map((account) => (
              <TableRow key={account.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatMonth(account.contribution_month)}
                </TableCell>
                <TableCell>{formatCurrency(account.amount)}</TableCell>
                <TableCell>
                  {getStatusBadge(account.status as ContributionStatus)}
                </TableCell>
                <TableCell className="capitalize">
                  {account.payment_method}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {account.payment_proof ? (
                    <span className="text-xs text-muted-foreground">
                      {account.payment_proof}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(account)}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadReceipt(account)}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Total Amount (Mobile) */}
      <div className="md:hidden flex justify-end mb-2">
        <div className="text-sm font-semibold text-muted-foreground">
          Total Amount: <span className="font-bold text-emerald-700">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedAccounts.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {formatMonth(account.contribution_month)}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {account.payment_method}
                  </p>
                </div>
                {getStatusBadge(account.status as ContributionStatus)}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(account.amount)}
                    </p>
                  </div>
                  {account.payment_proof && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Payment Proof
                      </p>
                      <p className="text-xs break-words">
                        {account.payment_proof}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => handleViewDetails(account)}
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" /> Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => handleDownloadReceipt(account)}
                  >
                    <Download className="mr-2 h-3.5 w-3.5" /> Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Contribution Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the contribution for{" "}
              {selectedAccount &&
                formatMonth(selectedAccount.contribution_month)}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">
                    {formatMonth(selectedAccount.contribution_month)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Contribution Record
                  </p>
                </div>
                {getStatusBadge(selectedAccount.status as ContributionStatus)}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedAccount.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium capitalize">
                    {selectedAccount.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Record ID</p>
                  <p className="font-medium text-xs">{selectedAccount.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {selectedAccount.created_at
                      ? new Date(
                          selectedAccount.created_at
                        ).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              {selectedAccount.payment_proof && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Payment Proof
                  </p>
                  <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap">
                    {selectedAccount.payment_proof}
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100 flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-emerald-800">
                    Contribution Recorded
                  </p>
                  <p className="text-sm text-emerald-700">
                    This contribution has been recorded in the system and is
                    part of your financial records.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setDetailsDialogOpen(false);
                handleDownloadReceipt(selectedAccount!);
              }}
            >
              <Receipt className="mr-2 h-4 w-4" /> Get Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Download Receipt
            </DialogTitle>
            <DialogDescription>
              Generate a receipt for your contribution record
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md border">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-medium">Receipt Preview</h3>
                    <p className="text-xs text-muted-foreground">
                      ID: {selectedAccount.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  {getStatusBadge(selectedAccount.status as ContributionStatus)}
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Month:
                    </span>
                    <span className="text-sm font-medium">
                      {formatMonth(selectedAccount.contribution_month)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Amount:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(selectedAccount.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Payment Method:
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {selectedAccount.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">
                  Choose how you want to receive your receipt:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={downloadReceipt} className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Download as Text
                  </Button>
                  <Button
                    onClick={printReceipt}
                    variant="outline"
                    className="flex-1"
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiptDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
