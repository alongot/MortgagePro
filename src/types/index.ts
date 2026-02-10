// ============================================================
// Mortgage Pro — Shared TypeScript Types
// ============================================================

// ---- Database row types ----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  property_type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  estimated_value: number | null;
  last_sale_price: number | null;
  last_sale_date: string | null;
  created_at: string;
}

export type PropertyType =
  | "single_family"
  | "multi_family"
  | "condo"
  | "townhouse"
  | "commercial"
  | "land";

export interface Owner {
  id: string;
  property_id: string;
  first_name: string;
  last_name: string;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  phone: string | null;
  email: string | null;
  is_absentee: boolean;
  ownership_length_years: number | null;
  created_at: string;
}

export interface MortgageRecord {
  id: string;
  property_id: string;
  lender_name: string | null;
  loan_amount: number | null;
  interest_rate: number | null;
  loan_type: LoanType;
  origination_date: string | null;
  maturity_date: string | null;
  is_arm: boolean;
  arm_reset_date: string | null;
  ltv_ratio: number | null;
  estimated_equity: number | null;
  monthly_payment: number | null;
  created_at: string;
}

export type LoanType = "conventional" | "fha" | "va" | "jumbo" | "usda" | "other";

export interface Lead {
  id: string;
  property_id: string;
  owner_id: string;
  user_id: string;
  status: LeadStatus;
  score: number;
  tags: string[];
  notes: string | null;
  contact_revealed: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  property?: Property;
  owner?: Owner;
  mortgage?: MortgageRecord;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface List {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  lead_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  lead_id: string;
  added_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
}

export interface PipelineCard {
  id: string;
  stage_id: string;
  lead_id: string;
  position: number;
  created_at: string;
  lead?: Lead;
}

export interface Task {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface Activity {
  id: string;
  user_id: string;
  lead_id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type ActivityType =
  | "call"
  | "email"
  | "sms"
  | "note"
  | "meeting"
  | "status_change"
  | "contact_reveal"
  | "list_add"
  | "task_created";

// ---- Search / Filter types ----

export interface SearchFilters {
  query: string;
  state: string;
  city: string;
  zip: string;
  property_type: PropertyType | "";
  min_value: number | "";
  max_value: number | "";
  min_equity: number | "";
  max_equity: number | "";
  loan_type: LoanType | "";
  is_absentee: boolean | "";
  min_rate: number | "";
  max_rate: number | "";
  is_arm: boolean | "";
  sort_by: string;
  sort_dir: "asc" | "desc";
  page: number;
  per_page: number;
}

export interface SearchResult {
  property: Property;
  owner: Owner;
  mortgage: MortgageRecord | null;
  lead?: Lead;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ---- Dashboard stats ----

export interface DashboardStats {
  total_leads: number;
  new_leads_this_week: number;
  contacted_this_week: number;
  deals_won_this_month: number;
  total_pipeline_value: number;
  conversion_rate: number;
  avg_response_time_hours: number;
  tasks_due_today: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
