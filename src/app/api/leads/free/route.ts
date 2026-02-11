import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getHighRateProperties,
  transformToInternalFormat,
} from "@/lib/api/datafiniti";

// POST /api/leads/free - Claim 10 free refinancing leads for a city
export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get request body
  const body = await request.json();
  const { city, state } = body;

  if (!city || !state) {
    return NextResponse.json(
      { error: "City and state are required" },
      { status: 400 }
    );
  }

  // Check if user has free leads remaining
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("free_leads_remaining, free_leads_claimed_at")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }

  if (profile.free_leads_claimed_at) {
    return NextResponse.json(
      {
        error: "Free leads already claimed",
        claimed_at: profile.free_leads_claimed_at,
      },
      { status: 400 }
    );
  }

  if (profile.free_leads_remaining <= 0) {
    return NextResponse.json(
      { error: "No free leads remaining" },
      { status: 400 }
    );
  }

  try {
    // Fetch properties from Datafiniti - properties sold during high rate period (2022-2023)
    const properties = await getHighRateProperties(city, state, 10);

    if (properties.length === 0) {
      return NextResponse.json(
        {
          error: "No refinancing opportunities found in this area",
          suggestion: "Try a larger city or different location",
        },
        { status: 404 }
      );
    }

    // Transform and insert properties, owners, mortgages, and leads
    const createdLeads = [];

    for (const datafinitProp of properties) {
      const transformed = transformToInternalFormat(datafinitProp);

      // Insert property
      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert(transformed.property)
        .select()
        .single();

      if (propError) {
        console.error("Error inserting property:", propError);
        continue;
      }

      // Insert owner
      const { data: owner, error: ownerError } = await supabase
        .from("owners")
        .insert({
          ...transformed.owner,
          property_id: property.id,
        })
        .select()
        .single();

      if (ownerError) {
        console.error("Error inserting owner:", ownerError);
        continue;
      }

      // Insert mortgage if available
      let mortgage = null;
      if (transformed.mortgage) {
        const { data: mortgageData, error: mortgageError } = await supabase
          .from("mortgage_records")
          .insert({
            ...transformed.mortgage,
            property_id: property.id,
          })
          .select()
          .single();

        if (!mortgageError) {
          mortgage = mortgageData;
        }
      }

      // Calculate lead score based on refinancing potential
      const score = calculateLeadScore(transformed, mortgage);

      // Create lead for user
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          property_id: property.id,
          owner_id: owner.id,
          user_id: user.id,
          status: "new",
          score,
          tags: generateTags(transformed, mortgage),
          notes: generateNotes(transformed, mortgage),
          contact_revealed: false,
        })
        .select()
        .single();

      if (leadError) {
        console.error("Error creating lead:", leadError);
        continue;
      }

      createdLeads.push({
        ...lead,
        property,
        owner,
        mortgage,
      });
    }

    // Update profile - mark free leads as claimed
    await supabase
      .from("profiles")
      .update({
        free_leads_remaining: 0,
        free_leads_city: city,
        free_leads_state: state,
        free_leads_claimed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      leads_created: createdLeads.length,
      leads: createdLeads,
      message: `Successfully created ${createdLeads.length} free refinancing leads in ${city}, ${state}`,
    });
  } catch (error) {
    console.error("Error generating free leads:", error);
    return NextResponse.json(
      { error: "Failed to generate leads. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/leads/free - Check free leads status
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "free_leads_remaining, free_leads_city, free_leads_state, free_leads_claimed_at"
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    free_leads_remaining: profile.free_leads_remaining,
    claimed: !!profile.free_leads_claimed_at,
    claimed_at: profile.free_leads_claimed_at,
    city: profile.free_leads_city,
    state: profile.free_leads_state,
  });
}

// Calculate lead score based on refinancing potential
function calculateLeadScore(
  transformed: ReturnType<typeof transformToInternalFormat>,
  mortgage: Record<string, unknown> | null
): number {
  let score = 50; // Base score

  if (mortgage) {
    const rate = mortgage.interest_rate as number;
    const equity = mortgage.estimated_equity as number;
    const isArm = mortgage.is_arm as boolean;

    // Higher rate = higher score (more savings potential)
    if (rate >= 7.5) score += 30;
    else if (rate >= 7.0) score += 25;
    else if (rate >= 6.5) score += 20;
    else if (rate >= 6.0) score += 15;

    // More equity = higher score
    if (equity >= 500000) score += 15;
    else if (equity >= 200000) score += 10;
    else if (equity >= 100000) score += 5;

    // ARM = higher urgency
    if (isArm) score += 10;
  }

  // Absentee owner = slightly higher (investors more likely to refi)
  if (transformed.owner.is_absentee) score += 5;

  return Math.min(100, score);
}

// Generate tags based on property/mortgage characteristics
function generateTags(
  transformed: ReturnType<typeof transformToInternalFormat>,
  mortgage: Record<string, unknown> | null
): string[] {
  const tags: string[] = [];

  if (mortgage) {
    const rate = mortgage.interest_rate as number;
    const equity = mortgage.estimated_equity as number;
    const isArm = mortgage.is_arm as boolean;
    const loanType = mortgage.loan_type as string;

    if (rate) tags.push(`${rate}%`);
    if (equity >= 200000) tags.push("high-equity");
    if (isArm) tags.push("ARM");
    if (loanType === "jumbo") tags.push("jumbo");
  }

  if (transformed.owner.is_absentee) tags.push("absentee-owner");
  tags.push(transformed.property.city.replace(/\s+/g, "-"));

  return tags;
}

// Generate initial notes for the lead
function generateNotes(
  transformed: ReturnType<typeof transformToInternalFormat>,
  mortgage: Record<string, unknown> | null
): string {
  const parts: string[] = [];

  if (mortgage) {
    const rate = mortgage.interest_rate as number;
    if (rate) {
      parts.push(`Current rate: ${rate}%.`);
      if (rate >= 6.5) {
        const savings = Math.round(
          ((rate - 5.5) / 100) * (mortgage.loan_amount as number) / 12
        );
        parts.push(`Potential savings: ~$${savings.toLocaleString()}/mo at 5.5%.`);
      }
    }
  }

  if (transformed.owner.is_absentee) {
    parts.push("Absentee owner - may be investment property.");
  }

  return parts.join(" ") || null!;
}
