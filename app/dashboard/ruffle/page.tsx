import { Suspense } from "react";
import { RaffleSettings } from "./components/ruffle-settings";
import { CurrentCycle } from "./components/current-cycle";
import { RaffleTabs } from "./components/ruffle-tabs";
import { WinnersList } from "./components/winners-list";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getCurrentRaffleCycle, 
  getCurrentWinners 
} from "@/lib/supabase/server-extended/ruffle";

interface Winner {
  id: string;
  position: number;
  amount: number;
  payment_status: "pending" | "paid";
  payment_date: string | null;
  users: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default async function RafflePage() {
  const initialCycle = await getCurrentRaffleCycle();
  const { winners: rawWinners = [] } = await getCurrentWinners();
  
  const winners: Winner[] = rawWinners.map((winner: any) => {
    // The users field is an array in the database, but the component expects an object
    const userData = winner.users && Array.isArray(winner.users) ? winner.users[0] : winner.users;
    
    return {
      id: winner.id,
      position: winner.position,
      amount: winner.amount,
      payment_status: winner.payment_status,
      payment_date: winner.payment_date,
      users: {
        id: userData?.id || "",
        name: userData?.name || "",
        email: userData?.email || "",
        avatar_url: userData?.avatar_url || null,
      }
    };
  });
  
  return (
    <div className="container p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Raffle Management</h1>
        <p className="text-muted-foreground">
          Manage raffle cycles, draw winners, and track payments
        </p>
      </div>

      {/* Top row: Cycle and Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <CurrentCycle initialCycle={initialCycle} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <RaffleSettings />
        </Suspense>
      </div>
      
      {/* Winners Section */}
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <WinnersList initialWinners={winners} />
        </Suspense>
      </div>
      
      {/* Tabs for additional functionality */}
      <div className="mt-8">
        <RaffleTabs />
      </div>
    </div>
  );
}
