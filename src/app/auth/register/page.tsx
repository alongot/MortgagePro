"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Target,
  Briefcase,
  TrendingUp,
  Building,
  Check,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchCities, City } from "@/lib/data/us-cities";

const STEPS = [
  { id: 1, title: "Create Account", icon: Building2 },
  { id: 2, title: "Experience", icon: Briefcase },
  { id: 3, title: "Target Markets", icon: MapPin },
  { id: 4, title: "Rate Targeting", icon: Target },
];

const EXPERIENCE_LEVELS = [
  { id: "new", label: "New to Mortgage", description: "Less than 1 year in the industry", icon: Sparkles },
  { id: "growing", label: "Growing My Business", description: "1-3 years, building my pipeline", icon: TrendingUp },
  { id: "established", label: "Established Broker", description: "3+ years, consistent closings", icon: Building },
  { id: "team", label: "Running a Team", description: "Managing multiple loan officers", icon: Users },
];

const MARKETS = [
  { id: "orange_county", label: "Orange County, CA", hot: true, available: true },
  { id: "los_angeles", label: "Los Angeles, CA", hot: true, available: false },
  { id: "san_diego", label: "San Diego, CA", hot: true, available: false },
  { id: "riverside", label: "Riverside, CA", hot: false, available: false },
  { id: "san_bernardino", label: "San Bernardino, CA", hot: false, available: false },
  { id: "ventura", label: "Ventura, CA", hot: false, available: false },
];

const RATE_TARGETS = [
  { id: "rate_6_plus", label: "6%+ Interest Rates", description: "Homeowners paying 6% or higher", icon: "🔥" },
  { id: "rate_5_6", label: "5-6% Interest Rates", description: "Moderate savings potential", icon: "📈" },
  { id: "arm_loans", label: "ARM Loans", description: "Adjustable rates about to reset", icon: "⚠️" },
  { id: "high_equity", label: "High Equity (40%+)", description: "Great candidates for cash-out refi", icon: "💰" },
  { id: "recent_origination", label: "2022-2023 Originations", description: "Locked in during rate peak", icon: "📅" },
  { id: "jumbo_loans", label: "Jumbo Loans", description: "High-value refinance opportunities", icon: "🏦" },
];


