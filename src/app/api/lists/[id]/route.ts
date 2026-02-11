import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/lists/[id] - Get a single list with its leads
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

  // Get the list
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (listError) {
    if (listError.code === "PGRST116") {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    console.error("Get list error:", listError);
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  // Get list items with lead details
  const { data: items, error: itemsError } = await supabase
    .from("list_items")
    .select(
      `
      *,
      lead:leads(
        *,
        property:properties(
          *,
          mortgage_records(*)
        ),
        owner:owners(*)
      )
    `
    )
    .eq("list_id", params.id);

  if (itemsError) {
    console.error("Get list items error:", itemsError);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Transform leads - extract mortgage from nested property
  const leads = (items || []).map((item) => ({
    ...item.lead,
    mortgage: item.lead?.property?.mortgage_records?.[0] || null,
    added_at: item.added_at,
  }));

  return NextResponse.json({
    ...list,
    leads,
  });
}

// PATCH /api/lists/[id] - Update a list
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
    const { name, description, color } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;

    const { data, error } = await supabase
      .from("lists")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
      }
      console.error("Update list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("Update list error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/lists/[id] - Delete a list
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
    .from("lists")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
