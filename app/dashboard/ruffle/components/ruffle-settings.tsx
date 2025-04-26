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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getRaffleSettings,
  updateRaffleSettings,
} from "@/lib/supabase/server-extended/ruffle";

interface RaffleSettingsProps {
  initialSettings?: {
    id: string;
    winners_per_period: number;
    active: boolean;
  };
}

export function RaffleSettings({ initialSettings }: RaffleSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(
    initialSettings || {
      id: "",
      winners_per_period: 2,
      active: true,
    }
  );

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      await updateRaffleSettings(settings.winners_per_period, settings.active);
      toast("Ruffle settings have been updates successfully");
      router.refresh();
    } catch (error) {
      toast("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raffle Settings</CardTitle>
        <CardDescription>Configure how the raffle system works</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="raffle-status">Raffle System Status</Label>
            <Switch
              id="raffle-status"
              checked={settings.active}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, active: checked })
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {settings.active
              ? "The raffle system is currently active"
              : "The raffle system is currently disabled"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="winners-count">Winners Per Period</Label>
          <Input
            id="winners-count"
            type="number"
            min={1}
            max={10}
            value={settings.winners_per_period}
            onChange={(e) =>
              setSettings({
                ...settings,
                winners_per_period: Number.parseInt(e.target.value) || 1,
              })
            }
          />
          <p className="text-sm text-muted-foreground">
            Number of winners to draw each month
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export async function RaffleSettingsServer() {
  const settings = await getRaffleSettings();
  return <RaffleSettings initialSettings={settings} />;
}
