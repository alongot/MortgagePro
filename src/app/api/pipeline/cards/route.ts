import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/pipeline/cards - Create a new card
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
    const { stage_id, lead_id, position } = body;

    if (!stage_id || !lead_id) {
      return NextResponse.json(
        { error: "stage_id and lead_id are required" },
        { status: 400 }
      );
    }

    // Verify stage belongs to user
    const { data: stage, error: stageError } = await supabase
      .from("pipeline_stages")
      .select("id")
      .eq("id", stage_id)
      .eq("user_id", user.id)
      .single();

    if (stageError || !stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    // Get max position if not provided
    let newPosition = position;
    if (newPosition === undefined) {
      const { data: maxCard } = await supabase
        .from("pipeline_cards")
        .select("position")
        .eq("stage_id", stage_id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      newPosition = (maxCard?.position ?? -1) + 1;
    }

    const { data, error } = await supabase
      .from("pipeline_cards")
      .insert({
        stage_id,
        lead_id,
        position: newPosition,
      })
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
      .single();

    if (error) {
      console.error("Create card error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ...data,
        lead: data.lead
          ? {
              ...data.lead,
              mortgage: Array.isArray(data.lead.mortgage)
                ? data.lead.mortgage[0]
                : data.lead.mortgage,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create card error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PATCH /api/pipeline/cards - Move a card to a new stage/position
export async function PATCH(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { card_id, stage_id, position } = body;

    if (!card_id) {
      return NextResponse.json(
        { error: "card_id is required" },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (stage_id !== undefined) {
      // Verify new stage belongs to user
      const { data: stage, error: stageError } = await supabase
        .from("pipeline_stages")
        .select("id")
        .eq("id", stage_id)
        .eq("user_id", user.id)
        .single();

      if (stageError || !stage) {
        return NextResponse.json({ error: "Stage not found" }, { status: 404 });
      }

      updates.stage_id = stage_id;
    }

    if (position !== undefined) {
      updates.position = position;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Verify card belongs to a stage owned by user
    const { data: existingCard, error: cardError } = await supabase
      .from("pipeline_cards")
      .select("stage_id, pipeline_stages!inner(user_id)")
      .eq("id", card_id)
      .single();

    if (cardError || !existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("pipeline_cards")
      .update(updates)
      .eq("id", card_id)
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
      .single();

    if (error) {
      console.error("Update card error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ...data,
      lead: data.lead
        ? {
            ...data.lead,
            mortgage: Array.isArray(data.lead.mortgage)
              ? data.lead.mortgage[0]
              : data.lead.mortgage,
          }
        : null,
    });
  } catch (e) {
    console.error("Update card error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/pipeline/cards - Delete a card
export async function DELETE(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("card_id");

    if (!cardId) {
      return NextResponse.json(
        { error: "card_id is required" },
        { status: 400 }
      );
    }

    // Verify card belongs to a stage owned by user
    const { data: existingCard } = await supabase
      .from("pipeline_cards")
      .select("stage_id, pipeline_stages!inner(user_id)")
      .eq("id", cardId)
      .single();

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("pipeline_cards")
      .delete()
      .eq("id", cardId);

    if (error) {
      console.error("Delete card error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete card error:", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
