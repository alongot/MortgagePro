import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/lists/[id]/items - Add leads to a list
export async function POST(
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
    const { lead_ids } = body;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json(
        { error: "lead_ids array is required" },
        { status: 400 }
      );
    }

    // Verify the list belongs to the user
    const { data: list, error: listError } = await supabase
      .from("lists")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Insert list items (duplicates will be ignored due to unique constraint)
    const items = lead_ids.map((lead_id: string) => ({
      list_id: params.id,
      lead_id,
    }));

    const { data, error } = await supabase
      .from("list_items")
      .upsert(items, { onConflict: "list_id,lead_id" })
      .select();

    if (error) {
      console.error("Add items error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ added: data?.length || 0 }, { status: 201 });
  } catch (e) {
    console.error("Add items error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/lists/[id]/items - Remove leads from a list
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

  try {
    const body = await request.json();
    const { lead_ids } = body;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json(
        { error: "lead_ids array is required" },
        { status: 400 }
      );
    }

    // Verify the list belongs to the user
    const { data: list, error: listError } = await supabase
      .from("lists")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("list_items")
      .delete()
      .eq("list_id", params.id)
      .in("lead_id", lead_ids);

    if (error) {
      console.error("Remove items error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Remove items error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
