"use client";

import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  ListPlus,
  Eye,
  MapPin,
  Home,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockData } from "@/lib/mock-data";
import { cn, formatCurrency, formatPercent, getLeadStatusColor } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

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
  { value: "estimated_value-desc", label: "Value: High to Low" },
  { value: "estimated_value-asc", label: "Value: Low to High" },
  { value: "estimated_equity-desc", label: "Equity: High to Low" },
  { value: "interest_rate-desc", label: "Rate: High to Low" },
  { value: "score-desc", label: "Lead Score: High to Low" },
];

export default function SearchPage() {
  const { selectedLeadIds, toggleLeadSelection, clearSelection, setActiveLeadId, setAddToListDialogOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [loanType, setLoanType] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [absenteeOnly, setAbsenteeOnly] = useState(false);
  const [armOnly, setArmOnly] = useState(false);
  const [sortBy, setSortBy] = useState("estimated_value-desc");

  const results = useMemo(() => {
    let filtered = [...mockData.searchResults];

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.property.address.toLowerCase().includes(q) ||
          r.property.city.toLowerCase().includes(q) ||
          r.owner.first_name.toLowerCase().includes(q) ||
          r.owner.last_name.toLowerCase().includes(q)
      );
    }

    if (propertyType) {
      filtered = filtered.filter((r) => r.property.property_type === propertyType);
    }
    if (loanType) {
      filtered = filtered.filter((r) => r.mortgage?.loan_type === loanType);
    }
    if (minValue) {
      filtered = filtered.filter(
        (r) => (r.property.estimated_value ?? 0) >= Number(minValue)
      );
    }
    if (maxValue) {
      filtered = filtered.filter(
        (r) => (r.property.estimated_value ?? 0) <= Number(maxValue)
      );
    }
    if (absenteeOnly) {
      filtered = filtered.filter((r) => r.owner.is_absentee);
    }
    if (armOnly) {
      filtered = filtered.filter((r) => r.mortgage?.is_arm);
    }

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
      } else if (sortField === "score") {
        aVal = a.lead?.score ?? 0;
        bVal = b.lead?.score ?? 0;
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [query, propertyType, loanType, minValue, maxValue, absenteeOnly, armOnly, sortBy]);

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

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Search</h1>
          <p className="text-muted-foreground text-sm">
            Search and filter mortgage records
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

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
        {results.length} result{results.length !== 1 ? "s" : ""} found
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
                  Score
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
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                              result.lead.score >= 80
                                ? "bg-green-100 text-green-800"
                                : result.lead.score >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {result.lead.score}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
        {results.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No results found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </Card>

      {/* Lead detail sheet */}
      <LeadDetailSheet />
    </div>
  );
}

// ---- Lead Detail Sheet (inline) ----
function LeadDetailSheet() {
  const { activeLeadId, setActiveLeadId } = useAppStore();
  const lead = activeLeadId ? mockData.getLeadById(activeLeadId) : null;

  if (!lead) return null;

  const activities = mockData.getActivitiesForLead(lead.id);

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
                <Button size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  Reveal Contact Info
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
