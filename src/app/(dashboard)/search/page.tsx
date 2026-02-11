"use client";

import { useState, useMemo, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Download,
  ListPlus,
  Eye,
  MapPin,
  Home,
  X,
  Loader2,
  Plus,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency, formatPercent, getLeadStatusColor } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useSearchProperties, useLead } from "@/hooks/use-api";
import { AddToListDialog } from "@/components/add-to-list-dialog";
import type { SearchResult } from "@/types";

const propertyTypeOptions = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const loanTypeOptions = [
  { value: "conventional", label: "Conventional" },
  { value: "fha", label: "FHA" },
  { value: "va", label: "VA" },
  { value: "jumbo", label: "Jumbo" },
  { value: "usda", label: "USDA" },
];

const sortOptions = [
  { value: "interest_rate-desc", label: "Rate: High to Low (Best Leads)" },
  { value: "estimated_equity-desc", label: "Equity: High to Low" },
  { value: "estimated_value-desc", label: "Value: High to Low" },
  { value: "estimated_value-asc", label: "Value: Low to High" },
];

// Type for real property lookup result
interface PropertyLookupResult {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  owner_name?: string;
  owner_occupied?: boolean;
  absentee_owner?: boolean;
  estimated_value?: number;
  year_built?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  last_sale_date?: string;
  last_sale_price?: number;
  original_loan_amount?: number;
  lender_name?: string;
  mortgage_estimate?: {
    originalAmount: number;
    originalRate: number;
    rateSource: string;
    currentBalance: number;
    monthlyPayment: number;
    equityPercent: number;
    ltvPercent: number;
    paymentsRemaining: number;
  };
  refinance_savings?: {
    currentMonthlyPayment: number;
    newMonthlyPayment: number;
    monthlySavings: number;
    totalSavings: number;
    breakEvenMonths: number;
  };
}

