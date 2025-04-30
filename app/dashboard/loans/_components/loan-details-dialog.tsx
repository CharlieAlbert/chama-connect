"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  HelpCircle,
  Info,
  Landmark,
  Phone,
  Printer,
  Receipt,
  XCircle,
} from "lucide-react";

interface LoanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLoan: any | null;
  calculateMonthlyPayment: (
    amount: number,
    interestRate: number,
    term: string
  ) => number;
  calculateDueDate: (issueDate: string, term: string) => string;
}

export function LoanDetailsDialog({
  open,
  onOpenChange,
  selectedLoan,
  calculateMonthlyPayment,
  calculateDueDate,
}: LoanDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!selectedLoan) return null;

  // Calculate loan progress
  const progress =
    selectedLoan.remaining_balance !== undefined
      ? Math.round(
          (1 - selectedLoan.remaining_balance / selectedLoan.amount) * 100
        )
      : 0;

  // Generate payment schedule (simplified example)
  const generatePaymentSchedule = () => {
    const monthlyPayment = calculateMonthlyPayment(
      selectedLoan.amount,
      selectedLoan.interest_rate,
      selectedLoan.repayment_terms
    );
    const termMonths = Number.parseInt(
      selectedLoan.repayment_terms.split(" ")[0]
    );
    const startDate = new Date(
      selectedLoan.issue_date || selectedLoan.application_date
    );

    const schedule = [];
    let remainingBalance = selectedLoan.amount;

    for (let i = 1; i <= termMonths; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);

      const interestPayment =
        remainingBalance * (selectedLoan.interest_rate / 12);
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString(),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
        status: i === 1 ? "upcoming" : i === 2 ? "upcoming" : "scheduled",
      });
    }

    return schedule;
  };

  const paymentSchedule = generatePaymentSchedule();

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_review":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> In Review
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" /> Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" /> Rejected
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Loan Details</DialogTitle>
            {getStatusBadge(selectedLoan.status)}
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-4">
            {/* Loan Summary Card */}
            <Card className="border-emerald-100">
              <CardHeader className="pb-2 bg-emerald-50 border-b border-emerald-100">
                <CardTitle className="text-base flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-emerald-600" />
                  Loan Summary
                </CardTitle>
                <CardDescription>Key details about your loan</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedLoan.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Monthly Payment
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        calculateMonthlyPayment(
                          selectedLoan.amount,
                          selectedLoan.interest_rate,
                          selectedLoan.repayment_terms
                        )
                      )}
                    </p>
                  </div>
                </div>

                {selectedLoan.status === "accepted" &&
                  selectedLoan.remaining_balance !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Repayment Progress</span>
                        <span className="font-medium">
                          {progress}% Complete
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          Remaining:{" "}
                          {formatCurrency(selectedLoan.remaining_balance)}
                        </span>
                        <span>
                          Paid:{" "}
                          {formatCurrency(
                            selectedLoan.amount - selectedLoan.remaining_balance
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Loan Type</p>
                    <p className="font-medium capitalize">
                      {selectedLoan.loan_type}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Interest Rate
                    </p>
                    <p className="font-medium">
                      {(selectedLoan.interest_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Repayment Term
                    </p>
                    <p className="font-medium">
                      {selectedLoan.repayment_terms}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Application Date
                    </p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      {formatDate(selectedLoan.application_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Next Payment Due
                  </p>
                  <p className="font-medium">
                    {calculateDueDate(
                      selectedLoan.issue_date,
                      selectedLoan.repayment_terms
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Payment Amount
                  </p>
                  <p className="font-medium">
                    {formatCurrency(
                      calculateMonthlyPayment(
                        selectedLoan.amount,
                        selectedLoan.interest_rate,
                        selectedLoan.repayment_terms
                      )
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Pay To (Treasurer)
                  </p>
                  <p className="font-medium flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                    0799737000
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Loan Disbursed To
                  </p>
                  <p className="font-medium flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                    {selectedLoan.users?.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {selectedLoan.purpose && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Info className="h-4 w-4 mr-1 text-muted-foreground" />
                  Loan Purpose
                </h3>
                <p className="text-sm bg-muted/30 p-3 rounded-md">
                  {selectedLoan.purpose}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="flex items-center">
                <Receipt className="h-4 w-4 mr-1" /> Make Payment
              </Button>
              <Button size="sm" variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-1" /> Download Statement
              </Button>
              <Button size="sm" variant="outline" className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" /> Get Support
              </Button>
            </div>
          </TabsContent>

          {/* Payment Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Payment Schedule</h3>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs flex items-center"
              >
                <Download className="h-3 w-3 mr-1" /> Export Schedule
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-5 bg-muted/50 p-2 text-xs font-medium text-muted-foreground">
                <div>Payment</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Principal</div>
                <div>Status</div>
              </div>
              <Separator />
              <div className="max-h-[300px] overflow-y-auto">
                {paymentSchedule.map((payment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 p-2 text-sm border-b last:border-0"
                  >
                    <div>#{payment.paymentNumber}</div>
                    <div>{formatDate(payment.paymentDate)}</div>
                    <div>{formatCurrency(payment.payment)}</div>
                    <div>{formatCurrency(payment.principal)}</div>
                    <div>
                      {payment.status === "paid" && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 text-xs"
                        >
                          Paid
                        </Badge>
                      )}
                      {payment.status === "upcoming" && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 text-xs"
                        >
                          Upcoming
                        </Badge>
                      )}
                      {payment.status === "scheduled" && (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-700 text-xs"
                        >
                          Scheduled
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-md text-sm flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-muted-foreground">
                  This payment schedule is an estimate based on your loan terms.
                  Actual payment dates may vary.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Loan Documents</h3>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs flex items-center"
              >
                <ArrowDownToLine className="h-3 w-3 mr-1" /> Download All
              </Button>
            </div>

            <div className="space-y-2">
              <Card>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Loan Agreement</p>
                      <p className="text-xs text-muted-foreground">
                        PDF • Signed on{" "}
                        {formatDate(selectedLoan.application_date)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Payment Schedule</p>
                      <p className="text-xs text-muted-foreground">
                        PDF • Generated on{" "}
                        {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Landmark className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Terms & Conditions</p>
                      <p className="text-xs text-muted-foreground">
                        PDF • Last updated Jan 15, 2023
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
          <Button variant="outline" size="sm" className="flex items-center">
            <Printer className="h-4 w-4 mr-1" /> Print Details
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
