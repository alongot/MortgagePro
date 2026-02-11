"use client";

import Link from "next/link";
import {
  Building2,
  Search,
  ListChecks,
  Kanban,
  BarChart3,
  Shield,
  Users,
  Check,
  ArrowRight,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Phone,
  Mail,
  FileText,
  Bell,
  Globe,
  Lock,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const mainFeatures = [
  {
    icon: Search,
    title: "Smart Property Search",
    description: "Search millions of records by equity, rate, loan type, location, and more. Find the best prospects in seconds.",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    details: [
      "Filter by equity percentage, loan amount, interest rate",
      "Search by property type, occupancy status, owner demographics",
      "Save and share search criteria with your team",
      "Export results to CSV or integrate with your marketing tools",
    ],
  },
  {
    icon: ListChecks,
    title: "Custom Lead Lists",
    description: "Organize leads into lists for targeted campaigns. Track absentee owners, ARM resets, and high-equity homeowners.",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    details: [
      "Create unlimited custom lists with any criteria",
      "Automatic list updates as property data changes",
      "Duplicate detection across multiple lists",
      "Bulk actions: tag, assign, export, delete",
    ],
  },
  {
    icon: Kanban,
    title: "Pipeline Management",
    description: "Visual kanban board to track every lead from first contact to close. Drag and drop to update stages instantly.",
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    details: [
      "Customizable pipeline stages for your workflow",
      "Automatic stage movement based on activity",
      "Pipeline value tracking and forecasting",
      "Team assignments and workload balancing",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time dashboards showing pipeline value, conversion rates, lead volume, and team performance metrics.",
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    details: [
      "Customizable widgets and KPI cards",
      "Historical trend analysis and comparisons",
      "Team leaderboards and individual performance",
      "Export reports for management presentations",
    ],
  },
  {
    icon: Users,
    title: "Contact Intelligence",
    description: "Instantly reveal phone numbers, emails, and mailing addresses. Skip tracing built right into your workflow.",
    gradient: "from-pink-500 to-pink-600",
    bg: "bg-pink-50",
    details: [
      "Multi-source data validation for accuracy",
      "Phone number type detection (mobile, landline, VoIP)",
      "Email deliverability scoring",
      "Mailing address verification and standardization",
    ],
  },
  {
    icon: Shield,
    title: "Task Management",
    description: "Never miss a follow-up. Create tasks, set due dates, and track completion across your entire pipeline.",
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    details: [
      "Automated task creation based on triggers",
      "Recurring tasks for regular follow-ups",
      "Email and in-app reminders",
      "Calendar integration (Google, Outlook)",
    ],
  },
];

const additionalFeatures = [
  { icon: Zap, title: "AI Lead Scoring", description: "Predict which leads are most likely to convert" },
  { icon: Target, title: "Territory Mapping", description: "Visualize and manage your market areas" },
  { icon: Clock, title: "Activity Timeline", description: "Full history of every lead interaction" },
  { icon: Phone, title: "Click-to-Call", description: "Dial directly from lead profiles" },
  { icon: Mail, title: "Email Templates", description: "Personalized outreach at scale" },
  { icon: FileText, title: "Document Storage", description: "Attach files to leads and deals" },
  { icon: Bell, title: "Smart Notifications", description: "Get alerted on important events" },
  { icon: Globe, title: "Multi-Market Support", description: "Work across different regions" },
  { icon: Lock, title: "Role-Based Access", description: "Control who sees what data" },
  { icon: Smartphone, title: "Mobile App", description: "Work from anywhere on any device" },
  { icon: TrendingUp, title: "Goal Tracking", description: "Set and monitor monthly targets" },
  { icon: Users, title: "Team Collaboration", description: "Share leads and work together" },
];

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc]">
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
            <Link href="/features" className="text-blue-600 font-semibold">Features</Link>
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
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-3xl animate-float" />
          <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full bg-purple-100/40 blur-3xl animate-float delay-1000" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-hero-text">
              <Zap className="h-3.5 w-3.5" />
              Powerful features for mortgage pros
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 animate-hero-text delay-100">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                close more deals
              </span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 animate-blur-in delay-200">
              From property search to deal close, MortgagePro streamlines your entire workflow
              with powerful tools designed specifically for mortgage professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-24">
            {mainFeatures.map((feature, index) => (
              <AnimatedSection key={feature.title}>
                <div className={cn(
                  "grid md:grid-cols-2 gap-12 items-center",
                  index % 2 === 1 && "md:flex-row-reverse"
                )}>
                  <div className={cn(index % 2 === 1 && "md:order-2")}>
                    <div className={cn("inline-flex p-4 rounded-2xl mb-6 shadow-lg", feature.bg)}>
                      <feature.icon className={cn("h-8 w-8", feature.gradient.replace("from-", "text-").split(" ")[0])} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                    <p className="text-lg text-gray-500 mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-600">
                          <Check className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={cn(
                    "relative rounded-2xl overflow-hidden shadow-2xl",
                    index % 2 === 1 && "md:order-1"
                  )}>
                    <div className={cn(
                      "aspect-[4/3] bg-gradient-to-br",
                      feature.gradient,
                      "p-8 flex items-center justify-center"
                    )}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <feature.icon className="h-24 w-24 text-white/90" />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">And so much more...</h2>
              <p className="text-lg text-gray-500">
                Every tool you need to run a successful mortgage business
              </p>
            </div>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 50}>
                <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 group">
                  <feature.icon className="h-6 w-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
              <div className="relative px-8 py-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to see these features in action?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                  Start your free trial today and experience the power of MortgagePro.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
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
