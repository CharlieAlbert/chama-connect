"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  RequestLoan,
  validateLoanAmount,
} from "@/lib/supabase/server-extended/loans";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  HelpCircle,
  Info,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define loan types and their details
const LOAN_TYPES = {
  regular: {
    name: "Regular Loan",
    maxAmount: 9000,
    interestRate: "10%",
    term: "6 months",
    description: "Standard loan with fixed monthly payments",
  },
  special: {
    name: "Special Loan",
    maxAmount: 25000,
    interestRate: "10%",
    term: "12 months",
    description: "Higher loan amount with longer repayment period",
  },
};

const formSchema = z.object({
  amount: z
    .number()
    .min(100, { message: "Amount must be at least " + formatCurrency(100) })
    .max(25000, { message: "Amount cannot exceed " + formatCurrency(25000) }),
  loanType: z.enum(["regular", "special"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoanApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"regular" | "special">(
    "regular"
  );
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1000,
      loanType: "regular",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const validation = await validateLoanAmount(
        values.amount,
        values.loanType
      );
      if (!validation.isValid) {
        setError(validation.error || "Invalid loan amount");
        setErrorDialogOpen(true);
        return;
      }

      await RequestLoan({
        amount: values.amount,
        loan_type: values.loanType,
      });
      setSuccess(true);
      form.reset({
        amount: 1000,
        loanType: "regular",
      });
    } catch (err: any) {
      setError(err.message || "Failed to apply for loan");
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value as "regular" | "special");
    form.setValue("loanType", value as "regular" | "special");
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-center">
              Authentication Required
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              You must be logged in to apply for a loan.
            </p>
            <Button className="mt-6" onClick={() => router.push("/login")}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      {success ? (
        <Card className="border-emerald-100">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold text-center text-emerald-800">
              Application Submitted!
            </h2>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              Your loan application has been received and is being reviewed. You
              will be notified once a decision has been made.
            </p>
            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Apply for Another Loan
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">
              Apply for a Loan
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete the form below to request financial assistance
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle>Loan Application</CardTitle>
              <CardDescription>
                Please provide the details for your loan request
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs
                value={selectedTab}
                onValueChange={handleTabChange}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="regular">Regular Loan</TabsTrigger>
                  <TabsTrigger value="special">Special Loan</TabsTrigger>
                </TabsList>
                <TabsContent value="regular" className="mt-4">
                  <div className="bg-muted/50 p-4 rounded-md flex gap-4 items-start">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">
                        Regular Loan Details
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {LOAN_TYPES.regular.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground">
                            Maximum Amount
                          </p>
                          <p className="font-medium">
                            {formatCurrency(LOAN_TYPES.regular.maxAmount)}
                          </p>
                        </div>
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground">
                            Interest Rate
                          </p>
                          <p className="font-medium">
                            {LOAN_TYPES.regular.interestRate}
                          </p>
                        </div>
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground">Term</p>
                          <p className="font-medium">
                            {LOAN_TYPES.regular.term}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="special" className="mt-4">
                  <div className="bg-muted/50 p-4 rounded-md flex gap-4 items-start">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">
                        Special Loan Details
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {LOAN_TYPES.special.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground">
                            Maximum Amount
                          </p>
                          <p className="font-medium">
                            {formatCurrency(LOAN_TYPES.special.maxAmount)}
                          </p>
                        </div>
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground">
                            Interest Rate
                          </p>
                          <p className="font-medium">
                            {LOAN_TYPES.special.interestRate}
                          </p>
                        </div>
                        <div className="bg-background rounded p-2">
                          <p className="text-xs text-muted-foreground">Term</p>
                          <p className="font-medium">
                            {LOAN_TYPES.special.term}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Loan Amount
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground inline ml-1" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enter the amount you wish to borrow</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              min={100}
                              max={
                                selectedTab === "regular"
                                  ? LOAN_TYPES.regular.maxAmount
                                  : LOAN_TYPES.special.maxAmount
                              }
                              step={100}
                              className="pl-10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter an amount between {formatCurrency(100)} and{" "}
                          {formatCurrency(
                            selectedTab === "regular"
                              ? LOAN_TYPES.regular.maxAmount
                              : LOAN_TYPES.special.maxAmount
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regular">
                              Regular Loan
                            </SelectItem>
                            <SelectItem value="special">
                              Special Loan
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of loan that best fits your needs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-sm">
                    <p className="font-medium text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Important Information
                    </p>
                    <p className="mt-2 text-amber-700">
                      By submitting this application, you agree to the terms and
                      conditions of the loan. Your application will be reviewed
                      by our team, and you will be notified of the decision.
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Validation Error
            </DialogTitle>
            <DialogDescription>
              We found an issue that needs your attention before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-4 py-4">
            <div className="rounded-full bg-red-100 p-2 flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium">Error Details</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>

              <div className="mt-4 bg-muted/50 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Quick Fix:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Ensure the loan amount is within the allowed range</li>
                  <li>Check that you've selected the correct loan type</li>
                  <li>Verify all required fields are completed</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={() => setErrorDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setErrorDialogOpen(false)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Got it"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
