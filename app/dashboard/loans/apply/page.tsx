"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RequestLoan } from "@/lib/supabase/server-extended/loans";

export default function LoanApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [loanType, setLoanType] = useState<"regular" | "special">("regular");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await RequestLoan({
        amount,
        loan_type: loanType,
      });
      setSuccess(true);
      setAmount(0);
      setLoanType("regular");
    } catch (err: any) {
      setError(err.message || "Failed to apply for loan");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">You must be logged in to apply for a loan.</div>;
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-emerald-700">Apply for a Loan</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            min="100"
            step="100"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full border border-emerald-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Loan Type</label>
          <select
            value={loanType}
            onChange={e => setLoanType(e.target.value as any)}
            className="w-full border border-emerald-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="regular loan">Regular Loan</option>
            <option value="special loan">Special Loan</option>
          </select>
        </div>
        <Button type="submit" className="w-full bg-emerald-500" disabled={loading}>
          {loading ? "Submitting..." : "Apply"}
        </Button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">Loan request submitted successfully!</div>}
      </form>
    </div>
  );
}
