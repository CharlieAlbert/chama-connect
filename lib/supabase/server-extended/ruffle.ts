"use server";

import { createClient } from "../server";
import { Database } from "../types";

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  avatar_url?: string;
}

/**
 * Get current raffle settings
 */
export async function getRaffleSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("raffle_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  // If no settings exist, create default ones
  if (error?.code === "PGRST116" || !data || data.length === 0) {
    const { data: newSettings, error: createError } = await supabase
      .from("raffle_settings")
      .insert({
        winners_per_period: 2, // Default number of winners
        active: true, // System is active by default
      })
      .select()
      .single();

    if (createError) {
      throw new Error(
        `Failed to create default raffle settings: ${createError.message}`
      );
    }

    return newSettings;
  }

  if (error) {
    throw new Error(`Failed to fetch raffle settings: ${error}`);
  }

  return data[0];
}

/**
 * Get the current active raffle cycle or create one if none exists
 */
export async function getCurrentRaffleCycle() {
  const supabase = await createClient();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  // Get current quarter (0-3)
  const currentQuarter = Math.floor(currentDate.getMonth() / 4);
  // Get the start month of the quarter (0, 4, 8)
  const startMonth = currentQuarter * 4;

  // Check if we have a cycle for the current quarter
  const { data: existingCycle, error: fetchError } = await supabase
    .from("raffle_cycles")
    .select("*")
    .eq("year", currentYear)
    .gte("month", startMonth)
    .lt("month", startMonth + 4)
    .order("month", { ascending: true });

  if (fetchError)
    throw new Error(`Failed to fetch raffle cycle: ${fetchError.message}`);

  // If we have active cycles for this quarter, return the earliest one that's not completed
  const activeCycle = existingCycle?.find((cycle) => !cycle.is_completed);
  if (activeCycle) return activeCycle;

  // If no active cycle exists for the current month, create one
  const currentMonth = currentDate.getMonth();

  // Since we're not fetching users, we'll create a new cycle with empty arrays
  // The eligible_users should be populated separately or already exist
  const { data: newCycle, error: createError } = await supabase
    .from("raffle_cycles")
    .insert({
      year: currentYear,
      month: currentMonth,
      eligible_users: [], // Empty array, to be populated separately
      drawn_users: [],
      winners_count: 0,
      is_completed: false,
    })
    .select()
    .single();

  if (createError)
    throw new Error(`Failed to create raffle cycle: ${createError.message}`);
  return newCycle;
}

// Helper function to add eligible users to a cycle with deduplication
export async function addEligibleUsersToCycle(
  cycleId: string,
  users: UserProfile[]
) {
  const supabase = await createClient();

  // First get the current cycle
  const { data: cycle, error: fetchError } = await supabase
    .from("raffle_cycles")
    .select("eligible_users")
    .eq("id", cycleId)
    .single();

  if (fetchError)
    throw new Error(`Failed to fetch cycle: ${fetchError.message}`);

  // Create a set of user IDs for deduplication
  const existingUserIds = new Set(
    (cycle.eligible_users || []).map((user: UserProfile) => user.id)
  );

  // Filter out duplicate users
  const newUsers = users.filter((user) => !existingUserIds.has(user.id));

  // Combine existing and new users
  const updatedEligibleUsers = [...(cycle.eligible_users || []), ...newUsers];

  // Update the cycle
  const { error: updateError } = await supabase
    .from("raffle_cycles")
    .update({
      eligible_users: updatedEligibleUsers,
    })
    .eq("id", cycleId);

  if (updateError)
    throw new Error(`Failed to update eligible users: ${updateError.message}`);

  return { success: true, addedUsers: newUsers.length };
}

/**
 * Draw winners for the current month's raffle
 */
