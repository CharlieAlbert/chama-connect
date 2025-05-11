import { getAccountDetails } from "@/lib/supabase/server-extended/accounts";
import { getUsers } from "@/lib/supabase/server-extended/governance";
import { Suspense } from "react";
import type { Account } from "@/lib/supabase/server-extended/accounts";
import { FinancesClient } from "./finances-client";

// Server Component for data fetching
export default async function FinancesPage() {
  // Fetch data on the server for better performance and SEO
  const accountsPromise = getAccountDetails();
  const usersPromise = getUsers();

  // Wait for both promises to resolve
  const [accounts, users] = await Promise.all([accountsPromise, usersPromise]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Financial Tracking</h1>

      <Suspense
        fallback={<div className="text-center py-4">Loading accounts...</div>}
      >
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <FinancesClient
            initialAccounts={accounts as Account[]}
            users={users}
          />
        </div>
      </Suspense>
    </div>
  );
}
