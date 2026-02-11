import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/leads/[id] - Get a single lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      *,
      property:properties(
        *,
        mortgage_records(*)
      ),
      owner:owners(*)
    `
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    console.error("Get lead error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Extract mortgage from the nested property relationship
  const mortgage = data.property?.mortgage_records?.[0] || null;

  return NextResponse.json({
    ...data,
    mortgage,
  });
}

// PATCH /api/leads/[id] - Update a lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, score, tags, notes, contact_revealed } = body;

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (score !== undefined) updates.score = score;
    if (tags !== undefined) updates.tags = tags;
    if (notes !== undefined) updates.notes = notes;
    if (contact_revealed !== undefined)
      updates.contact_revealed = contact_revealed;

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        property:properties(
          *,
          mortgage_records(*)
        ),
        owner:owners(*)
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      console.error("Update lead error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract mortgage from the nested property relationship
    const mortgage = data.property?.mortgage_records?.[0] || null;

    return NextResponse.json({
      ...data,
      mortgage,
    });
  } catch (e) {
    console.error("Update lead error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