interface AddressSuggestion {
  display: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { selectedLeadIds, toggleLeadSelection, clearSelection, setActiveLeadId, setAddToListDialogOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [loanType, setLoanType] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [absenteeOnly, setAbsenteeOnly] = useState(false);
  const [armOnly, setArmOnly] = useState(false);
  const [sortBy, setSortBy] = useState("interest_rate-desc");

  // Real property lookup state
  const [activeTab, setActiveTab] = useState<"database" | "lookup">("database");
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupCity, setLookupCity] = useState("");
  const [lookupState, setLookupState] = useState("TX");
  const [lookupZip, setLookupZip] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<PropertyLookupResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoLookupDone, setAutoLookupDone] = useState(false);

  // Address autocomplete state
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Check for URL params from dashboard and auto-populate
  useEffect(() => {
    const address = searchParams.get("address");
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    if (address && city && !autoLookupDone) {
      setLookupAddress(address);
      setLookupCity(city);
      if (state) setLookupState(state);
      setActiveTab("lookup");
      setAutoLookupDone(true);

      // Auto-trigger lookup
      setTimeout(() => {
        doPropertyLookup(address, city, state || "TX");
      }, 100);
    }
  }, [searchParams, autoLookupDone]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lookup function that can be called with params
  async function doPropertyLookup(address: string, city: string, state: string) {
    if (!address || !city) {
      setLookupError("Address and city are required");
      return;
    }

    setLookupLoading(true);
    setLookupError("");
    setLookupResult(null);
    setSaveSuccess(false);

    try {
      const params = new URLSearchParams({ address, city, state });
      const response = await fetch(`/api/properties/lookup?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Property not found");
      }

      setLookupResult(data.property);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  }

  // Fetch address suggestions from Radar.io
  async function fetchAddressSuggestions(query: string) {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/address/autocomplete?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.addresses || []);
        setShowSuggestions(data.addresses?.length > 0);
      }
    } catch (err) {
      console.error("Address autocomplete error:", err);
    }
  }

  // Handle address input with debounced autocomplete
  function handleAddressInput(value: string) {
    setLookupAddress(value);
    setLookupError("");

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
  }

  // Select an address suggestion
  function selectAddress(addr: AddressSuggestion) {
    setLookupAddress(addr.street);
    setLookupCity(addr.city);
    setLookupState(addr.state);
    setLookupZip(addr.zip);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  // Real property lookup function
  async function handlePropertyLookup() {
    await doPropertyLookup(lookupAddress, lookupCity, lookupState);
  }

  // Save property to database
  async function handleSaveProperty() {
    if (!lookupAddress || !lookupCity) return;

    setLookupLoading(true);
    try {
      const params = new URLSearchParams({
        address: lookupAddress,
        city: lookupCity,
        state: lookupState,
        save: "true",
      });
      if (lookupZip) params.set("zip", lookupZip);

      const response = await fetch(`/api/properties/lookup?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setSaveSuccess(true);
      setLookupResult(data.property);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLookupLoading(false);
    }
  }

  // Use the API hook for real data
  const { data: searchData, isLoading: searchLoading } = useSearchProperties({
    query: query || undefined,
    property_type: propertyType || undefined,
    loan_type: loanType || undefined,
    min_value: minValue ? Number(minValue) : undefined,
    max_value: maxValue ? Number(maxValue) : undefined,
    is_absentee: absenteeOnly || undefined,
    is_arm: armOnly || undefined,
  });

  const results = useMemo(() => {
    const data = searchData?.data ?? [];
    let filtered = [...data];

    // Client-side sorting (API may not support all sort options)
    const [sortField, sortDir] = sortBy.split("-");
    filtered.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;
      if (sortField === "estimated_value") {
        aVal = a.property.estimated_value ?? 0;
        bVal = b.property.estimated_value ?? 0;
      } else if (sortField === "estimated_equity") {
        aVal = a.mortgage?.estimated_equity ?? 0;
        bVal = b.mortgage?.estimated_equity ?? 0;
      } else if (sortField === "interest_rate") {
        aVal = a.mortgage?.interest_rate ?? 0;
        bVal = b.mortgage?.interest_rate ?? 0;
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [searchData, sortBy]);

  const allSelected = results.length > 0 && results.every((r) => r.lead && selectedLeadIds.includes(r.lead.id));

  function toggleAll() {
    if (allSelected) {
      clearSelection();
    } else {
      const ids = results.filter((r) => r.lead).map((r) => r.lead!.id);
      useAppStore.setState({ selectedLeadIds: ids });
    }
  }

  const activeFilters = [propertyType, loanType, minValue, maxValue, absenteeOnly, armOnly].filter(Boolean).length;

  // Export results to CSV
  function handleExport() {
    // Determine which results to export (selected or all filtered)
    const dataToExport = selectedLeadIds.length > 0
      ? results.filter((r) => r.lead && selectedLeadIds.includes(r.lead.id))
      : results;

    if (dataToExport.length === 0) {
      alert("No results to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Address",
      "City",
      "State",
      "ZIP",
      "Property Type",
      "Bedrooms",
      "Bathrooms",
      "Sqft",
      "Year Built",
      "Estimated Value",
      "Owner First Name",
      "Owner Last Name",
      "Is Absentee",
      "Lender",
      "Loan Amount",
      "Interest Rate",
      "Loan Type",
      "Is ARM",
      "Estimated Equity",
      "LTV Ratio",
      "Monthly Payment",
      "Lead Score",
      "Lead Status",
      "Tags",
    ];

    // Convert data to CSV rows
    const rows = dataToExport.map((r) => [
      r.property.address,
      r.property.city,
      r.property.state,
      r.property.zip,
      r.property.property_type,
      r.property.bedrooms ?? "",
      r.property.bathrooms ?? "",
      r.property.sqft ?? "",
      r.property.year_built ?? "",
      r.property.estimated_value ?? "",
      r.owner.first_name,
      r.owner.last_name,
      r.owner.is_absentee ? "Yes" : "No",
      r.mortgage?.lender_name ?? "",
      r.mortgage?.loan_amount ?? "",
      r.mortgage?.interest_rate ?? "",
      r.mortgage?.loan_type ?? "",
      r.mortgage?.is_arm ? "Yes" : "No",
      r.mortgage?.estimated_equity ?? "",
      r.mortgage?.ltv_ratio ?? "",
      r.mortgage?.monthly_payment ?? "",
      r.lead?.score ?? "",
      r.lead?.status ?? "",
      r.lead?.tags?.join("; ") ?? "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const str = String(cell);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `mortgage-leads-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Search</h1>
          <p className="text-muted-foreground text-sm">
            Search database or lookup real properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedLeadIds.length > 0 && (
            <>
              <Badge variant="secondary">
                {selectedLeadIds.length} selected
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setAddToListDialogOpen(true)}>
                <ListPlus className="h-4 w-4 mr-1" />
                Add to List
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export{selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ""}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        <button
          onClick={() => setActiveTab("database")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "database"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Database Search
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
            activeTab === "lookup"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Property Lookup
        </button>
      </div>

      {/* Property Lookup Tab */}
      {activeTab === "lookup" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Quick Property Lookup
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter any address to get owner info, property value, and mortgage details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2 space-y-1.5 relative">
                  <label className="text-xs font-medium text-muted-foreground">Street Address</label>
                  <Input
                    ref={addressInputRef}
                    placeholder="Start typing an address..."
                    value={lookupAddress}
                    onChange={(e) => handleAddressInput(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowSuggestions(false);
                      }
                    }}
                  />
                  {/* Address suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      {suggestions.map((addr, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 border-b last:border-b-0"
                          onClick={() => selectAddress(addr)}
                        >
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span>{addr.display}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">City</label>
                  <Input
                    placeholder="Irvine"
                    value={lookupCity}
                    onChange={(e) => setLookupCity(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">State</label>
                    <Input
                      placeholder="CA"
                      value={lookupState}
                      onChange={(e) => setLookupState(e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">ZIP</label>
                    <Input
                      placeholder="92618"
                      value={lookupZip}
                      onChange={(e) => setLookupZip(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {lookupError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                  {lookupError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={handlePropertyLookup} disabled={lookupLoading || !lookupAddress || !lookupCity}>
                  {lookupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Look Up Property
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Free tier: 100 lookups/month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lookup Result */}
          {lookupResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
              {/* Property Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{lookupResult.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {lookupResult.city}, {lookupResult.state} {lookupResult.zip_code}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Value</p>
                      <p className="font-semibold text-lg">
                        {lookupResult.estimated_value ? formatCurrency(lookupResult.estimated_value) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Year Built</p>
                      <p className="font-medium">{lookupResult.year_built || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Beds / Baths</p>
                      <p className="font-medium">{lookupResult.bedrooms || "—"} / {lookupResult.bathrooms || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sqft</p>
                      <p className="font-medium">{lookupResult.sqft?.toLocaleString() || "—"}</p>
                    </div>
                  </div>
                  {lookupResult.last_sale_date && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Last Sale</p>
                      <p className="text-sm">
                        {lookupResult.last_sale_price ? formatCurrency(lookupResult.last_sale_price) : "—"} on{" "}
                        {new Date(lookupResult.last_sale_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Owner Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Owner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{lookupResult.owner_name || "Unknown"}</p>
                    <div className="flex gap-1.5 mt-1">
                      {lookupResult.owner_occupied && (
                        <Badge variant="secondary" className="text-[10px]">Owner Occupied</Badge>
                      )}
                      {lookupResult.absentee_owner && (
                        <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-700">
                          Absentee
                        </Badge>
                      )}
                    </div>
                  </div>
                  {lookupResult.lender_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Original Lender</p>
                      <p className="text-sm font-medium">{lookupResult.lender_name}</p>
                    </div>
                  )}
                  {lookupResult.original_loan_amount && (
                    <div>
                      <p className="text-xs text-muted-foreground">Original Loan</p>
                      <p className="text-sm font-medium">{formatCurrency(lookupResult.original_loan_amount)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mortgage Estimate */}
              <Card className={lookupResult.refinance_savings ? "border-green-200 bg-green-50/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Mortgage Estimate
                    {lookupResult.mortgage_estimate?.rateSource && (
                      <Badge variant="outline" className="text-[10px]">
                        {lookupResult.mortgage_estimate.rateSource === "recorded" ? "Recorded Rate" :
                         lookupResult.mortgage_estimate.rateSource === "freddie_mac" ? "Freddie Mac" : "Estimated"}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lookupResult.mortgage_estimate ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Est. Rate</p>
                          <p className="font-semibold text-lg">{lookupResult.mortgage_estimate.originalRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Est. Balance</p>
                          <p className="font-medium">{formatCurrency(lookupResult.mortgage_estimate.currentBalance)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Payment</p>
                          <p className="font-medium">{formatCurrency(lookupResult.mortgage_estimate.monthlyPayment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Equity</p>
                          <p className="font-medium text-green-600">{lookupResult.mortgage_estimate.equityPercent}%</p>
                        </div>
                      </div>

                      {lookupResult.refinance_savings && lookupResult.refinance_savings.monthlySavings > 0 && (
                        <div className="pt-2 border-t border-green-200">
                          <div className="flex items-center gap-1.5 text-green-700 mb-2">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-semibold">Refinance Opportunity!</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Monthly Savings</p>
                              <p className="font-semibold text-green-700">
                                {formatCurrency(lookupResult.refinance_savings.monthlySavings)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Break Even</p>
                              <p className="font-medium">{lookupResult.refinance_savings.breakEvenMonths} months</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No mortgage data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="lg:col-span-3 flex items-center gap-2">
                <Button onClick={handleSaveProperty} disabled={lookupLoading || saveSuccess}>
                  {saveSuccess ? (
                    <>
                      <Badge className="bg-green-600 mr-2">Saved</Badge>
                      Property added to database
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Save to Database
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  setLookupResult(null);
                  setLookupAddress("");
                  setLookupCity("");
                  setLookupZip("");
                  setSaveSuccess(false);
                }}>
                  Clear & Search Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Database Search Tab */}
      {activeTab === "database" && (
        <>
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, city, or owner name..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Filters
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
              {activeFilters}
            </Badge>
          )}
        </Button>
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-52 shrink-0"
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Property Type</label>
                <Select
                  options={propertyTypeOptions}
                  placeholder="Any"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Loan Type</label>
                <Select
                  options={loanTypeOptions}
                  placeholder="Any"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Min Value</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Max Value</label>
                <Input
                  type="number"
                  placeholder="No max"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                />
              </div>
              <div className="space-y-3 pt-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={absenteeOnly} onCheckedChange={(c) => setAbsenteeOnly(c)} />
                  Absentee Only
                </label>
              </div>
              <div className="space-y-3 pt-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={armOnly} onCheckedChange={(c) => setArmOnly(c)} />
                  ARM Only
                </label>
              </div>
            </div>
            {activeFilters > 0 && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPropertyType("");
                    setLoanType("");
                    setMinValue("");
                    setMaxValue("");
                    setAbsenteeOnly(false);
                    setArmOnly(false);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {searchLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </span>
        ) : (
          `${results.length} result${results.length !== 1 ? "s" : ""} found`
        )}
      </div>

      {/* Results table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-left w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Property
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Owner
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Value / Equity
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mortgage
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="p-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const isSelected = result.lead ? selectedLeadIds.includes(result.lead.id) : false;
                return (
                  <tr
                    key={result.property.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/30 cursor-pointer",
                      isSelected && "bg-primary/5"
                    )}
                    onClick={() => result.lead && setActiveLeadId(result.lead.id)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => result.lead && toggleLeadSelection(result.lead.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
                          <Home className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{result.property.address}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {result.property.city}, {result.property.state} {result.property.zip}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {result.property.bedrooms}bd / {result.property.bathrooms}ba
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {result.property.sqft?.toLocaleString()} sqft
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium">
                        {result.owner.first_name} {result.owner.last_name}
                      </p>
                      {result.owner.is_absentee && (
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          Absentee
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium">
                        {result.property.estimated_value
                          ? formatCurrency(result.property.estimated_value)
                          : "—"}
                      </p>
                      {result.mortgage?.estimated_equity && (
                        <p className="text-xs text-green-600">
                          {formatCurrency(result.mortgage.estimated_equity)} equity
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      {result.mortgage ? (
                        <div>
                          <p className="text-sm">
                            {result.mortgage.interest_rate}%{" "}
                            <span className="text-muted-foreground">
                              {result.mortgage.loan_type.toUpperCase()}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.mortgage.lender_name}
                          </p>
                          {result.mortgage.is_arm && (
                            <Badge variant="destructive" className="text-[10px] mt-0.5">
                              ARM
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {result.lead ? (
                        <Badge className={cn("text-[10px] capitalize", getLeadStatusColor(result.lead.status))}>
                          {result.lead.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (result.lead) setActiveLeadId(result.lead.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {results.length === 0 && !searchLoading && (
          <div className="p-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No properties in database</p>
            <p className="text-sm mt-1">Use the "Property Lookup" tab to add new leads</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setActiveTab("lookup")}
            >
              <Search className="h-4 w-4 mr-1" />
              Quick Lookup
            </Button>
          </div>
        )}
      </Card>
        </>
      )}

      {/* Lead detail sheet */}
      <LeadDetailSheet />

      {/* Add to List dialog */}
      <AddToListDialog />
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

// ---- Lead Detail Sheet (inline) ----
function LeadDetailSheet() {
  const { activeLeadId, setActiveLeadId } = useAppStore();
  const { data: lead, isLoading, refetch } = useLead(activeLeadId);
  const [revealing, setRevealing] = useState(false);

  async function handleRevealContact() {
    if (!activeLeadId) return;

    setRevealing(true);
    try {
      const response = await fetch(`/api/leads/${activeLeadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_revealed: true }),
      });

      if (response.ok) {
        // Refetch to get updated lead data
        refetch();
      }
    } catch (err) {
      console.error("Failed to reveal contact:", err);
    } finally {
      setRevealing(false);
    }
  }

  if (!activeLeadId || isLoading) return null;
  if (!lead) return null;

  // Activities would come from a separate hook in production
  const activities: { id: string; title: string; description?: string; created_at: string }[] = [];

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={() => setActiveLeadId(null)} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              {lead.owner?.first_name} {lead.owner?.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">{lead.property?.address}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setActiveLeadId(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status and Score */}
          <div className="flex items-center gap-3">
            <Badge className={cn("capitalize", getLeadStatusColor(lead.status))}>
              {lead.status}
            </Badge>
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
              lead.score >= 80 ? "bg-green-100 text-green-800" : lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
            )}>
              {lead.score}
            </div>
            <div className="flex flex-wrap gap-1">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Contact Information
                {!lead.contact_revealed && (
                  <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                )}
              </h3>
              {lead.contact_revealed ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{lead.owner?.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{lead.owner?.email ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Mailing Address</p>
                    <p className="font-medium">
                      {lead.owner?.mailing_address}, {lead.owner?.mailing_city}, {lead.owner?.mailing_state} {lead.owner?.mailing_zip}
                    </p>
                  </div>
                </div>
              ) : (
                <Button size="sm" className="w-full" onClick={handleRevealContact} disabled={revealing}>
                  {revealing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Revealing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Reveal Contact Info
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold">Property Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{lead.property?.property_type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Value</p>
                  <p className="font-medium">{lead.property?.estimated_value ? formatCurrency(lead.property.estimated_value) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Beds / Baths</p>
                  <p className="font-medium">{lead.property?.bedrooms}bd / {lead.property?.bathrooms}ba</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sqft</p>
                  <p className="font-medium">{lead.property?.sqft?.toLocaleString() ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Year Built</p>
                  <p className="font-medium">{lead.property?.year_built ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">County</p>
                  <p className="font-medium">{lead.property?.county}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mortgage Details */}
          {lead.mortgage && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold">Mortgage Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Lender</p>
                    <p className="font-medium">{lead.mortgage.lender_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">{lead.mortgage.loan_amount ? formatCurrency(lead.mortgage.loan_amount) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="font-medium">{lead.mortgage.interest_rate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium uppercase">{lead.mortgage.loan_type}{lead.mortgage.is_arm ? " (ARM)" : ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LTV Ratio</p>
                    <p className="font-medium">{lead.mortgage.ltv_ratio ? formatPercent(lead.mortgage.ltv_ratio) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Equity</p>
                    <p className="font-medium text-green-600">{lead.mortgage.estimated_equity ? formatCurrency(lead.mortgage.estimated_equity) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    <p className="font-medium">{lead.mortgage.monthly_payment ? formatCurrency(lead.mortgage.monthly_payment) : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-1">Notes</h3>
                <p className="text-sm text-muted-foreground">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Activity Feed */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Activity</h3>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{act.title}</p>
                      {act.description && (
                        <p className="text-xs text-muted-foreground">{act.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(act.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
