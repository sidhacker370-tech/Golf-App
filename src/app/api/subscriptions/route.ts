/**
 * Subscriptions API Route
 *
 * GET  - Returns current user's subscription status
 * POST - Creates or activates a subscription
 *
 * NOTE: Payment integration intentionally simplified for MVP.
 * In production, this would integrate with Stripe or similar
 * payment processor before activating the subscription.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // PGRST116 = no rows found, which is valid (user hasn't subscribed yet)
    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription: data || null });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const planType = body.plan_type || "monthly";

    // Check if subscription already exists (upsert pattern)
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // Reactivate existing subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .update({ is_active: true, plan_type: planType })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ subscription: data });
    }

    // Create new subscription — immediately active (no payment for MVP)
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ user_id: user.id, plan_type: planType, is_active: true })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ subscription: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
