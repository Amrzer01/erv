import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount, LoyaltySyncResult, LoyaltyTier } from "./types";

/**
 * Calculate loyalty tier based on bookings and time period
 * Silver: First booking
 * Gold: 3 bookings within 6 months
 * Platinum: 5 bookings AND high rating (pending)
 */
function calculateLoyaltyTier(bookings: any[]): LoyaltyTier {
  if (bookings.length === 0) return "Silver";

  // Check for Gold: 3 bookings within 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.trip_date || booking.created_at);
    return bookingDate >= sixMonthsAgo;
  });

  if (recentBookings.length >= 3) {
    // Check for Platinum: 5 bookings total AND high rating
    // Rating system doesn't exist yet, so we can't auto-promote to Platinum
    // Customers with 5+ bookings will stay at Gold until rating system is implemented
    if (bookings.length >= 5) {
      // Could promote to Platinum if rating system existed
      // For now, return Gold with a note that rating is pending
      return "Gold";
    }
    return "Gold";
  }

  return "Silver";
}

/**
 * Sync a single customer's loyalty account
 */
async function syncCustomerLoyalty(phone: string): Promise<LoyaltyAccount | null> {
  // Fetch all bookings for this phone
  const { data: bookings, error: bookingsError } = await supabase
    .from("clients")
    .select("*")
    .eq("phone", phone)
    .order("created_at", { ascending: false });

  if (bookingsError) {
    console.error(`Error fetching bookings for phone ${phone}:`, bookingsError);
    return null;
  }

  if (!bookings || bookings.length === 0) {
    // No bookings, delete loyalty account if exists
    await supabase.from("loyalty_accounts").delete().eq("phone", phone);
    return null;
  }

  // Calculate loyalty statistics
  const latestBooking = bookings[0];
  const bookingsCount = bookings.length;
  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
  const totalPoints = totalSpent; // 1 SAR = 1 point
  const lastTripDate =
    bookings
      .map((b) => b.trip_end_date)
      .filter((date): date is string => date !== null)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;

  const loyaltyTier = calculateLoyaltyTier(bookings);

  // Check if loyalty account exists
  const { data: existingAccount } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  let result: LoyaltyAccount;

  if (existingAccount) {
    // Preserve existing fields
    const spent_points = existingAccount.spent_points || 0;
    const google_review_bonus = existingAccount.google_review_bonus || 0;
    const welcome_bonus = existingAccount.welcome_bonus || 0;
    const referral_points = existingAccount.referral_points || 0;
    const referral_count = existingAccount.referral_count || 0;
    const monthly_winner = existingAccount.monthly_winner || false;

    const available_points = totalPoints - spent_points + google_review_bonus + welcome_bonus + referral_points;

    // Update existing account
    const { data, error } = await supabase
      .from("loyalty_accounts")
      .update({
        customer_name: latestBooking.customer_name,
        bookings_count: bookingsCount,
        total_spent: totalSpent,
        total_points: totalPoints,
        available_points,
        loyalty_tier: loyaltyTier,
        last_trip_date: lastTripDate,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingAccount.id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating loyalty account for phone ${phone}:`, error);
      return null;
    }
    result = data;
  } else {
    // Create new account
    const available_points = totalPoints;

    const { data, error } = await supabase
      .from("loyalty_accounts")
      .insert({
        customer_name: latestBooking.customer_name,
        phone,
        bookings_count: bookingsCount,
        total_spent: totalSpent,
        total_points: totalPoints,
        spent_points: 0,
        available_points,
        loyalty_tier: loyaltyTier,
        last_trip_date: lastTripDate,
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating loyalty account for phone ${phone}:`, error);
      return null;
    }
    result = data;
  }

  return result;
}

/**
 * Sync all loyalty accounts from clients table
 * This is idempotent - running multiple times will not duplicate data
 */
export async function syncAllLoyaltyAccounts(): Promise<LoyaltySyncResult> {
  const result: LoyaltySyncResult = {
    synced: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  try {
    // Fetch all unique phone numbers from clients
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("phone")
      .not("phone", "is", null);

    if (clientsError) {
      result.errors.push(`Failed to fetch clients: ${clientsError.message}`);
      return result;
    }

    if (!clients || clients.length === 0) {
      return result;
    }

    // Get unique phone numbers
    const uniquePhones = [...new Set(clients.map((c) => c.phone))];

    // Sync each customer
    for (const phone of uniquePhones) {
      try {
        const existingAccount = await supabase.from("loyalty_accounts").select("id").eq("phone", phone).single();

        const syncedAccount = await syncCustomerLoyalty(phone);

        if (syncedAccount) {
          result.synced++;
          if (existingAccount.data) {
            result.updated++;
          } else {
            result.created++;
          }
        }
      } catch (error) {
        result.errors.push(
          `Failed to sync phone ${phone}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Clean up loyalty accounts with no corresponding bookings
    const { data: orphanedAccounts } = await supabase.from("loyalty_accounts").select("phone");

    if (orphanedAccounts) {
      for (const account of orphanedAccounts) {
        const { data: hasBooking } = await supabase.from("clients").select("id").eq("phone", account.phone).single();

        if (!hasBooking) {
          await supabase.from("loyalty_accounts").delete().eq("phone", account.phone);
        }
      }
    }
  } catch (error) {
    result.errors.push(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return result;
}

/**
 * Sync loyalty account for a specific phone number
 * Use this after booking insert/update/delete
 */
export async function syncLoyaltyForPhone(phone: string): Promise<LoyaltyAccount | null> {
  return syncCustomerLoyalty(phone);
}
