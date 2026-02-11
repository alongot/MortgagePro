/**
 * Typed API Client for MortgagePro
 *
 * Provides a type-safe wrapper around fetch for all API endpoints.
 */

import type {
  Lead,
  List,
  PipelineStage,
  Task,
  SearchResult,
  PaginatedResponse,
  DashboardStats,
  ChartDataPoint,
} from "@/types";

// Base URL for API calls
const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// Properties API
// ============================================================

export interface SearchParams {
  query?: string;
  city?: string;
  zip?: string;
  property_type?: string;
  loan_type?: string;
  min_value?: number;
  max_value?: number;
  min_equity?: number;
  max_equity?: number;
  min_rate?: number;
  max_rate?: number;
  is_absentee?: boolean;
  is_arm?: boolean;
  absentee_only?: boolean; // alias for is_absentee
  arm_only?: boolean; // alias for is_arm
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export async function searchProperties(
  params: SearchParams = {}
): Promise<PaginatedResponse<SearchResult>> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return fetchAPI(`/properties?${searchParams.toString()}`);
}

// ============================================================
// Leads API
// ============================================================

export interface LeadsParams {
  status?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export async function getLeads(
  params: LeadsParams = {}
): Promise<PaginatedResponse<Lead>> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return fetchAPI(`/leads?${searchParams.toString()}`);
}

export async function getLead(id: string): Promise<Lead> {
  return fetchAPI(`/leads/${id}`);
}

export interface CreateLeadData {
  property_id: string;
  owner_id: string;
  status?: string;
  score?: number;
  tags?: string[];
  notes?: string;
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
  return fetchAPI("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateLeadData {
  status?: string;
  score?: number;
  tags?: string[];
  notes?: string;
  contact_revealed?: boolean;
}

export async function updateLead(
  id: string,
  data: UpdateLeadData
): Promise<Lead> {
  return fetchAPI(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string): Promise<void> {
  return fetchAPI(`/leads/${id}`, {
    method: "DELETE",
  });
}

// ============================================================
// Lists API
// ============================================================

export async function getLists(): Promise<List[]> {
  return fetchAPI("/lists");
}

export async function getList(
  id: string
): Promise<List & { leads: Lead[] }> {
  return fetchAPI(`/lists/${id}`);
}

export interface CreateListData {
  name: string;
  description?: string;
  color?: string;
}

export async function createList(data: CreateListData): Promise<List> {
  return fetchAPI("/lists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateListData {
  name?: string;
  description?: string;
  color?: string;
}

export async function updateList(
  id: string,
  data: UpdateListData
): Promise<List> {
  return fetchAPI(`/lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteList(id: string): Promise<void> {
  return fetchAPI(`/lists/${id}`, {
    method: "DELETE",
  });
}

export async function addLeadsToList(
  listId: string,
  leadIds: string[]
): Promise<{ added: number }> {
  return fetchAPI(`/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ lead_ids: leadIds }),
  });
}

export async function removeLeadsFromList(
  listId: string,
  leadIds: string[]
): Promise<void> {
  return fetchAPI(`/lists/${listId}/items`, {
    method: "DELETE",
    body: JSON.stringify({ lead_ids: leadIds }),
  });
}

// ============================================================
// Pipeline API
// ============================================================

export interface PipelineStageWithCards extends PipelineStage {
  cards: Array<{
    id: string;
    stage_id: string;
    lead_id: string;
    position: number;
    lead: Lead;
  }>;
}

export async function getPipelineStages(): Promise<PipelineStageWithCards[]> {
  return fetchAPI("/pipeline/stages");
}

export interface CreateStageData {
  name: string;
  color?: string;
  position?: number;
}

