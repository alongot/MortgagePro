/**
 * React Hooks for API Data Fetching
 *
 * Simple hooks with SWR-like behavior using React's built-in hooks.
 * Always uses real API - mock data removed.
 *
 * Note: For production, consider using React Query or SWR for better
 * caching, deduplication, and error handling.
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api/client";
import type {
  Lead,
  List,
  Task,
  SearchResult,
  PaginatedResponse,
} from "@/types";

// ============================================================
// Generic Fetching Hook
// ============================================================

interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  // Serialize deps for comparison
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    doFetch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, fetchCount]);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  return { data, isLoading, error, refetch };
}

// ============================================================
// Properties / Search Hook
// ============================================================

export function useSearchProperties(params: api.SearchParams = {}) {
  return useQuery<PaginatedResponse<SearchResult>>(
    async () => api.searchProperties(params),
    [JSON.stringify(params)]
  );
}

// ============================================================
// Leads Hooks
// ============================================================

export function useLeads(params: api.LeadsParams = {}) {
  return useQuery<PaginatedResponse<Lead>>(
    async () => api.getLeads(params),
    [JSON.stringify(params)]
  );
}

export function useLead(id: string | null) {
  return useQuery<Lead | null>(
    async () => {
      if (!id) return null;
      return api.getLead(id);
    },
    [id]
  );
}

// ============================================================
// Lists Hooks
// ============================================================

export function useLists() {
  return useQuery<List[]>(
    async () => api.getLists(),
    []
  );
}

export function useList(id: string | null) {
  return useQuery<(List & { leads: Lead[] }) | null>(
    async () => {
      if (!id) return null;
      return api.getList(id);
    },
    [id]
  );
}

// ============================================================
// Pipeline Hooks
// ============================================================

export function usePipelineStages() {
  return useQuery<api.PipelineStageWithCards[]>(
    async () => api.getPipelineStages(),
    []
  );
}

// ============================================================
// Tasks Hooks
// ============================================================

export function useTasks(params: api.TasksParams = {}) {
  return useQuery<Task[]>(
    async () => api.getTasks(params),
    [JSON.stringify(params)]
  );
}

// ============================================================
// Rates Hooks
// ============================================================

export function useCurrentRates() {
  return useQuery<api.CurrentRates>(
    async () => api.getCurrentRates(),
    []
  );
}

export function useRateHistory(params: api.RateHistoryParams = {}) {
  return useQuery<api.RateHistory>(
    async () => api.getRateHistory(params),
    [JSON.stringify(params)]
  );
}

// ============================================================
// Dashboard Hook
// ============================================================

export function useDashboardStats() {
  return useQuery<api.DashboardData>(
    async () => api.getDashboardStats(),
    []
  );
}

// ============================================================
// Mutation Helpers
// ============================================================

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, isLoading, error, data };
}

// Pre-configured mutation hooks
export function useCreateLead() {
  return useMutation(api.createLead);
}

export function useUpdateLead() {
  return useMutation(
    ({ id, ...data }: { id: string } & api.UpdateLeadData) =>
      api.updateLead(id, data)
  );
}

export function useDeleteLead() {
  return useMutation(api.deleteLead);
}

export function useCreateList() {
  return useMutation(api.createList);
}

export function useUpdateList() {
  return useMutation(
    ({ id, ...data }: { id: string } & api.UpdateListData) =>
      api.updateList(id, data)
  );
}

export function useDeleteList() {
  return useMutation(api.deleteList);
}

export function useAddLeadsToList() {
  return useMutation(
    ({ listId, leadIds }: { listId: string; leadIds: string[] }) =>
      api.addLeadsToList(listId, leadIds)
  );
}

export function useCreateTask() {
  return useMutation(api.createTask);
}

export function useUpdateTask() {
  return useMutation(api.updateTask);
}

export function useDeleteTask() {
  return useMutation(api.deleteTask);
}

export function useMovePipelineCard() {
  return useMutation(api.movePipelineCard);
}

export function useEstimateRate() {
  return useMutation(api.estimateRate);
}
