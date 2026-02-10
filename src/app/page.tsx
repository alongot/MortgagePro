"use client";

import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
            <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#about" className="text-gray-500 hover:text-gray-900 transition-colors">About</a>
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
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-50/80 to-purple-50/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-medium mb-8 shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              Now with AI-powered lead scoring
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-gray-900">
              Find & close
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                mortgage leads
              </span>
              <br />
              10x faster
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Access millions of property records with mortgage data, owner details,
              and equity insights — all in one powerful CRM.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 px-7 py-3.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-base shadow-sm hover:-translate-y-0.5"
              >
                View Demo
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2.5">
                  {["from-blue-400 to-blue-500", "from-purple-400 to-purple-500", "from-emerald-400 to-emerald-500", "from-orange-400 to-orange-500", "from-pink-400 to-pink-500"].map((gradient, i) => (
                    <div
                      key={i}
                      className={cn("h-8 w-8 rounded-full border-[2.5px] border-[#fafbfc] bg-gradient-to-br shadow-sm", gradient)}
                    />
                  ))}
                </div>
                <span className="font-medium">2,500+ mortgage pros</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-medium ml-0.5">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Dashboard preview — realistic mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            {/* Glow effect behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fafbfc] to-transparent z-20 pointer-events-none" />

            <div className="relative rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 overflow-hidden">
              {/* Browser chrome */}
              <div className="h-10 bg-gray-50 flex items-center gap-2 px-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-100 rounded-lg px-4 py-1 text-xs text-gray-400 font-mono w-64 text-center">
                    app.mortgagepro.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="w-48 bg-gray-50/80 border-r border-gray-100 p-3 hidden md:block">
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
                      <Building2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">MortgagePro</span>
                  </div>
                  {["Dashboard", "Search", "Lists", "Pipeline", "Tasks"].map((item, i) => (
                    <div
                      key={item}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium mb-0.5",
                        i === 0 ? "bg-blue-600 text-white" : "text-gray-500"
                      )}
                    >
                      {i === 0 && <Activity className="h-3 w-3" />}
                      {i === 1 && <Search className="h-3 w-3" />}
                      {i === 2 && <ListChecks className="h-3 w-3" />}
                      {i === 3 && <Kanban className="h-3 w-3" />}
                      {i === 4 && <Check className="h-3 w-3" />}
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content area */}
                <div className="flex-1 p-5 bg-gray-50/30">
                  {/* KPI cards */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Total Leads", value: "2,847", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Pipeline Value", value: "$4.2M", change: "+8%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Conversion", value: "12.5%", change: "+2.1%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Deals Won", value: "23", change: "+5", icon: Home, color: "text-orange-600", bg: "bg-orange-50" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                          <div className={cn("p-1 rounded-md", stat.bg)}>
                            <stat.icon className={cn("h-3 w-3", stat.color)} />
                          </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-[10px] font-medium text-emerald-600">{stat.change} this week</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Fake chart */}
                    <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-xs font-semibold text-gray-700 mb-3">Pipeline Overview</p>
                      <div className="flex items-end gap-2 h-28">
                        {[40, 65, 45, 80, 55, 70].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={cn("w-full rounded-md", i === 3 ? "bg-blue-500" : "bg-blue-200")}
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[9px] text-gray-400">
                              {["New", "Called", "Qual", "Prop", "Nego", "Won"][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fake activity list */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-xs font-semibold text-gray-700 mb-3">Recent Activity</p>
                      <div className="space-y-2.5">
                        {[
                          { icon: Phone, text: "Called James Wilson", time: "2m ago", color: "bg-green-100 text-green-600" },
                          { icon: Mail, text: "Email sent to Emily R.", time: "15m ago", color: "bg-blue-100 text-blue-600" },
                          { icon: DollarSign, text: "Deal closed — $320k", time: "1h ago", color: "bg-amber-100 text-amber-600" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust bar */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Trusted by mortgage professionals at
          </p>
          <div className="flex items-center justify-center gap-12 opacity-40">
            {["Wells Fargo", "Chase", "Bank of America", "US Bank", "Quicken Loans"].map((name) => (
              <span key={name} className="text-lg font-bold text-gray-900 whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-2">FEATURES</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to close more deals
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From property search to deal close, MortgagePro streamlines your entire workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Search,
                title: "Smart Property Search",
                description: "Search millions of records by equity, rate, loan type, location, and more. Find the best prospects in seconds.",
                gradient: "from-blue-500 to-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: ListChecks,
                title: "Custom Lead Lists",
                description: "Organize leads into lists for targeted campaigns. Track absentee owners, ARM resets, and high-equity homeowners.",
                gradient: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: Kanban,
                title: "Pipeline Management",
                description: "Visual kanban board to track every lead from first contact to close. Drag and drop to update stages instantly.",
                gradient: "from-purple-500 to-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Real-time dashboards showing pipeline value, conversion rates, lead volume, and team performance metrics.",
                gradient: "from-orange-500 to-orange-600",
                bg: "bg-orange-50",
              },
              {
                icon: Users,
                title: "Contact Intelligence",
                description: "Instantly reveal phone numbers, emails, and mailing addresses. Skip tracing built right into your workflow.",
                gradient: "from-pink-500 to-pink-600",
                bg: "bg-pink-50",
              },
              {
                icon: Shield,
                title: "Task Management",
                description: "Never miss a follow-up. Create tasks, set due dates, and track completion across your entire pipeline.",
                gradient: "from-indigo-500 to-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={cn("inline-flex p-3 rounded-xl mb-5 shadow-sm", feature.bg)}>
                  <feature.icon className={cn("h-5 w-5 bg-gradient-to-br bg-clip-text", feature.gradient.replace("from-", "text-").split(" ")[0])} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-2">PRICING</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold text-lg text-gray-900">Starter</h3>
              <p className="text-sm text-gray-500 mt-1">For individual loan officers</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-extrabold text-gray-900">$49</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <Link
                href="/auth/register"
                className="block text-center border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
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
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 relative shadow-xl shadow-blue-600/10 hover:shadow-2xl hover:shadow-blue-600/15 transition-all duration-300 scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/25">
                Most Popular
              </div>
              <h3 className="font-bold text-lg text-gray-900">Professional</h3>
              <p className="text-sm text-gray-500 mt-1">For growing teams</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-extrabold text-gray-900">$149</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <Link
                href="/auth/register"
                className="block text-center bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-600/25"
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
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold text-lg text-gray-900">Enterprise</h3>
              <p className="text-sm text-gray-500 mt-1">For large brokerages</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-extrabold text-gray-900">$399</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <Link
                href="/auth/register"
                className="block text-center border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
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
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About / Testimonial */}
      <section id="about" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">ABOUT</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-5">
                Built for mortgage professionals
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                MortgagePro was built by loan officers who were tired of juggling
                spreadsheets, multiple data providers, and disconnected tools.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                We bring property data, skip tracing, pipeline management, and
                CRM functionality into a single platform — so you can spend less
                time on admin and more time closing deals.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "2M+", label: "Properties Indexed" },
                  { value: "2,500+", label: "Active Users" },
                  { value: "$1.2B", label: "Pipeline Managed" },
                  { value: "98%", label: "Customer Satisfaction" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl border border-gray-100 p-10 shadow-xl">
                <div className="flex items-center gap-0.5 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                  &ldquo;MortgagePro completely changed how our team prospects.
                  We went from cold-calling random lists to targeting high-equity
                  homeowners with ARM resets. Our conversion rate tripled in 3 months.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Jessica Palmer</p>
                    <p className="text-sm text-gray-500">
                      VP of Originations, Premier Lending Group
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative px-8 py-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to close more deals?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-lg mx-auto">
                Join thousands of mortgage professionals who use MortgagePro to
                find and convert leads every day.
              </p>
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Start Your Free Trial
                <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="text-sm text-blue-200 mt-5">
                14-day free trial &middot; No credit card required
              </p>
            </div>
          </div>
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
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
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
