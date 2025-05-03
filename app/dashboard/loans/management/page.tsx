import { getAllLoansWithUsers } from "@/lib/supabase/server-extended/loans";
import { recordLoanRepayment } from "@/lib/supabase/server-extended/governance";
import RecordRepaymentForm from "../_components/record-loan-repayments";

export default async function LoanManagementPage() {
  // Fetch all loans for repayments (with user info)
  const allLoans = await getAllLoansWithUsers();
  // Fetch users for the repayment form (or get from allLoans)
  const users = allLoans.map((l) => l.users?.[0]).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Loan Repayments Management</h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Record Loan Repayment</h2>
        <RecordRepaymentForm
          users={users}
          loans={allLoans}
          recordLoanRepaymentAction={recordLoanRepayment}
        />
      </div>
    </div>
  );
}
