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
      founderId, name, shortDescription, fullDescription,
      category, sector, fundingGoal, equityOffered,
      amountAlreadyRaised, country, website, twitter,
      stage, tier, logoUrl, bannerUrl,
    } = body;

    if (!founderId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        amount_raised: amountAlreadyRaised || 0,
        amount_already_raised: amountAlreadyRaised || 0,
        country,
        website: website || null,
        twitter: twitter || null,
        stage: stage || "idea",
        tier: tier || "free",
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        is_published: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-add founder as team member
    await supabase.from("team_members").insert({
      project_id: data.id,
      user_id: founderId,
      role: "owner",
      invited_by: founderId,
    });

    return NextResponse.json({ project: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}