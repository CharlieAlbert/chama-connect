"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WinnersList } from "./winners-list";
import { PastRaffles } from "./past-ruffles";

export function RaffleTabs() {
  const [activeTab, setActiveTab] = useState("current");

  return (
    <Tabs
      defaultValue="current"
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="current">Current Winners</TabsTrigger>
        <TabsTrigger value="past">Past Raffles</TabsTrigger>
      </TabsList>
      <TabsContent value="current" className="mt-6">
        <WinnersList />
      </TabsContent>
      <TabsContent value="past" className="mt-6">
        <PastRaffles />
      </TabsContent>
    </Tabs>
  );
}
