"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarExpanded: boolean;
  setSidebarExpanded: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarExpanded: false,
      setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
      toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
    }),
    {
      name: "rsv-ui",
      partialize: (state) => ({ sidebarExpanded: state.sidebarExpanded }),
    },
  ),
);
