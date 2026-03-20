/**
 * Draws API Route
 *
 * GET  - Returns latest 5 draws
 * POST - Triggers a new draw (admin only)
 *
 * DRAW LOGIC (simplified for MVP):
 * 1. Generate 5 unique random numbers between 1–45
 * 2. Compare each user's stored scores against draw numbers
 * 3. Count matches per user:
 *    - 3 matches → $50  (small win)
 *    - 4 matches → $500 (medium win)
 *    - 5 matches → $10,000 (jackpot)
 * 4. Store winners in the database
 *
 * NOTE: Simplified draw logic uses random generation instead of a
 * weighted algorithm. In production, this would use a cryptographically
 * secure random number generator and additional validation.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Prize tiers based on match count
const PRIZE_AMOUNTS: Record<number, number> = {
  3: 50,    // Small win
  4: 500,   // Medium win
  5: 10000, // Jackpot
};

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ draws: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin-only access check (hardcoded for MVP simplicity)
    if (user.email !== "admin@golfcharity.com") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Step 1: Generate 5 unique random numbers between 1 and 45
    const numbers: number[] = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);

    // Step 2: Insert draw record
    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert({ numbers, draw_date: new Date().toISOString().split("T")[0] })
      .select()
      .single();

    if (drawError) return NextResponse.json({ error: drawError.message }, { status: 500 });

    // Step 3: Fetch ALL users' scores for comparison
    const { data: allScores, error: scoresError } = await supabase
      .from("scores")
      .select("user_id, score");

    if (scoresError) return NextResponse.json({ error: scoresError.message }, { status: 500 });

    // Group scores by user for efficient comparison
    const userScores: Record<string, number[]> = {};
    allScores?.forEach(s => {
      if (!userScores[s.user_id]) userScores[s.user_id] = [];
      userScores[s.user_id].push(s.score);
    });

    // Step 4: Compare each user's scores against draw numbers
    // A "match" occurs when a user's score equals one of the draw numbers
    const winners: Array<{ user_id: string; match_count: number; amount: number; draw_id: string }> = [];

    for (const [userId, scores] of Object.entries(userScores)) {
      const matchCount = scores.filter(s => numbers.includes(s)).length;
      // Only record wins for 3+ matches
      if (matchCount >= 3) {
        winners.push({
          user_id: userId,
          match_count: matchCount,
          amount: PRIZE_AMOUNTS[matchCount] || 0,
          draw_id: draw.id,
        });
      }
    }

    // Step 5: Insert winners into database
    if (winners.length > 0) {
      const { error: winnersError } = await supabase
        .from("winners")
        .insert(winners.map(w => ({ ...w, status: "pending" })));

      if (winnersError) return NextResponse.json({ error: winnersError.message }, { status: 500 });
    }

    return NextResponse.json({
      draw,
      winnersCount: winners.length,
      winners,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
