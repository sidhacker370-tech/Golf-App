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
      .from("user_charity_selections")
      .select("*, charities(*)")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ selection: data || null });
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
    const charityId = body.charity_id;

    if (!charityId) {
      return NextResponse.json({ error: "charity_id is required" }, { status: 400 });
    }

    // Upsert the selection (user can only have one)
    const { data: existing } = await supabase
      .from("user_charity_selections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("user_charity_selections")
        .update({ charity_id: charityId })
        .eq("user_id", user.id)
        .select("*, charities(*)")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ selection: data });
    }

    const { data, error } = await supabase
      .from("user_charity_selections")
      .insert({ user_id: user.id, charity_id: charityId })
      .select("*, charities(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ selection: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
