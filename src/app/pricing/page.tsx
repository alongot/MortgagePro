"use client";

import Link from "next/link";
import {
  Building2,
  Check,
  X,
  Zap,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    description: "For individual loan officers getting started",
    price: { monthly: 49, annual: 39 },
    features: [
      { name: "500 property searches/mo", included: true },
      { name: "50 contact reveals/mo", included: true },
      { name: "3 custom lists", included: true },
      { name: "Pipeline management", included: true },
      { name: "Email support", included: true },
      { name: "Analytics dashboard", included: false },
      { name: "Team management", included: false },
      { name: "API access", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "For growing teams and power users",
    price: { monthly: 149, annual: 119 },
    features: [
      { name: "Unlimited searches", included: true },
      { name: "500 contact reveals/mo", included: true },
      { name: "Unlimited lists", included: true },
      { name: "Pipeline + task management", included: true },
      { name: "Priority support", included: true },
      { name: "Analytics dashboard", included: true },
      { name: "Team management (up to 5)", included: true },
      { name: "API access", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large brokerages and teams",
    price: { monthly: 399, annual: 319 },
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Unlimited contact reveals", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Full API access", included: true },
      { name: "SSO & advanced security", included: true },
      { name: "Custom training", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try MortgagePro before committing?",
    answer: "Yes! All plans come with a 14-day free trial. No credit card required to start. You'll have full access to all features during your trial period.",
  },
  {
    question: "What happens when I run out of contact reveals?",
    answer: "You can purchase additional contact reveal credits at any time, or upgrade to a higher plan. Unused credits roll over for up to 3 months.",
  },
  {
    question: "Can I change plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! When you pay annually, you save 20% compared to monthly billing. That's like getting 2+ months free every year.",
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts. You can cancel at any time. If you cancel, you'll retain access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange ACH transfers for Enterprise accounts.",
  },
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

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <Link href="/pricing" className="text-blue-600 font-semibold">Pricing</Link>
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
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-100/60 blur-3xl animate-float" />
          <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-3xl animate-float delay-1000" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-hero-text">
              <Zap className="h-3.5 w-3.5" />
              Simple, transparent pricing
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 animate-hero-text delay-100">
              Choose your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                perfect plan
              </span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 animate-blur-in delay-200">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl animate-blur-in delay-300">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                  !isAnnual ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  isAnnual ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Annual
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10 pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <AnimatedSection key={plan.name} delay={index * 100}>
                <div
                  className={cn(
                    "relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col",
                    plan.popular
                      ? "border-2 border-blue-600 bg-white shadow-xl shadow-blue-600/10 scale-[1.02]"
                      : "border border-gray-200 bg-white hover:shadow-lg"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/25">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  <div className="mt-6 mb-8">
                    <span className="text-5xl font-extrabold text-gray-900">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-gray-500 ml-1">/month</span>
                    {isAnnual && (
                      <p className="text-sm text-emerald-600 mt-1">
                        Billed annually (${(isAnnual ? plan.price.annual : plan.price.monthly) * 12}/year)
                      </p>
                    )}
                  </div>
                  <Link
                    href="/auth/register"
                    className={cn(
                      "block text-center rounded-xl py-3 font-semibold transition-all text-sm active:scale-[0.98]",
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-xl"
                        : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="mt-8 space-y-3.5 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.name}
                        className={cn(
                          "flex items-start gap-2.5 text-sm",
                          feature.included ? "text-gray-600" : "text-gray-400"
                        )}
                      >
                        {feature.included ? (
                          <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                        )}
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare all features</h2>
              <p className="text-gray-500">See exactly what's included in each plan</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 pr-4 font-semibold text-gray-900">Feature</th>
                    <th className="py-4 px-4 font-semibold text-gray-900 text-center">Starter</th>
                    <th className="py-4 px-4 font-semibold text-blue-600 text-center">Professional</th>
                    <th className="py-4 px-4 font-semibold text-gray-900 text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { feature: "Property searches", starter: "500/mo", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Contact reveals", starter: "50/mo", pro: "500/mo", enterprise: "Unlimited" },
                    { feature: "Custom lists", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Pipeline management", starter: true, pro: true, enterprise: true },
                    { feature: "Task management", starter: false, pro: true, enterprise: true },
                    { feature: "Analytics dashboard", starter: false, pro: true, enterprise: true },
                    { feature: "Team members", starter: "1", pro: "5", enterprise: "Unlimited" },
                    { feature: "API access", starter: false, pro: false, enterprise: true },
                    { feature: "Custom integrations", starter: false, pro: false, enterprise: true },
                    { feature: "SSO", starter: false, pro: false, enterprise: true },
                    { feature: "Support", starter: "Email", pro: "Priority", enterprise: "Dedicated" },
                  ].map((row) => (
                    <tr key={row.feature} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pr-4 text-gray-700">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? (
                            <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-600">{row.starter}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center bg-blue-50/50">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-900 font-medium">{row.pro}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? (
                            <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-600">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <p className="text-gray-500">Everything you need to know about pricing</p>
            </div>
          </AnimatedSection>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 50}>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <HelpCircle
                      className={cn(
                        "h-5 w-5 text-gray-400 shrink-0 transition-transform",
                        openFaq === index && "rotate-180 text-blue-600"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openFaq === index ? "max-h-48" : "max-h-0"
                    )}
                  >
                    <p className="px-6 pb-4 text-gray-500">{faq.answer}</p>
                  </div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-700" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
              <div className="relative px-8 py-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Still have questions?
                </h2>
                <p className="text-emerald-100 text-lg mb-8 max-w-lg mx-auto">
                  Our team is here to help. Schedule a demo and we'll show you exactly how MortgagePro can help your business.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1"
                  >
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <button className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                    Schedule Demo
                  </button>
                </div>
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
