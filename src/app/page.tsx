"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Search,
  ListChecks,
  Kanban,
  BarChart3,
  Shield,
  Zap,
  Users,
  Check,
  ArrowRight,
  Star,
  ChevronRight,
  TrendingUp,
  Phone,
  Mail,
  DollarSign,
  Home,
  Activity,
  Sparkles,
  Play,
  MousePointer2,
  X,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Bell,
  ChevronDown,
  MapPin,
  Percent,
  Calendar,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Scroll animation hook
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: "50px" }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold]);

  return { ref, isVisible };
}

// Scroll reveal wrapper component
function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up"
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const { ref, isVisible } = useScrollAnimation();

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Interactive Demo Component
function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "search" | "pipeline">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pipelineCards, setPipelineCards] = useState({
    new: [
      { id: 1, name: "Michael Chen", value: "$895,000", equity: "27%", location: "Huntington Beach" },
      { id: 2, name: "David Thompson", value: "$985,000", equity: "25%", location: "Costa Mesa" },
    ],
    contacted: [
      { id: 3, name: "Sarah Nguyen", value: "$1,450,000", equity: "29%", location: "Irvine" },
    ],
    qualified: [
      { id: 4, name: "James Wilson", value: "$1,850,000", equity: "39%", location: "Newport Beach" },
    ],
    proposal: [],
    won: [
      { id: 5, name: "Robert Kim", value: "$1,780,000", equity: "39%", location: "Dana Point" },
    ],
  });

  const leads = [
    { id: 1, name: "James Wilson", address: "1842 Westcliff Dr, Newport Beach", equity: "39%", loanBalance: "$1,136,000", rate: "6.875%", origYear: "2022", savings: "$1,200/mo", status: "hot" },
    { id: 2, name: "Sarah Nguyen", address: "3567 Bayside Ln, Irvine", equity: "29%", loanBalance: "$1,024,000", rate: "7.125%", origYear: "2022", savings: "$1,350/mo", status: "hot" },
    { id: 3, name: "Emily Rodriguez", address: "15234 Ridgeline Ct, Laguna Niguel", equity: "37%", loanBalance: "$1,344,000", rate: "6.75%", origYear: "2022", savings: "$1,400/mo", status: "hot" },
    { id: 4, name: "Michael Chen", address: "892 Pacific Coast Hwy, Huntington Beach", equity: "27%", loanBalance: "$656,000", rate: "6.5%", origYear: "2023", savings: "$780/mo", status: "warm" },
    { id: 5, name: "Amanda Patel", address: "1456 Harbor View, San Clemente", equity: "33%", loanBalance: "$840,000", rate: "7.375%", origYear: "2022", savings: "$1,100/mo", status: "hot" },
  ];

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLead = (id: number) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const [animatedStats, setAnimatedStats] = useState({ leads: 0, value: 0, conversion: 0, deals: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({ leads: 2847, value: 4.2, conversion: 12.5, deals: 23 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 overflow-hidden">
      {/* Browser chrome */}
      <div className="h-10 bg-gray-50 flex items-center gap-2 px-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition cursor-pointer" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-90 transition cursor-pointer" />
          <div className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-gray-100 rounded-lg px-4 py-1 text-xs text-gray-400 font-mono w-64 text-center">
            app.mortgagepro.com/{activeTab}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer transition" />
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
        </div>
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <div className="w-48 bg-gray-50/80 border-r border-gray-100 p-3 hidden md:block">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-800">MortgagePro</span>
          </div>
          {[
            { id: "dashboard", icon: Activity, label: "Dashboard" },
            { id: "search", icon: Search, label: "Search" },
            { id: "lists", icon: ListChecks, label: "Lists" },
            { id: "pipeline", icon: Kanban, label: "Pipeline" },
            { id: "tasks", icon: Check, label: "Tasks" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium mb-0.5 transition-all duration-200",
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content area */}
        <div className="flex-1 p-5 bg-gray-50/30 min-h-[320px]">
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in duration-300">
              {/* KPI cards */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Refi Candidates", value: animatedStats.leads.toLocaleString(), change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Avg Savings", value: `$${Math.round(animatedStats.value * 100)}/mo`, change: "+8%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Contacted", value: `${animatedStats.conversion}%`, change: "+2.1%", icon: Phone, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Refinanced", value: animatedStats.deals.toString(), change: "+5", icon: Home, color: "text-orange-600", bg: "bg-orange-50" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <div className={cn("p-1 rounded-md transition-transform group-hover:scale-110", stat.bg)}>
                        <stat.icon className={cn("h-3 w-3", stat.color)} />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 transition-all duration-700">{stat.value}</p>
                    <p className="text-[10px] font-medium text-emerald-600">{stat.change} this week</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Chart */}
                <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Pipeline Overview</p>
                  <div className="flex items-end gap-2 h-28">
                    {[40, 65, 45, 80, 55, 70].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                        <div
                          className={cn(
                            "w-full rounded-md transition-all duration-300 hover:scale-105 origin-bottom",
                            i === 3 ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-200 hover:bg-blue-400"
                          )}
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[9px] text-gray-400 group-hover:text-gray-600 transition-colors">
                          {["New", "Called", "Qual", "Prop", "Nego", "Won"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Recent Activity</p>
                  <div className="space-y-2.5">
                    {[
                      { icon: Phone, text: "Called James Wilson", time: "2m ago", color: "bg-green-100 text-green-600" },
                      { icon: Mail, text: "Email sent to Emily R.", time: "15m ago", color: "bg-blue-100 text-blue-600" },
                      { icon: DollarSign, text: "Deal closed — $320k", time: "1h ago", color: "bg-amber-100 text-amber-600" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 -m-1 cursor-pointer transition">
                        <div className={cn("p-1 rounded-md", item.color)}>
                          <item.icon className="h-2.5 w-2.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-700 truncate">{item.text}</p>
                        </div>
                        <span className="text-[9px] text-gray-400">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="animate-in fade-in duration-300">
              {/* Search header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, address, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all",
                    showFilters
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>

              {/* Filters panel */}
              {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 grid grid-cols-4 gap-3 animate-in slide-in-from-top-2 duration-200">
                  {[
                    { label: "Min Rate", icon: TrendingUp, value: "5.5%+" },
                    { label: "Min Equity", icon: Percent, value: "25%" },
                    { label: "Location", icon: MapPin, value: "Orange County, CA" },
                    { label: "Originated", icon: Calendar, value: "2022-2024" },
                  ].map((filter) => (
                    <div key={filter.label} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition">
                      <filter.icon className="h-3 w-3 text-blue-500" />
                      <span className="text-[10px] text-gray-500">{filter.label}:</span>
                      <span className="text-[10px] font-medium text-blue-600">{filter.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-500">
                    {filteredLeads.length} leads found
                    {selectedLeads.length > 0 && <span className="text-blue-600 ml-2">({selectedLeads.length} selected)</span>}
                  </span>
                  {selectedLeads.length > 0 && (
                    <button className="text-[10px] font-medium text-blue-600 hover:text-blue-700">
                      Add to list →
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-100 max-h-[180px] overflow-y-auto">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => toggleLead(lead.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition",
                        selectedLeads.includes(lead.id) && "bg-blue-50/50"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border-2 flex items-center justify-center transition",
                        selectedLeads.includes(lead.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      )}>
                        {selectedLeads.includes(lead.id) && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-medium text-gray-900">{lead.name}</p>
                          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-orange-100 text-orange-600 rounded">{lead.rate}</span>
                          {lead.status === "hot" && (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold bg-red-100 text-red-600 rounded">HIGH SAVINGS</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{lead.address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-semibold text-emerald-600">{lead.savings}</p>
                        <p className="text-[9px] text-gray-400">{lead.equity} equity • {lead.origYear}</p>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pipeline" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-700">Pipeline Board</p>
                <button className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="h-3 w-3" />
                  Add Lead
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { key: "new", label: "New", color: "bg-gray-100" },
                  { key: "contacted", label: "Contacted", color: "bg-blue-100" },
                  { key: "qualified", label: "Qualified", color: "bg-yellow-100" },
                  { key: "proposal", label: "Proposal", color: "bg-purple-100" },
                  { key: "won", label: "Won", color: "bg-emerald-100" },
                ].map((stage) => (
                  <div key={stage.key} className="flex-1 min-w-[120px]">
                    <div className={cn("px-2 py-1 rounded-t-lg text-[10px] font-semibold text-gray-700", stage.color)}>
                      {stage.label}
                      <span className="ml-1 text-gray-500">
                        ({pipelineCards[stage.key as keyof typeof pipelineCards].length})
                      </span>
                    </div>
                    <div className="bg-gray-100/50 rounded-b-lg p-1.5 min-h-[160px] space-y-1.5">
                      {pipelineCards[stage.key as keyof typeof pipelineCards].map((card) => (
                        <div
                          key={card.id}
                          className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing"
                        >
                          <p className="text-[10px] font-medium text-gray-900 truncate">{card.name}</p>
                          <p className="text-[9px] text-gray-500">{card.location}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-semibold text-blue-600">{card.value}</span>
                            <span className="text-[9px] text-emerald-600">{card.equity}</span>
                          </div>
                        </div>
                      ))}
                      {pipelineCards[stage.key as keyof typeof pipelineCards].length === 0 && (
                        <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-[9px] text-gray-400">Drop here</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive hint */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-gray-900/90 text-white px-3 py-1.5 rounded-full text-[10px] font-medium animate-bounce-subtle z-30">
        <MousePointer2 className="h-3 w-3" />
        Click to explore
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              MortgagePro
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/features" className="text-gray-500 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/about" className="text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg shadow-gray-900/10"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-3xl animate-float" />
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-3xl animate-float delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-50/80 to-purple-50/40 blur-3xl animate-pulse-soft" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 text-gray-900 animate-hero-text">
              Find homeowners who need{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent animate-gradient-text">
                refinancing
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed animate-blur-in delay-300">
              Search by interest rate to find homeowners paying more than today&apos;s rates.
              Get their contact info. Close more deals.
            </p>

            {/* Visual search example */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-lg mx-auto mb-10 animate-blur-in delay-350 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <div className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    Orange County, CA
                  </div>
                </div>
                <div className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  Rate &gt; 5.5%
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                  <p className="text-sm text-gray-500">homeowners found</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-600">Avg. $340/mo savings</p>
                    <p className="text-xs text-gray-400">at today&apos;s rates</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-12 animate-blur-in delay-500 flex-wrap">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-1 active:scale-[0.98] hover-glow"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 animate-blur-in delay-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2.5">
                  {["from-blue-400 to-blue-500", "from-purple-400 to-purple-500", "from-emerald-400 to-emerald-500", "from-orange-400 to-orange-500", "from-pink-400 to-pink-500"].map((gradient, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-8 w-8 rounded-full border-[2.5px] border-[#fafbfc] bg-gradient-to-br shadow-sm transition-transform duration-300 hover:scale-110 hover:z-10",
                        gradient
                      )}
                      style={{ animationDelay: `${600 + i * 100}ms` }}
                    />
                  ))}
                </div>
                <span className="font-medium">2,500+ mortgage pros</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform hover:scale-125" />
                ))}
                <span className="font-medium ml-0.5">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Interactive Dashboard Demo */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-blur-in delay-700">
            {/* Glow effect behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl animate-pulse-soft" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fafbfc] to-transparent z-20 pointer-events-none" />

            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* Logos / Trust bar */}
      <section className="py-12 border-y border-gray-100 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
              Trusted by mortgage professionals at
            </p>
          </ScrollReveal>
          <div className="flex items-center justify-center gap-12 opacity-40">
            {["Wells Fargo", "Chase", "Bank of America", "US Bank", "Quicken Loans"].map((name, index) => (
              <ScrollReveal key={name} delay={index * 100}>
                <span className="text-lg font-bold text-gray-900 whitespace-nowrap hover:opacity-80 transition-opacity cursor-default">
                  {name}
                </span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 mb-2">HOW IT WORKS</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Find refinance leads in minutes, not days
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Stop cold calling random lists. Target homeowners who are actually paying too much on their mortgage.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mb-8"
            >
              <Sparkles className="h-4 w-4" />
              See all features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Search,
                title: "Find High-Rate Homeowners",
                description: "Search millions of properties by current interest rate, equity, origination date, and location. Find homeowners paying 6%+ who could save by refinancing.",
                gradient: "from-blue-500 to-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: TrendingUp,
                title: "Instant Savings Calculator",
                description: "See exactly how much each homeowner could save monthly by refinancing at today's rates. Prioritize leads with the biggest savings potential.",
                gradient: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: ListChecks,
                title: "Smart Lead Lists",
                description: "Build targeted lists of refinance candidates. Filter by rate, equity, loan type, and more. Export for outreach or manage directly in the CRM.",
                gradient: "from-purple-500 to-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: Users,
                title: "Get Contact Info",
                description: "Reveal phone numbers, emails, and mailing addresses for any property owner. Reach out directly from the platform.",
                gradient: "from-orange-500 to-orange-600",
                bg: "bg-orange-50",
              },
              {
                icon: Kanban,
                title: "Pipeline Management",
                description: "Track every lead from first contact to closed refinance. Visual kanban board makes it easy to see where each deal stands.",
                gradient: "from-pink-500 to-pink-600",
                bg: "bg-pink-50",
              },
              {
                icon: MapPin,
                title: "Target Any Market",
                description: "Coverage across all 50 states. Zoom into specific zip codes, cities, or counties to find refinance opportunities in your target area.",
                gradient: "from-indigo-500 to-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 100}>
                <div className="group bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300 hover-scale h-full">
                  <div className={cn("inline-flex p-3 rounded-xl mb-5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", feature.bg)}>
                    <feature.icon className={cn("h-5 w-5 bg-gradient-to-br bg-clip-text transition-transform duration-300", feature.gradient.replace("from-", "text-").split(" ")[0])} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 mb-2">PRICING</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Start free, upgrade when you need more. No hidden fees, cancel anytime.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mt-4"
              >
                Compare all plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <ScrollReveal delay={100}>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group h-full">
              <h3 className="font-bold text-lg text-gray-900">Starter</h3>
              <p className="text-sm text-gray-500 mt-1">For individual loan officers</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-extrabold text-gray-900 animate-number delay-300">$49</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <Link
                href="/auth/register"
                className="block text-center border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm active:scale-[0.98]"
              >
                Start Free Trial
              </Link>
              <ul className="mt-8 space-y-3.5">
                {[
                  "500 property searches/mo",
                  "50 contact reveals/mo",
                  "3 custom lists",
                  "Pipeline management",
                  "Email support",
                ].map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            </ScrollReveal>

            {/* Pro */}
            <ScrollReveal delay={200}>
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 relative shadow-xl shadow-blue-600/10 hover:shadow-2xl hover:shadow-blue-600/20 transition-all duration-300 scale-[1.02] hover:-translate-y-2 group animate-glow-pulse h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/25 animate-bounce-subtle">
                Most Popular
              </div>
              <h3 className="font-bold text-lg text-gray-900">Professional</h3>
              <p className="text-sm text-gray-500 mt-1">For growing teams</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-extrabold text-gray-900 animate-number delay-400">$149</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <Link
                href="/auth/register"
                className="block text-center bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl active:scale-[0.98]"
              >
                Start Free Trial
              </Link>
              <ul className="mt-8 space-y-3.5">
                {[
                  "Unlimited searches",
                  "500 contact reveals/mo",
                  "Unlimited lists",
                  "Pipeline + task management",
                  "Analytics dashboard",
                  "Priority support",
                ].map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            </ScrollReveal>

            {/* Enterprise */}
            <ScrollReveal delay={300}>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group h-full">
              <h3 className="font-bold text-lg text-gray-900">Enterprise</h3>
              <p className="text-sm text-gray-500 mt-1">For large brokerages</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-extrabold text-gray-900 animate-number delay-500">$399</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <Link
                href="/auth/register"
                className="block text-center border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm active:scale-[0.98]"
              >
                Contact Sales
              </Link>
              <ul className="mt-8 space-y-3.5">
                {[
                  "Everything in Pro",
                  "Unlimited contact reveals",
                  "Team management",
                  "API access",
                  "Custom integrations",
                  "Dedicated account manager",
                ].map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* About / Testimonial */}
      <section id="about" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">ABOUT</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-5">
                Built for mortgage professionals
              </h2>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mb-4"
              >
                Learn more about us
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-gray-500 leading-relaxed mb-4">
                We built MortgagePro because finding refinance leads was too hard.
                Brokers were buying expensive lists, cold calling randomly, and hoping for the best.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Now you can search by interest rate, equity, and location to find homeowners
                who would actually benefit from refinancing — and reach them before your competition does.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "2M+", label: "Properties Indexed" },
                  { value: "2,500+", label: "Active Users" },
                  { value: "$1.2B", label: "Pipeline Managed" },
                  { value: "98%", label: "Customer Satisfaction" },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 origin-left">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={200} direction="right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-3xl blur-2xl animate-pulse-soft" />
              <div className="relative bg-white rounded-2xl border border-gray-100 p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500 group">
                <div className="flex items-center gap-0.5 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400 transition-transform duration-300 hover:scale-125"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                  &ldquo;I used to buy generic lead lists and cold call all day. Now I search for
                  homeowners paying 6.5%+ in my area and show them exactly how much they&apos;d save.
                  My close rate went from 2% to 11%.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <p className="font-semibold text-gray-900">Jessica Palmer</p>
                    <p className="text-sm text-gray-500">
                      VP of Originations, Premier Lending Group
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden group">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

            {/* Floating orbs */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-float delay-1000" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse-soft" />

            <div className="relative px-8 py-24 md:py-28">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Left side - Content */}
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                      Find homeowners who need refinancing
                    </h2>
                    <p className="text-blue-100 text-lg mb-8">
                      Search by rate, location, and equity. Get their contact info. Start closing.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                      <Link
                        href="/auth/register"
                        className="group/btn inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] w-full sm:w-auto justify-center"
                      >
                        Start Free Trial
                        <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "2M+", label: "Properties" },
                      { value: "50", label: "States Covered" },
                      { value: "$420", label: "Avg Monthly Savings" },
                      { value: "2,500+", label: "Brokers Trust Us" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <p className="text-3xl md:text-4xl font-extrabold text-white group-hover:scale-110 transition-transform duration-300">
                          {stat.value}
                        </p>
                        <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Check className="h-5 w-5" />
                    <span className="text-sm">GDPR Ready</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm ml-1">4.9/5 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">MortgagePro</span>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
              <Link href="/features" className="hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
              <span className="cursor-pointer hover:text-gray-900 transition-colors">Privacy</span>
              <span className="cursor-pointer hover:text-gray-900 transition-colors">Terms</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; 2026 MortgagePro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