export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Onboarding data
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [customCity, setCustomCity] = useState("");
  const [customState, setCustomState] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRateTargets, setSelectedRateTargets] = useState<string[]>([]);

  // Handle city search
  const handleCitySearch = (query: string) => {
    setCityQuery(query);
    if (query.length >= 2) {
      const results = searchCities(query, 8);
      setCitySuggestions(results);
      setShowSuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a city from suggestions
  const selectCity = (city: City) => {
    setCustomCity(city.name);
    setCustomState(city.stateCode);
    setCityQuery(`${city.name}, ${city.stateCode}`);
    setShowSuggestions(false);
    setSelectedMarkets([]); // Clear market selection
  };

  const progress = (currentStep / STEPS.length) * 100;

  const passwordsMatch = password === confirmPassword;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fullName && email && password.length >= 8 && passwordsMatch && confirmPassword.length > 0;
      case 2:
        return selectedExperience !== "";
      case 3:
        // Allow either selected market OR custom city
        return selectedMarkets.length > 0 || (customCity.trim().length > 0 && customState.trim().length > 0);
      case 4:
        return selectedRateTargets.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Claim free leads for the user's target market
  async function claimFreeLeadsForUser(targetMarket: string) {
    try {
      // Parse city and state from target market string
      const parts = targetMarket.split(",").map(s => s.trim());
      if (parts.length < 2) {
        console.log("Invalid target market format:", targetMarket);
        return;
      }

      const city = parts[0];
      const state = parts[1];

      console.log("Claiming free leads for:", { city, state });

      const response = await fetch("/api/leads/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, state }),
      });

      const data = await response.json();
      console.log("Free leads response:", data);

      if (!response.ok) {
        console.error("Failed to claim free leads:", data.error);
      } else {
        console.log(`Successfully claimed ${data.leads_created} free leads!`);
      }
    } catch (error) {
      console.error("Error claiming free leads:", error);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      // Get target market info
      const targetMarket = customCity.trim()
        ? `${customCity.trim()}, ${customState.trim()}`
        : selectedMarkets.join(", ");

      console.log("Starting signup...");

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            experience_level: selectedExperience,
            target_markets: targetMarket,
            rate_targets: selectedRateTargets,
          },
        },
      });

      console.log("Signup response:", { user: data.user?.id, session: !!data.session, error: signUpError });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log("No session - email confirmation might be required");
        // Try signing in immediately since email confirm might be off
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Sign in attempt:", { session: !!signInData?.session, error: signInError });

        if (signInError) {
          setError("Account created! Check your email to confirm, then sign in.");
          return;
        }

        if (signInData.session) {
          console.log("Sign in successful, claiming free leads...");
          await claimFreeLeadsForUser(targetMarket);
          window.location.replace("/dashboard");
          return;
        }
      }

      // If we have a session from signup, redirect
      if (data.session) {
        console.log("Session from signup, claiming free leads...");
        await claimFreeLeadsForUser(targetMarket);
        window.location.replace("/dashboard");
        return;
      }

      // No session - email confirmation is probably required
      // Show success message and redirect to login
      console.log("No session - redirecting to login");
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.replace("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  const toggleSelection = (
    id: string,
    selected: string[],
    setSelected: (val: string[]) => void,
    max?: number
  ) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (!max || selected.length < max) {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex">
      {/* Left Side - Progress & Branding */}
      <div className="hidden lg:flex lg:w-[400px] bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-8 flex-col relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float delay-500" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MortgagePro</span>
          </Link>

          {/* Steps */}
          <div className="space-y-4">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
                    isActive && "bg-white/20 backdrop-blur",
                    isCompleted && "opacity-60"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive && "bg-white text-primary scale-110",
                      isCompleted && "bg-white/30 text-white",
                      !isActive && !isCompleted && "bg-white/10 text-white/60"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-white" : "text-white/60"
                    )}>
                      Step {step.id}
                    </p>
                    <p className={cn(
                      "text-sm transition-colors",
                      isActive ? "text-white" : "text-white/40"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="mt-auto relative z-10">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur">
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              &ldquo;I searched for homeowners paying 6.5%+ in my zip code and found 200+ refinance candidates in minutes. Closed 4 deals in my first month.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20" />
              <div>
                <p className="text-white font-medium text-sm">Marcus Thompson</p>
                <p className="text-white/60 text-xs">Mortgage Broker, Denver</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold">MortgagePro</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {/* Step 1: Account Creation */}
            {currentStep === 1 && (
              <div className="animate-card-in space-y-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    Create your account
                  </h1>
                  <p className="text-muted-foreground">
                    Start your 14-day free trial. No credit card required.
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg animate-scale-in">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg animate-scale-in">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Work Email</label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                          "h-12 pr-10",
                          confirmPassword.length > 0 && !passwordsMatch && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword.length > 0 && passwordsMatch && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center lg:text-left">
                  By creating an account, you agree to our{" "}
                  <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{" "}
                  <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
                </p>
              </div>
            )}

            {/* Step 2: Experience Level */}
            {currentStep === 2 && (
              <div className="animate-card-in space-y-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    Where are you in your mortgage career?
                  </h1>
                  <p className="text-muted-foreground">
                    This helps us customize your refinance lead filters
                  </p>
                </div>

                <div className="grid gap-3">
                  {EXPERIENCE_LEVELS.map((level, index) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedExperience(level.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 animate-card-in group",
                        selectedExperience === level.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200",
                        selectedExperience === level.id
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-muted text-muted-foreground group-hover:scale-105"
                      )}>
                        <level.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      {selectedExperience === level.id && (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-scale-in-bounce">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Target Markets */}
            {currentStep === 3 && (
              <div className="animate-card-in space-y-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    Where do you want to find leads?
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your target city or select from popular markets
                  </p>
                </div>

                {/* Custom City Input with Autocomplete */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Search for your target city</label>
                  <div className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Type a city name... (e.g. San Antonio, Miami, Denver)"
                        value={cityQuery}
                        onChange={(e) => handleCitySearch(e.target.value)}
                        onFocus={() => cityQuery.length >= 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="h-12 pl-10"
                      />
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-xl shadow-lg overflow-hidden">
                        {citySuggestions.map((city, index) => (
                          <button
                            key={`${city.name}-${city.stateCode}-${index}`}
                            type="button"
                            onClick={() => selectCity(city)}
                            className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors"
                          >
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                              <span className="font-medium">{city.name}</span>
                              <span className="text-muted-foreground">, {city.stateCode}</span>
                              <span className="text-xs text-muted-foreground ml-2">({city.stateName})</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No results message */}
                    {showSuggestions && cityQuery.length >= 2 && citySuggestions.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-xl shadow-lg p-4 text-center text-muted-foreground">
                        No cities found. Try a different search.
                      </div>
                    )}
                  </div>

                  {/* Selected city display */}
                  {customCity && customState && (
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{customCity}, {customState}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCity("");
                          setCustomState("");
                          setCityQuery("");
                        }}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or select a market</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {MARKETS.map((market, index) => (
                    <button
                      key={market.id}
                      onClick={() => {
                        if (market.available) {
                          toggleSelection(market.id, selectedMarkets, setSelectedMarkets, 5);
                          // Clear custom city when selecting a market
                          setCustomCity("");
                        }
                      }}
                      disabled={!market.available}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all duration-200 animate-card-in group",
                        !market.available && "opacity-50 cursor-not-allowed",
                        selectedMarkets.includes(market.id)
                          ? "border-primary bg-primary/5"
                          : market.available
                            ? "border-border hover:border-primary/50"
                            : "border-border"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={cn(
                          "h-4 w-4 transition-colors",
                          selectedMarkets.includes(market.id) ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-sm font-medium">{market.label}</span>
                      </div>
                      {market.available ? (
                        market.hot && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                            AVAILABLE
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                          COMING SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  {customCity.trim()
                    ? `Target market: ${customCity.trim()}, ${customState}`
                    : selectedMarkets.length > 0
                      ? "Market selected"
                      : "Enter a city or select a market to continue"}
                </p>
              </div>
            )}

            {/* Step 4: Rate Targeting */}
            {currentStep === 4 && (
              <div className="animate-card-in space-y-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    What refinance opportunities do you want to target?
                  </h1>
                  <p className="text-muted-foreground">
                    Select all that apply — we&apos;ll set up your default search filters
                  </p>
                </div>

                {/* Free Leads Banner */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">10 Free Leads Included!</p>
                      <p className="text-sm text-green-700">
                        When you complete signup, we&apos;ll instantly generate 10 real refinancing leads in{" "}
                        <span className="font-semibold">
                          {customCity.trim() ? `${customCity.trim()}, ${customState}` : selectedMarkets[0]?.replace("_", " ") || "your selected market"}
                        </span>{" "}
                        — homeowners who bought during the 2022-2023 rate peak.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {RATE_TARGETS.map((target, index) => (
                    <button
                      key={target.id}
                      onClick={() => toggleSelection(target.id, selectedRateTargets, setSelectedRateTargets)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 animate-card-in group",
                        selectedRateTargets.includes(target.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-2xl">{target.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{target.label}</p>
                        <p className="text-sm text-muted-foreground">{target.description}</p>
                      </div>
                      {selectedRateTargets.includes(target.id) && (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-scale-in-bounce">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="gap-2 min-w-[140px]"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating your leads...
                  </>
                ) : currentStep === STEPS.length ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get My 10 Free Leads
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
