"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Trophy, User } from "lucide-react";
import { updateWinnerPaymentStatus } from "@/lib/supabase/server-extended/ruffle";

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

interface WinnersListProps {
  initialWinners?: Winner[];
}

export function WinnersList({ initialWinners = [] }: WinnersListProps) {
  const router = useRouter();
  const [winners, setWinners] = useState<Winner[]>(initialWinners);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdatePaymentStatus = async (
    winnerId: string,
    status: "pending" | "paid"
  ) => {
    try {
      setLoadingId(winnerId);
      await updateWinnerPaymentStatus(winnerId, status);

      // Update local state
      setWinners(
        winners.map((winner) =>
          winner.id === winnerId
            ? {
                ...winner,
                payment_status: status,
                payment_date:
                  status === "paid" ? new Date().toISOString() : null,
              }
            : winner
        )
      );

      toast(`Payment status has been updated to ${status}.`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payment status"
      );
    } finally {
      setLoadingId(null);
    }
  };

  if (winners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Winners</CardTitle>
          <CardDescription>
            Winners from the current raffle cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Winners Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Use the "Draw Winners" button to select winners for this cycle.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Winners</CardTitle>
        <CardDescription>Winners from the current raffle cycle</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Winner</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners.map((winner) => (
              <TableRow key={winner.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {winner.users.avatar_url ? (
                      <Image
                        src={winner.users.avatar_url || "/placeholder.svg"}
                        alt={`${winner.users.name}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p>{winner.users.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {winner.users.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={winner.position === 1 ? "default" : "outline"}
                  >
                    #{winner.position}
                  </Badge>
                </TableCell>
                <TableCell>KES{winner.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      winner.payment_status === "paid" ? "default" : "outline"
                    }
                  >
                    {winner.payment_status === "paid" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid
                      </span>
                    ) : (
                      "Pending"
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {winner.payment_status === "pending" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdatePaymentStatus(winner.id, "paid")
                      }
                      disabled={loadingId === winner.id}
                    >
                      {loadingId === winner.id ? "Updating..." : "Mark as Paid"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdatePaymentStatus(winner.id, "pending")
                      }
                      disabled={loadingId === winner.id}
                    >
                      {loadingId === winner.id
                        ? "Updating..."
                        : "Mark as Pending"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
