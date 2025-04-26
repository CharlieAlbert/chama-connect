"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, CheckCircle2, User } from "lucide-react";
import { getRaffleWinners } from "@/lib/supabase/server-extended/ruffle";
import Image from "next/image";

export function PastRaffles() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [winners, setWinners] = useState<any[]>([]);
  const [cycle, setCycle] = useState<any>(null);

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

  // Generate years (current year and 2 years back)
  const years = Array.from(
    { length: 3 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    loadWinners();
  }, [selectedYear, selectedMonth]);

  const loadWinners = async () => {
    try {
      setIsLoading(true);
      const result = await getRaffleWinners(selectedYear, selectedMonth);
      setWinners(result.winners || []);
      setCycle(result.cycle);
    } catch (error) {
      toast("Failed to load winners");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Raffle Winners</CardTitle>
        <CardDescription>
          View winners from previous raffle cycles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-40">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) =>
                setSelectedMonth(Number.parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={loadWinners} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {winners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Winners Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no winners for the selected period.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Winner</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
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
                      <p>
                        {winner.users.name}
                      </p>
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
                  <TableCell>Ksh{" "}{winner.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        winner.payment_status === "paid"
                          ? "default"
                          : "secondary"
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