export async function drawRaffleWinners() {
  const supabase = await createClient();
  // Get the current settings
  const settings = await getRaffleSettings();
  if (!settings.active) {
    throw new Error("Raffle system is currently disabled");
  }

  // Get or create the current cycle
  const currentCycle = await getCurrentRaffleCycle();

  if (currentCycle.is_completed) {
    throw new Error("Raffle cycle is already completed");
  }

  // Parse the eligible and drawn users
  const eligibleUsers = currentCycle.eligible_users as UserProfile[];
  const drawnUsers = currentCycle.drawn_users as UserProfile[];

  // Filter out users that have already been drawn in this cycle
  const drawnUserIds = drawnUsers.map((user) => user.id);
  const remainingEligible = eligibleUsers.filter(
    (user) => !drawnUserIds.includes(user.id)
  );

  if (remainingEligible.length < settings.winners_per_period) {
    throw new Error(
      `Not enough eligible users for drawing. Need ${settings.winners_per_period} but only have ${remainingEligible.length}`
    );
  }

  // Shuffle the eligible users
  const shuffled = [...remainingEligible].sort(() => Math.random() - 0.5);

  // Take the required number of winners
  const newWinners = shuffled.slice(0, settings.winners_per_period);

  // Update the drawn users in the cycle
  const updatedDrawnUsers = [...drawnUsers, ...newWinners];
  const newWinnersCount = currentCycle.winners_count + newWinners.length;

  // Check if this completes the cycle (all 4 months done)
  const drawingDate = new Date();
  const isCompleted =
    newWinnersCount >= settings.winners_per_period * 4 ||
    updatedDrawnUsers.length >= eligibleUsers.length;

  // Update the cycle
  const { error: updateError } = await supabase
    .from("raffle_cycles")
    .update({
      drawn_users: updatedDrawnUsers,
      winners_count: newWinnersCount,
      is_completed: isCompleted,
      drawing_date: drawingDate.toISOString(),
    })
    .eq("id", currentCycle.id);

  if (updateError)
    throw new Error(`Failed to update raffle cycle: ${updateError.message}`);

  // Create raffle winners records
  const rafflePeriod = new Date(currentCycle.year, currentCycle.month, 1)
    .toISOString()
    .split("T")[0];

  // Determine reward amounts (simplified example, adjust as needed)
  const winnerInserts = newWinners.map((winner, index) => ({
    raffle_period: rafflePeriod,
    user_id: winner.id,
    position: index + 1,
    amount: index === 0 ? 100.0 : 50.0, // First place gets more
    payment_status: "pending",
  }));

  const { error: winnersError } = await supabase
    .from("raffle_winners")
    .insert(winnerInserts);

  if (winnersError)
    throw new Error(`Failed to insert raffle winners: ${winnersError.message}`);

  return {
    cycle: {
      ...currentCycle,
      drawn_users: updatedDrawnUsers,
      winners_count: newWinnersCount,
      is_completed: isCompleted,
    },
    newWinners,
  };
}

/**
 * Get winners for a specific raffle period
 */
export async function getRaffleWinners(year: number, month: number) {
  const supabase = await createClient();
  // First, get the cycle
  const { data: cycle, error: cycleError } = await supabase
    .from("raffle_cycles")
    .select("*")
    .eq("year", year)
    .eq("month", month);

  // Handle the case where no cycle exists
  if (!cycle) {
    return {
      winners: [],
      message: "No raffle cycle found for the selected period.",
    };
  }

  // Only throw errors for unexpected database issues
  if (cycleError) {
    console.error("Database error fetching raffle cycle:", cycleError);
    throw new Error(`Failed to fetch raffle cycle: ${cycleError}`);
  }

  // Format the raffle period date
  const rafflePeriod = new Date(year, month, 1).toISOString().split("T")[0];

  // Get the winners with their user data
  const { data: winners, error: winnersError } = await supabase
    .from("raffle_winners")
    .select(
      `
      id,
      position,
      amount,
      payment_status,
      payment_date,
      users (
        id,
        name,
        phone,
        email,
        role,
        avatar_url
      )
    `
    )
    .eq("raffle_period", rafflePeriod)
    .order("position", { ascending: true });

  if (winnersError)
    throw new Error(`Failed to fetch raffle winners: ${winnersError.message}`);

  return {
    cycle,
    winners: winners || [],
  };
}

/**
 * Update payment status for a winner
 */
export async function updateWinnerPaymentStatus(
  winnerId: string,
  status: "pending" | "paid"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("raffle_winners")
    .update({
      payment_status: status,
      payment_date: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", winnerId);

  if (error)
    throw new Error(`Failed to update winner payment status: ${error.message}`);

  return { success: true };
}

/**
 * Update raffle settings
 */
export async function updateRaffleSettings(
  winners_per_period: number,
  active: boolean
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("raffle_settings")
    .update({
      winners_per_period,
      active,
    })
    .eq("id", (await getRaffleSettings()).id)
    .select()
    .maybeSingle();

  if (error)
    throw new Error(`Failed to update raffle settings: ${error.message}`);
  return data;
}

/**
 * Get raffle statistics
 */
export async function getRaffleStatistics() {
  const supabase = await createClient();
  // Get total winners
  const { count: totalWinners, error: winnersError } = await supabase
    .from("raffle_winners")
    .select("*", { count: "exact", head: true });

  if (winnersError)
    throw new Error(`Failed to fetch total winners: ${winnersError.message}`);

  // Get total paid amount
  const { data: paymentData, error: paymentError } = await supabase
    .from("raffle_winners")
    .select("amount")
    .eq("payment_status", "paid");

  if (paymentError)
    throw new Error(`Failed to fetch payment data: ${paymentError.message}`);

  const totalPaid =
    paymentData?.reduce(
      (sum, winner) => sum + parseFloat(winner.amount.toString()),
      0
    ) || 0;

  // Get cycles data
  const { data: cyclesData, error: cyclesError } = await supabase
    .from("raffle_cycles")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (cyclesError)
    throw new Error(`Failed to fetch cycles data: ${cyclesError.message}`);

  return {
    totalWinners,
    totalPaid,
    totalCycles: cyclesData?.length || 0,
    completedCycles:
      cyclesData?.filter((cycle) => cycle.is_completed).length || 0,
    recentCycles: cyclesData?.slice(0, 5) || [],
  };
}
