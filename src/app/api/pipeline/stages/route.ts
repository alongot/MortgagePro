import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/pipeline/stages - Get all pipeline stages with cards
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get stages
  const { data: stages, error: stagesError } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (stagesError) {
    console.error("Stages query error:", stagesError);
    return NextResponse.json({ error: stagesError.message }, { status: 500 });
  }

  // Get cards with lead details
  const { data: cards, error: cardsError } = await supabase
    .from("pipeline_cards")
    .select(
      `
      *,
      lead:leads(
        *,
        property:properties(*),
        owner:owners(*),
        mortgage:mortgage_records(*)
      )
    `
    )
    .in(
      "stage_id",
      (stages || []).map((s) => s.id)
    )
    .order("position", { ascending: true });

  if (cardsError) {
    console.error("Cards query error:", cardsError);
    return NextResponse.json({ error: cardsError.message }, { status: 500 });
  }

  // Transform cards
  const transformedCards = (cards || []).map((card) => ({
    ...card,
    lead: card.lead
      ? {
          ...card.lead,
          mortgage: Array.isArray(card.lead.mortgage)
            ? card.lead.mortgage[0]
            : card.lead.mortgage,
        }
      : null,
  }));

  // Group cards by stage
  const stagesWithCards = (stages || []).map((stage) => ({
    ...stage,
    cards: transformedCards.filter((c) => c.stage_id === stage.id),
  }));

  return NextResponse.json(stagesWithCards);
}

// POST /api/pipeline/stages - Create a new stage
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, color, position } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    // Get max position if not provided
    let newPosition = position;
    if (newPosition === undefined) {
      const { data: maxStage } = await supabase
        .from("pipeline_stages")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      newPosition = (maxStage?.position ?? -1) + 1;
    }

    const { data, error } = await supabase
      .from("pipeline_stages")
      .insert({
        user_id: user.id,
        name,
        color: color || "#3b82f6",
        position: newPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("Create stage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("Create stage error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
