import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      founderId,
      name,
      shortDescription,
      fullDescription,
      category,
      sector,
      fundingGoal,
      equityOffered,
      country,
      tier,
    } = body;

    if (!founderId || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        founder_id: founderId,
        name,
        short_description: shortDescription,
        full_description: fullDescription,
        category,
        sector,
        funding_goal: fundingGoal,
        equity_offered: equityOffered,
        country,
        tier: tier || "free",
        is_published: true,
        amount_raised: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ project: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}