"use client";

import Link from "next/link";
import {
  Building2,
  Star,
  Users,
  Target,
  Heart,
  Zap,
  ArrowRight,
  Quote,
  MapPin,
  Award,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const stats = [
  { value: "2M+", label: "Properties Indexed", icon: Building2 },
  { value: "2,500+", label: "Active Users", icon: Users },
  { value: "$1.2B", label: "Pipeline Managed", icon: TrendingUp },
  { value: "98%", label: "Customer Satisfaction", icon: Heart },
];

const values = [
  {
    icon: Target,
    title: "Customer First",
    description: "Every feature we build starts with one question: will this help our customers close more deals?",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description: "In mortgage, timing is everything. We obsess over making MortgagePro fast and reliable.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "Your data is sacred. We never sell it, and we're always clear about what we do with it.",
  },
  {
    icon: Clock,
    title: "Continuous Improvement",
    description: "We ship updates every week based on your feedback. MortgagePro gets better every day.",
  },
];

const team = [
  { name: "Michael Chen", role: "CEO & Co-founder", bio: "Former VP at Quicken Loans, 15 years in mortgage tech" },
  { name: "Sarah Martinez", role: "CTO & Co-founder", bio: "Ex-Google engineer, built 3 successful SaaS products" },
  { name: "David Park", role: "Head of Product", bio: "Product leader at Zillow and Redfin" },
  { name: "Emily Johnson", role: "Head of Sales", bio: "Built sales teams at 2 unicorn startups" },
];

const testimonials = [
  {
    quote: "MortgagePro completely changed how our team prospects. We went from cold-calling random lists to targeting high-equity homeowners with ARM resets. Our conversion rate tripled in 3 months.",
    author: "Jessica Palmer",
    title: "VP of Originations, Premier Lending Group",
    rating: 5,
  },
  {
    quote: "The search filters are incredible. I can find exactly the leads I'm looking for in seconds. It's like having a research team working 24/7.",
    author: "Marcus Thompson",
    title: "Senior Loan Officer, First National Bank",
    rating: 5,
  },
  {
    quote: "We've tried every CRM out there. MortgagePro is the first one actually built for how mortgage professionals work. The pipeline view alone is worth it.",
    author: "Rachel Kim",
    title: "Broker Owner, Citywide Mortgage",
    rating: 5,
  },
];

const milestones = [
  { year: "2021", title: "Founded", description: "Started in a garage with 3 founders and a dream" },
  { year: "2022", title: "Product Launch", description: "Launched MVP, acquired first 100 customers" },
  { year: "2023", title: "Series A", description: "Raised $12M to accelerate growth" },
  { year: "2024", title: "2,500+ Users", description: "Crossed 2,500 active users milestone" },
  { year: "2025", title: "AI Features", description: "Launched AI-powered lead scoring" },
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

export default function AboutPage() {
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
            <Link href="/features" className="text-gray-500 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/about" className="text-blue-600 font-semibold">About</Link>
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
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-100/60 blur-3xl animate-float" />
          <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-3xl animate-float delay-1000" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-hero-text">
              <Heart className="h-3.5 w-3.5" />
              Built by mortgage pros, for mortgage pros
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 animate-hero-text delay-100">
              Our mission is to help you{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                close more deals
              </span>
            </h1>
            <p className="text-lg text-gray-500 animate-blur-in delay-200">
              We built MortgagePro because we were tired of juggling spreadsheets, multiple data providers,
              and disconnected tools. There had to be a better way.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 100}>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-center">
                  <div className="inline-flex p-3 rounded-xl bg-blue-50 mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-2">OUR STORY</p>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  From frustrated loan officers to founders
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed">
                  <p>
                    In 2021, our founders were working as loan officers at a large brokerage.
                    Every day, they juggled between 5+ different tools: one for property data,
                    another for skip tracing, spreadsheets for tracking leads, and a CRM that
                    wasn't built for mortgage.
                  </p>
                  <p>
                    After spending more time on admin work than actually talking to prospects,
                    they decided enough was enough. They quit their jobs and started building
                    the tool they wished they had.
                  </p>
                  <p>
                    MortgagePro launched in 2022 with a simple premise: bring everything a
                    mortgage professional needs into one platform. Property data, contact info,
                    pipeline management, and CRM — all in one place.
                  </p>
                  <p>
                    Today, over 2,500 mortgage professionals use MortgagePro to find and close
                    deals. And we're just getting started.
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                  <Quote className="h-12 w-12 text-white/20 mb-4" />
                  <blockquote className="text-xl font-medium leading-relaxed mb-6">
                    "We built MortgagePro to solve our own problems. Turns out, thousands of
                    other loan officers had the exact same frustrations."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20" />
                    <div>
                      <p className="font-semibold">Michael Chen</p>
                      <p className="text-sm text-white/70">CEO & Co-founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-purple-600 mb-2">OUR JOURNEY</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key milestones</h2>
            </div>
          </AnimatedSection>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <AnimatedSection key={milestone.year} delay={index * 100}>
                  <div className={cn(
                    "flex items-center gap-8",
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}>
                    <div className={cn(
                      "flex-1",
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    )}>
                      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 inline-block">
                        <span className="text-sm font-bold text-purple-600">{milestone.year}</span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">{milestone.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-sm shrink-0 z-10">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-purple-600 mb-2">OUR VALUES</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What we believe in</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                These principles guide every decision we make at MortgagePro.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 100}>
                <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 group h-full">
                  <div className="inline-flex p-3 rounded-xl bg-white shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-purple-600 mb-2">OUR TEAM</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the people behind MortgagePro</h2>
              <p className="text-lg text-gray-500">
                A team of mortgage industry veterans and tech experts.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <AnimatedSection key={member.name} delay={index * 100}>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 mx-auto mb-4 group-hover:scale-105 transition-transform" />
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-purple-600 font-medium">{member.role}</p>
                  <p className="text-sm text-gray-500 mt-2">{member.bio}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-purple-600 mb-2">TESTIMONIALS</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by mortgage professionals</h2>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed flex-1">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                      <p className="text-xs text-gray-500">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
              <div className="relative">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-white/80" />
                <h2 className="text-3xl font-bold mb-2">Based in San Francisco</h2>
                <p className="text-lg text-white/80 mb-6">
                  With team members across the United States
                </p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Y Combinator backed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>30+ team members</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to join 2,500+ mortgage professionals?
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Start your free trial today. No credit card required.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-1"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
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
