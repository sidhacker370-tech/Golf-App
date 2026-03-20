/**
 * Scores API Route
 *
 * GET  - Returns user's scores in reverse chronological order
 * POST - Adds a new score (1–45 range enforced)
 *
 * CRITICAL BUSINESS RULE (from PRD):
 * - Only the latest 5 scores are stored per user
 * - When adding a 6th score, the oldest is automatically deleted
 * - This ensures the draw system always compares against the user's
 *   most recent performance, not historical data
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PRD requirement: maximum 5 scores per user at any time
const MAX_SCORES = 5;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return scores in reverse chronological order (latest first) as per PRD
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ scores: data || [] });
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

    // Check subscription status — only active subscribers can add scores
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("is_active")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.is_active) {
      return NextResponse.json({ error: "Active subscription required to add scores" }, { status: 403 });
    }

    const body = await request.json();
    const score = parseInt(body.score);

    // Validate score range: 1–45 as per PRD
    if (isNaN(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });
    }

    // Ensure only last 5 scores are stored as per PRD requirement
    // Fetch existing scores ordered by oldest first to identify deletion candidates
    const { data: existingScores, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    // If we have MAX_SCORES or more, delete the oldest to make room
    // This maintains the sliding window of latest 5 scores
    if (existingScores && existingScores.length >= MAX_SCORES) {
      const scoresToDelete = existingScores.slice(0, existingScores.length - MAX_SCORES + 1);
      const idsToDelete = scoresToDelete.map(s => s.id);

      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new score with today's date
    const { data, error } = await supabase
      .from("scores")
      .insert({ user_id: user.id, score, date: new Date().toISOString().split("T")[0] })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ score: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
