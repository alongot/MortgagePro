"use client";

import { create } from "zustand";
import type { SearchFilters } from "@/types";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/utils";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Search
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  selectedLeadIds: string[];
  setSelectedLeadIds: (ids: string[]) => void;
  toggleLeadSelection: (id: string) => void;
  clearSelection: () => void;

  // Lead detail
  activeLeadId: string | null;
  setActiveLeadId: (id: string | null) => void;

  // Lists
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;

  // Dialog states
  createListDialogOpen: boolean;
  setCreateListDialogOpen: (open: boolean) => void;
  addToListDialogOpen: boolean;
  setAddToListDialogOpen: (open: boolean) => void;
  logActivityDialogOpen: boolean;
  setLogActivityDialogOpen: (open: boolean) => void;
  createTaskDialogOpen: boolean;
  setCreateTaskDialogOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  searchFilters: { ...DEFAULT_SEARCH_FILTERS },
  setSearchFilters: (filters) =>
    set((s) => ({ searchFilters: { ...s.searchFilters, ...filters } })),
  resetSearchFilters: () =>
    set({ searchFilters: { ...DEFAULT_SEARCH_FILTERS } }),
  selectedLeadIds: [],
  setSelectedLeadIds: (ids) => set({ selectedLeadIds: ids }),
  toggleLeadSelection: (id) =>
    set((s) => ({
      selectedLeadIds: s.selectedLeadIds.includes(id)
        ? s.selectedLeadIds.filter((i) => i !== id)
        : [...s.selectedLeadIds, id],
    })),
  clearSelection: () => set({ selectedLeadIds: [] }),

  activeLeadId: null,
  setActiveLeadId: (id) => set({ activeLeadId: id }),

  activeListId: null,
  setActiveListId: (id) => set({ activeListId: id }),

  createListDialogOpen: false,
  setCreateListDialogOpen: (open) => set({ createListDialogOpen: open }),
  addToListDialogOpen: false,
  setAddToListDialogOpen: (open) => set({ addToListDialogOpen: open }),
  logActivityDialogOpen: false,
  setLogActivityDialogOpen: (open) => set({ logActivityDialogOpen: open }),
  createTaskDialogOpen: false,
  setCreateTaskDialogOpen: (open) => set({ createTaskDialogOpen: open }),
}));
