import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin only
    if (user.email !== "admin@golfcharity.com") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all users from auth - we'll use the scores/subscriptions tables to get user info
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, is_active, plan_type, created_at");

    const { data: scores } = await supabase
      .from("scores")
      .select("user_id");

    // Get unique user IDs from subscriptions and scores
    const userIdSet = new Set<string>();
    subscriptions?.forEach(s => userIdSet.add(s.user_id));
    scores?.forEach(s => userIdSet.add(s.user_id));

    const users = Array.from(userIdSet).map(uid => {
      const sub = subscriptions?.find(s => s.user_id === uid);
      const scoreCount = scores?.filter(s => s.user_id === uid).length || 0;
      return {
        id: uid,
        is_active: sub?.is_active || false,
        plan_type: sub?.plan_type || "none",
        score_count: scoreCount,
        joined: sub?.created_at || null,
      };
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
