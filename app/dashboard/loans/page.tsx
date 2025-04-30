import { UserLoansTable } from "./_components/user-loans-table";
import { getSelfLoans } from "@/lib/supabase/server-extended/loans";

export default async function LoansPage() {
  const loans = await getSelfLoans();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Loans</h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <UserLoansTable loans={loans} />
      </div>
    </div>
  );
}
