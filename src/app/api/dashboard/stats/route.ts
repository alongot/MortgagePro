import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/dashboard/stats - Get aggregated dashboard statistics
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get dates for filtering
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Run queries in parallel
  const [
    totalLeadsResult,
    newLeadsResult,
    contactedResult,
    dealsWonResult,
    tasksDueTodayResult,
    pipelineValueResult,
    pipelineChartResult,
    monthlyLeadsResult,
  ] = await Promise.all([
    // Total leads
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),

    // New leads this week
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "new")
      .gte("created_at", startOfWeek.toISOString()),

    // Contacted this week
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "contacted")
      .gte("updated_at", startOfWeek.toISOString()),

    // Deals won this month
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "won")
      .gte("updated_at", startOfMonth.toISOString()),

    // Tasks due today
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("status", "completed")
      .gte("due_date", today.toISOString())
      .lt("due_date", tomorrow.toISOString()),

    // Pipeline value (sum of loan amounts for active leads)
    supabase
      .from("leads")
      .select(
        `
        id,
        mortgage:mortgage_records(loan_amount)
      `
      )
      .eq("user_id", user.id)
      .in("status", ["contacted", "qualified", "proposal", "negotiation"]),

    // Pipeline chart data (leads by status)
    supabase
      .from("leads")
      .select("status")
      .eq("user_id", user.id),

    // Monthly leads (last 6 months)
    supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", user.id)
      .gte(
        "created_at",
        new Date(
          now.getFullYear(),
          now.getMonth() - 5,
          1
        ).toISOString()
      ),
  ]);

  // Calculate pipeline value
  let totalPipelineValue = 0;
  if (pipelineValueResult.data) {
    for (const lead of pipelineValueResult.data) {
      const mortgage = Array.isArray(lead.mortgage)
        ? lead.mortgage[0]
        : lead.mortgage;
      totalPipelineValue += mortgage?.loan_amount || 0;
    }
  }

  // Calculate conversion rate
  const totalLeads = totalLeadsResult.count || 0;
  const wonLeads = dealsWonResult.count || 0;
  const conversionRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;

  // Build pipeline chart data
  const statusCounts: Record<string, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
  };

  if (pipelineChartResult.data) {
    for (const lead of pipelineChartResult.data) {
      if (lead.status in statusCounts) {
        statusCounts[lead.status]++;
      }
    }
  }

  const pipelineChartData = [
    { name: "New", value: statusCounts.new },
    { name: "Contacted", value: statusCounts.contacted },
    { name: "Qualified", value: statusCounts.qualified },
    { name: "Proposal", value: statusCounts.proposal },
    { name: "Negotiation", value: statusCounts.negotiation },
    { name: "Won", value: statusCounts.won },
  ];

  // Build monthly leads data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData: Record<string, number> = {};

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  if (monthlyLeadsResult.data) {
    for (const lead of monthlyLeadsResult.data) {
      const date = new Date(lead.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyData) {
        monthlyData[key]++;
      }
    }
  }

  const monthlyLeadsData = Object.entries(monthlyData).map(([key, value]) => {
    const [, month] = key.split("-");
    return {
      name: monthNames[parseInt(month) - 1],
      value,
    };
  });

  // Lead sources (mock for now - would need source tracking)
  const leadsBySourceData = [
    { name: "High Equity", value: 35 },
    { name: "ARM Reset", value: 20 },
    { name: "Absentee", value: 25 },
    { name: "Pre-Foreclosure", value: 10 },
    { name: "Referral", value: 10 },
  ];

  return NextResponse.json({
    stats: {
      total_leads: totalLeads,
      new_leads_this_week: newLeadsResult.count || 0,
      contacted_this_week: contactedResult.count || 0,
      deals_won_this_month: wonLeads,
      total_pipeline_value: totalPipelineValue,
      conversion_rate: conversionRate,
      avg_response_time_hours: 4.2, // Would need activity tracking
      tasks_due_today: tasksDueTodayResult.count || 0,
    },
    charts: {
      pipeline: pipelineChartData,
      monthly_leads: monthlyLeadsData,
      lead_sources: leadsBySourceData,
    },
  });
}
