"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Database } from "@/lib/supabase/types";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  Receipt,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";

type UserType = Database["public"]["Tables"]["users"]["Row"];
type Loan = Database["public"]["Tables"]["loan_requests"]["Row"];

type RepaymentStatus = "on_time" | "late" | "partial" | "missed";

interface RecordRepaymentFormProps {
  users: UserType[];
  loans: Loan[];
  recordLoanRepaymentAction: (payloads: {
    loan_id: string;
    user_id: string;
    transaction_message: string;
    status: RepaymentStatus;
    amount?: number;
  }) => Promise<any>;
}

// Form validation schema
const formSchema = z.object({
  user_id: z.string({
    required_error: "Please select a user",
  }),
  loan_id: z.string({
    required_error: "Please select a loan",
  }),
  transaction_message: z
    .string()
    .min(10, "Transaction message must be at least 10 characters")
    .max(500, "Transaction message must not exceed 500 characters"),
  status: z.enum(["on_time", "late", "partial", "missed"], {
    required_error: "Please select a status",
  }),
  amount: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RecordRepaymentForm({
  users,
  loans,
  recordLoanRepaymentAction,
}: RecordRepaymentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
      loan_id: "",
      transaction_message: "",
      status: "on_time",
    },
  });

  // Handle user selection to filter loans
  const handleUserChange = (userId: string) => {
    form.setValue("user_id", userId);
    form.setValue("loan_id", ""); // Reset loan selection

    // Filter loans for the selected user
    const userLoans = loans.filter((loan) => loan.user_id === userId);
    setFilteredLoans(userLoans);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await recordLoanRepaymentAction({
        loan_id: values.loan_id,
        user_id: values.user_id,
        transaction_message: values.transaction_message,
        status: values.status,
        amount: values.amount,
      });

      setSuccess(true);
      form.reset({
        user_id: values.user_id, // Keep the user selected
        loan_id: values.loan_id, // Keep the loan selected
        transaction_message: "",
        status: "on_time",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record repayment");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: RepaymentStatus) => {
    switch (status) {
      case "on_time":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> On Time
          </Badge>
        );
      case "late":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> Late
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
          >
            <DollarSign className="h-3 w-3" /> Partial
          </Badge>
        );
      case "missed":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" /> Missed
          </Badge>
        );
    }
  };

  // Get selected loan details
  const selectedLoan = form.watch("loan_id")
    ? loans.find((loan) => loan.id === form.watch("loan_id"))
    : null;

  return (
    <Card className="max-w-xl mx-auto my-8 border-emerald-100">
      <CardHeader className="bg-emerald-50 border-b border-emerald-100">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-emerald-600" />
          Record Loan Repayment
        </CardTitle>
        <CardDescription>
          Record a payment transaction for an existing loan
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert
                variant="default"
                className="bg-emerald-50 text-emerald-800 border-emerald-200"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Repayment recorded successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* User Selection */}
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    User
                  </FormLabel>
                  <Select
                    onValueChange={handleUserChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} {user.email ? `(${user.email})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the user who made the repayment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Selection */}
            <FormField
              control={form.control}
              name="loan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Loan
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("user_id")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            form.watch("user_id")
                              ? "Select a loan"
                              : "Select a user first"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredLoans.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          {form.watch("user_id")
                            ? "No active loans found for this user"
                            : "Select a user first"}
                        </div>
                      ) : (
                        filteredLoans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            {loan.loan_type} - {formatCurrency(loan.amount)} (
                            {loan.status})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the loan for this repayment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Details (if selected) */}
            {selectedLoan && (
              <div className="bg-muted/30 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Loan Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(selectedLoan.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {selectedLoan.loan_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">
                      {selectedLoan.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {selectedLoan.application_date
                        ? new Date(
                            selectedLoan.application_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Message */}
            <FormField
              control={form.control}
              name="transaction_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the transaction message here. Example: MPESA confirmation message"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paste the complete transaction message. Details will be
                    extracted automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="on_time" className="flex items-center">
                        <div className="flex items-center gap-2">
                          {getStatusBadge("on_time")}
                        </div>
                      </SelectItem>
                      <SelectItem value="late">
                        <div className="flex items-center gap-2">
                          {getStatusBadge("late")}
                        </div>
                      </SelectItem>
                      <SelectItem value="partial">
                        <div className="flex items-center gap-2">
                          {getStatusBadge("partial")}
                        </div>
                      </SelectItem>
                      <SelectItem value="missed">
                        <div className="flex items-center gap-2">
                          {getStatusBadge("missed")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Indicate the status of this repayment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Amount Field (for partial payments) */}
            {form.watch("status") === "partial" && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Enter amount paid"
                          className="pl-10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the partial payment amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={submitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={submitting || !form.formState.isValid}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Record Repayment"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
