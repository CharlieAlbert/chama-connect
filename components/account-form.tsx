"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  AddAccountInput,
  ContributionStatus,
} from "@/lib/supabase/server-extended/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  DollarSign,
  Loader2,
  CreditCard,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import getCurrentMonth from "@/utils/currentMonth";

interface AccountFormProps {
  onSubmit: (input: AddAccountInput) => Promise<void>;
  users: { id: string; name: string; role?: string }[];
  loading?: boolean;
}

const formSchema = z.object({
  user_id: z.string({
    required_error: "Please select a user",
  }),
  contribution_month: z.string({
    required_error: "Please select a contribution month",
  }),
  amount: z
    .number({
      required_error: "Please enter an amount",
      invalid_type_error: "Amount must be a number",
    })
    .min(0, "Amount must be a positive number"),
  status: z.enum(["paid", "partial", "unpaid"], {
    required_error: "Please select the payment status",
  }),
  payment_method: z
    .string({
      required_error: "Please select the payment method used",
    })
    .min(1, "Payment method is required"),
  payment_proof: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AccountForm({
  onSubmit,
  users,
  loading: externalLoading,
}: AccountFormProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
      contribution_month: getCurrentMonth(),
      amount: 0,
      status: "unpaid",
      payment_method: "mpesa",
      payment_proof: "",
    },
  });

  const getStatusBadge = (status: ContributionStatus) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Partial
          </Badge>
        );
      case "unpaid":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200"
          >
            Unpaid
          </Badge>
        );
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setInternalLoading(true);
    try {
      // Ensure contribution_month is in YYYY-MM-01 format
      let contribution_month = values.contribution_month;
      if (/^\d{4}-\d{2}$/.test(contribution_month)) {
        contribution_month = `${contribution_month}-01`;
      }
      await onSubmit({ ...values, contribution_month });
      form.reset({
        user_id: "",
        contribution_month: getCurrentMonth(),
        amount: 0,
        status: "paid",
        payment_method: "mpesa",
        payment_proof: "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const selectedUser = users.find((u) => u.id === value);
                    if (selectedUser) {
                      field.onChange(selectedUser.id);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user">
                        {field.value
                          ? users.find((u) => u.id === field.value)?.name
                          : "Select a user"}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{user.name}</span>
                          {user.role && (
                            <Badge variant="outline" className="ml-2">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the user who made the contribution
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contribution_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Contribution Month
                </FormLabel>
                <FormControl>
                  <Input type="month" {...field} />
                </FormControl>
                <FormDescription>
                  Select the month for this contribution
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Amount
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>Enter the contribution amount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        {getStatusBadge("paid")}
                      </div>
                    </SelectItem>
                    <SelectItem value="partial">
                      <div className="flex items-center gap-2">
                        {getStatusBadge("partial")}
                      </div>
                    </SelectItem>
                    <SelectItem value="unpaid">
                      <div className="flex items-center gap-2">
                        {getStatusBadge("unpaid")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Indicate the payment status</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Method
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the payment method used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_proof"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="flex items-center gap-1">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  Payment Proof
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter payment reference, transaction ID, or other proof of payment..."
                    className="min-h-[100px] resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Provide transaction details or reference numbers as proof of
                  payment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading || !form.formState.isValid}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Record"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
