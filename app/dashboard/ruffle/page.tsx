import { Suspense } from "react";
import { RaffleSettings } from "./components/ruffle-settings";
import { CurrentCycle } from "./components/current-cycle";
import { RaffleTabs } from "./components/ruffle-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentRaffleCycle } from "@/lib/supabase/server-extended/ruffle";

export default async function RafflePage() {
  const initialCycle = await getCurrentRaffleCycle();
  return (
    <div className="container p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Raffle Management</h1>
        <p className="text-muted-foreground">
          Manage raffle cycles, draw winners, and track payments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <RaffleSettings />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <CurrentCycle initialCycle={initialCycle} />
        </Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <RaffleTabs />
      </Suspense>
    </div>
  );
}