export async function createPipelineStage(
  data: CreateStageData
): Promise<PipelineStage> {
  return fetchAPI("/pipeline/stages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CreateCardData {
  stage_id: string;
  lead_id: string;
  position?: number;
}

export async function createPipelineCard(data: CreateCardData): Promise<{
  id: string;
  stage_id: string;
  lead_id: string;
  position: number;
  lead: Lead;
}> {
  return fetchAPI("/pipeline/cards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface MoveCardData {
  card_id: string;
  stage_id?: string;
  position?: number;
}

export async function movePipelineCard(data: MoveCardData): Promise<{
  id: string;
  stage_id: string;
  lead_id: string;
  position: number;
  lead: Lead;
}> {
  return fetchAPI("/pipeline/cards", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePipelineCard(cardId: string): Promise<void> {
  return fetchAPI(`/pipeline/cards?card_id=${cardId}`, {
    method: "DELETE",
  });
}

// ============================================================
// Tasks API
// ============================================================

export interface TasksParams {
  status?: string;
  priority?: string;
  lead_id?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export async function getTasks(params: TasksParams = {}): Promise<Task[]> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return fetchAPI(`/tasks?${searchParams.toString()}`);
}

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  lead_id?: string;
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  return fetchAPI("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "pending" | "in_progress" | "completed";
}

export async function updateTask(data: UpdateTaskData): Promise<Task> {
  return fetchAPI("/tasks", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: string): Promise<void> {
  return fetchAPI(`/tasks?id=${id}`, {
    method: "DELETE",
  });
}

// ============================================================
// Rates API
// ============================================================

export interface CurrentRates {
  "30_fixed": { rate: number; date: string };
  "15_fixed": { rate: number; date: string };
  "5_1_arm": { rate: number; date: string };
  source: string;
}

export async function getCurrentRates(): Promise<CurrentRates> {
  return fetchAPI("/rates/current");
}

export interface RateHistoryParams {
  rate_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface RateHistory {
  rate_type: string;
  history: Array<{ date: string; rate: number }>;
  count: number;
}

export async function getRateHistory(
  params: RateHistoryParams = {}
): Promise<RateHistory> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return fetchAPI(`/rates/history?${searchParams.toString()}`);
}

export interface RateEstimateRequest {
  loan_amount: number;
  property_value: number;
  loan_type?: "conventional" | "fha" | "va" | "jumbo" | "usda";
  property_type?: "single_family" | "condo" | "townhouse" | "multi_family";
  occupancy?: "primary" | "secondary" | "investment";
  credit_score?: number;
  loan_term?: number;
  is_arm?: boolean;
  current_rate?: number;
}

export interface RateEstimateResponse {
  baseRate: number;
  adjustedRate: number;
  adjustments: Array<{
    factor: string;
    adjustment: number;
    reason: string;
  }>;
  monthlyPayment: number;
  totalInterest: number;
  apr: number;
  currentRate?: number;
  monthlySavings?: number;
  lifetimeSavings?: number;
}

export async function estimateRate(
  data: RateEstimateRequest
): Promise<RateEstimateResponse> {
  return fetchAPI("/rates/estimate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================
// Dashboard API
// ============================================================

export interface DashboardData {
  stats: DashboardStats;
  charts: {
    pipeline: ChartDataPoint[];
    monthly_leads: ChartDataPoint[];
    lead_sources: ChartDataPoint[];
  };
}

export async function getDashboardStats(): Promise<DashboardData> {
  return fetchAPI("/dashboard/stats");
}

// ============================================================
// Free Leads API
// ============================================================

export interface FreeLeadsStatus {
  free_leads_remaining: number;
  claimed: boolean;
  claimed_at: string | null;
  city: string | null;
  state: string | null;
}

export async function getFreeLeadsStatus(): Promise<FreeLeadsStatus> {
  return fetchAPI("/leads/free");
}

export interface ClaimFreeLeadsRequest {
  city: string;
  state: string;
}

export interface ClaimFreeLeadsResponse {
  success: boolean;
  leads_created: number;
  leads: Lead[];
  message: string;
}

export async function claimFreeLeads(
  data: ClaimFreeLeadsRequest
): Promise<ClaimFreeLeadsResponse> {
  return fetchAPI("/leads/free", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
