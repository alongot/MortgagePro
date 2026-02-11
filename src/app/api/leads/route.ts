import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/leads - List leads for current user
export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortDir = searchParams.get("sort_dir") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "25");

  let query = supabase
    .from("leads")
    .select(
      `
      *,
      property:properties(*),
      owner:owners(*),
      mortgage:mortgage_records(*)
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id);

  if (status) {
    query = query.eq("status", status);
  }

  const ascending = sortDir === "asc";
  query = query.order(sortBy, { ascending });

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Leads query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to flatten nested data
  const leads = (data || []).map((lead) => ({
    ...lead,
    property: lead.property,
    owner: lead.owner,
    mortgage: Array.isArray(lead.mortgage) ? lead.mortgage[0] : lead.mortgage,
  }));

  return NextResponse.json({
    data: leads,
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  });
}

// POST /api/leads - Create a new lead
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
    const { property_id, owner_id, status, score, tags, notes } = body;

    if (!property_id || !owner_id) {
      return NextResponse.json(
        { error: "property_id and owner_id are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        property_id,
        owner_id,
        user_id: user.id,
        status: status || "new",
        score: score || 0,
        tags: tags || [],
        notes: notes || null,
        contact_revealed: false,
      })
      .select(
        `
        *,
        property:properties(*),
        owner:owners(*),
        mortgage:mortgage_records(*)
      `
      )
      .single();

    if (error) {
      console.error("Create lead error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("Create lead error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
