"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trophy } from "lucide-react";

import {
  getCurrentRaffleCycle,
  drawRaffleWinners,
} from "@/lib/supabase/server-extended/ruffle";

interface CurrentCycleProps {
  initialCycle?: {
    id: string;
    year: number;
    month: number;
    eligible_users: any[];
    drawn_users: any[];
    winners_count: number;
    is_completed: boolean;
    drawing_date?: string;
  };
}

export function CurrentCycle({ initialCycle }: CurrentCycleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cycle, setCycle] = useState(initialCycle);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDrawWinners = async () => {
    try {
      setIsLoading(true);
      const result = await drawRaffleWinners();
      setCycle(result.cycle);
      toast(`Successfully drew ${result.newWinners.length} new winners.`);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to draw winners");
    } finally {
      setIsLoading(false);
    }
  };

  if (!cycle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Raffle Cycle</CardTitle>
          <CardDescription>
            Loading current cycle information...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Raffle Cycle
          {cycle.is_completed && (
            <Badge variant="outline" className="ml-2">
              Completed
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {monthNames[cycle.month]} {cycle.year}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cycle.is_completed ? (
          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertTitle>Cycle Completed</AlertTitle>
            <AlertDescription>
              This raffle cycle has been completed. All winners have been drawn.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Eligible Users</p>
                <p className="text-2xl font-bold">
                  {cycle.eligible_users?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Winners Drawn</p>
                <p className="text-2xl font-bold">{cycle.winners_count || 0}</p>
              </div>
            </div>

            {cycle.drawing_date && (
              <div>
                <p className="text-sm font-medium">Last Drawing</p>
                <p className="text-sm">
                  {new Date(cycle.drawing_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleDrawWinners}
          disabled={isLoading || cycle.is_completed}
          className="w-full"
        >
          {isLoading ? "Drawing..." : "Draw Winners"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export async function CurrentCycleServer() {
  const cycle = await getCurrentRaffleCycle();
  return <CurrentCycle initialCycle={cycle} />;
}
