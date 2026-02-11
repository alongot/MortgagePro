"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  RefreshCw,
  MapPin,
  Info,
  FileText,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";
import { ClaimFreeLeads } from "@/components/claim-free-leads";
import { getFreeLeadsStatus, type FreeLeadsStatus } from "@/lib/api/client";

interface UserPreferences {
  full_name?: string;
  target_markets?: string;
  experience_level?: string;
  rate_targets?: string[];
}

interface LeadSummary {
  id: string;
  status: string;
  score: number;
  property: {
    address: string;
    city: string;
    state: string;
    estimated_value: number;
  };
  owner: {
    first_name: string;
    last_name: string;
  };
  mortgage?: {
    interest_rate: number;
    estimated_equity: number;
  };
}

interface CurrentRates {
  "30_fixed"?: { rate: number; date: string };
  "15_fixed"?: { rate: number; date: string };
  "5_1_arm"?: { rate: number; date: string };
  source?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRates, setCurrentRates] = useState<CurrentRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [freeLeadsStatus, setFreeLeadsStatus] = useState<FreeLeadsStatus | null>(null);
  const [showFreeLeads, setShowFreeLeads] = useState(true);
  const [userLeads, setUserLeads] = useState<LeadSummary[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setUser(user.user_metadata as UserPreferences);
      }
      setLoading(false);
    }
    async function loadFreeLeadsStatus() {
      try {
        const status = await getFreeLeadsStatus();
        setFreeLeadsStatus(status);
        setShowFreeLeads(!status.claimed);
      } catch {
        // API may not exist yet, show the component
        setShowFreeLeads(true);
      }
    }
    async function loadUserLeads() {
      setLeadsLoading(true);
      try {
        const response = await fetch("/api/properties?per_page=10");
        if (response.ok) {
          const data = await response.json();
          // Transform to lead summary format
          const leads = data.data?.map((item: Record<string, unknown>) => ({
            id: (item.lead as Record<string, unknown>)?.id || (item.property as Record<string, unknown>)?.id,
            status: (item.lead as Record<string, unknown>)?.status || "new",
            score: (item.lead as Record<string, unknown>)?.score || 0,
            property: item.property,
            owner: item.owner,
            mortgage: item.mortgage,
          })) || [];
          setUserLeads(leads);
        }
      } catch (err) {
        console.error("Failed to load leads:", err);
      } finally {
        setLeadsLoading(false);
      }
    }
    loadUser();
    loadFreeLeadsStatus();
    loadUserLeads();
    fetchCurrentRates();
  }, []);

  // Fetch current mortgage rates
  async function fetchCurrentRates() {
    setRatesLoading(true);
    try {
      const response = await fetch("/api/rates/current");
      if (response.ok) {
        const data = await response.json();
        setCurrentRates(data);
      }
    } catch (err) {
      console.error("Failed to fetch rates:", err);
    } finally {
      setRatesLoading(false);
    }
  }

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "";

  // Parse target market
  const targetMarket = user?.target_markets || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            {targetMarket ? (
              <>
                <MapPin className="h-3.5 w-3.5" />
                Targeting {targetMarket}
              </>
            ) : (
              "Welcome to your mortgage CRM"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button size="sm" className="hover:scale-105 active:scale-95 transition-transform duration-200">
              <Users className="h-4 w-4 mr-1.5" />
              Find Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Get More Leads */}
      {freeLeadsStatus?.claimed && freeLeadsStatus.city && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent animate-card-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your Market: {freeLeadsStatus.city}, {freeLeadsStatus.state}</p>
                  <p className="text-xs text-muted-foreground">
                    {userLeads.length} leads generated • Sorted by highest interest rates
                  </p>
                </div>
              </div>
              <Link href="/search">
                <Button size="sm">
                  <Search className="h-4 w-4 mr-1.5" />
                  View All Leads
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Mortgage Rates */}
      <Card className="animate-card-in" style={{ animationDelay: '100ms' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary" />
              Current Mortgage Rates
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentRates?.source && (
                <Badge variant="outline" className="text-[10px]">
                  {currentRates.source === "freddie_mac" ? "Freddie Mac PMMS" : "Estimated"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={fetchCurrentRates}
                disabled={ratesLoading}
              >
                <RefreshCw className={cn("h-3 w-3", ratesLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">30-Year Fixed</p>
              <p className="text-xl font-bold text-primary">
                {currentRates?.["30_fixed"]?.rate ? `${currentRates["30_fixed"].rate}%` : "—"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">15-Year Fixed</p>
              <p className="text-xl font-bold text-emerald-600">
                {currentRates?.["15_fixed"]?.rate ? `${currentRates["15_fixed"].rate}%` : "—"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">5/1 ARM</p>
              <p className="text-xl font-bold text-purple-600">
                {currentRates?.["5_1_arm"]?.rate ? `${currentRates["5_1_arm"].rate}%` : "—"}
              </p>
            </div>
          </div>
          <div className="mt-3 p-2 rounded bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-800 flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                <strong>How we estimate rates:</strong> When you look up a property, we find when it was last sold and match that date to Freddie Mac's historical Primary Mortgage Market Survey rates. This gives us an educated estimate of the homeowner's original rate.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Leads",
            value: userLeads.length.toString(),
            icon: Users,
            accent: "text-blue-600 bg-blue-500/10",
          },
          {
            label: "Pipeline Value",
            value: formatCurrency(userLeads.reduce((sum, l) => sum + (l.property?.estimated_value || 0), 0)),
            icon: DollarSign,
            accent: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Avg Interest Rate",
            value: userLeads.length > 0
              ? `${(userLeads.reduce((sum, l) => sum + (l.mortgage?.interest_rate || 0), 0) / userLeads.length).toFixed(1)}%`
              : "—",
            icon: TrendingUp,
            accent: "text-purple-600 bg-purple-500/10",
          },
          {
            label: "Total Equity",
            value: formatCurrency(userLeads.reduce((sum, l) => sum + (l.mortgage?.estimated_equity || 0), 0)),
            icon: CheckCircle2,
            accent: "text-orange-600 bg-orange-500/10",
          },
        ].map((kpi, index) => (
          <Card
            key={kpi.label}
            className="overflow-hidden animate-card-in hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">{kpi.value}</p>
                </div>
                <div className={cn("p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", kpi.accent)}>
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Your Leads Section - Shows after onboarding */}
      {userLeads.length > 0 && (
        <Card className="animate-card-in" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Leads
                <Badge variant="secondary" className="ml-2">{userLeads.length}</Badge>
              </CardTitle>
              <Link href="/search">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {freeLeadsStatus?.city && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Refinancing opportunities in {freeLeadsStatus.city}, {freeLeadsStatus.state}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">Property</th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">Owner</th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">Value</th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">Rate</th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">Equity</th>
                  </tr>
                </thead>
                <tbody>
                  {userLeads.slice(0, 5).map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-2">
                        <p className="text-sm font-medium">{lead.property?.address}</p>
                        <p className="text-xs text-muted-foreground">{lead.property?.city}, {lead.property?.state}</p>
                      </td>
                      <td className="p-2">
                        <p className="text-sm">{lead.owner?.first_name} {lead.owner?.last_name}</p>
                      </td>
                      <td className="p-2">
                        <p className="text-sm font-medium">{lead.property?.estimated_value ? formatCurrency(lead.property.estimated_value) : "—"}</p>
                      </td>
                      <td className="p-2">
                        <Badge variant={lead.mortgage?.interest_rate && lead.mortgage.interest_rate >= 6.5 ? "destructive" : "secondary"} className="text-xs">
                          {lead.mortgage?.interest_rate ? `${lead.mortgage.interest_rate}%` : "—"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <p className="text-sm text-green-600 font-medium">
                          {lead.mortgage?.estimated_equity ? formatCurrency(lead.mortgage.estimated_equity) : "—"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userLeads.length > 5 && (
              <div className="mt-3 text-center">
                <Link href="/search">
                  <Button variant="ghost" size="sm">
                    View all {userLeads.length} leads
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Free Leads Offer - Only show if no leads yet */}
      {showFreeLeads && !freeLeadsStatus?.claimed && userLeads.length === 0 && !leadsLoading && (
        <div className="animate-card-in" style={{ animationDelay: '150ms' }}>
          <ClaimFreeLeads
            onSuccess={(count) => {
              setFreeLeadsStatus(prev => prev ? { ...prev, claimed: true } : null);
              // Reload leads after claiming
              window.location.reload();
            }}
            onDismiss={() => {
              setShowFreeLeads(false);
              router.push("/pipeline");
            }}
          />
        </div>
      )}

      {/* Getting Started Section - Only show when no leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userLeads.length === 0 && !leadsLoading ? (
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-card-in" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start building your pipeline by searching for properties and adding leads.
                </p>
                <div className="grid gap-3">
                  <Link href="/search">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="p-3 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
                        <Search className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Search Properties</p>
                        <p className="text-sm text-muted-foreground">Find homeowners in your target market</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/lists">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="p-3 rounded-lg bg-purple-500/10 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Create a List</p>
                        <p className="text-sm text-muted-foreground">Organize leads into targeted campaigns</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/pipeline">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="p-3 rounded-lg bg-emerald-500/10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">View Pipeline</p>
                        <p className="text-sm text-muted-foreground">Track deals through your sales process</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2 space-y-6">
            {/* Next Steps when user has leads */}
            <Card className="animate-card-in" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You have {userLeads.length} leads ready to work. Here&apos;s what to do next:
                </p>
                <div className="grid gap-3">
                  <Link href="/search">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="p-3 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Review Your Leads</p>
                        <p className="text-sm text-muted-foreground">View details and prioritize high-value opportunities</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/pipeline">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="p-3 rounded-lg bg-emerald-500/10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Move to Pipeline</p>
                        <p className="text-sm text-muted-foreground">Start tracking deals through your sales process</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/lists">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="p-3 rounded-lg bg-purple-500/10 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Create a Campaign List</p>
                        <p className="text-sm text-muted-foreground">Organize leads for outreach campaigns</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="animate-card-in" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/search">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </Link>
              <Link href="/lists">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  New List
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Target Market Info */}
          {targetMarket && (
            <Card className="animate-card-in border-primary/20" style={{ animationDelay: '400ms' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Your Target Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{targetMarket}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use property lookup to find leads in this area
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
