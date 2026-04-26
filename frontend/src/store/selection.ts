"use client";

import { create } from "zustand";

interface SelectionState {
  ids: Set<number>;
  toggle: (id: number) => void;
  add: (id: number) => void;
  remove: (id: number) => void;
  setMany: (ids: number[]) => void;
  clear: () => void;
  has: (id: number) => boolean;
  size: () => number;
  toArray: () => number[];
}

export const usePropertySelection = create<SelectionState>((set, get) => ({
  ids: new Set<number>(),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ids: next };
    }),
  add: (id) =>
    set((s) => {
      const next = new Set(s.ids);
      next.add(id);
      return { ids: next };
    }),
  remove: (id) =>
    set((s) => {
      const next = new Set(s.ids);
      next.delete(id);
      return { ids: next };
    }),
  setMany: (ids) =>
    set((s) => {
      const next = new Set(s.ids);
      ids.forEach((id) => next.add(id));
      return { ids: next };
    }),
  clear: () => set({ ids: new Set<number>() }),
  has: (id) => get().ids.has(id),
  size: () => get().ids.size,
  toArray: () => Array.from(get().ids),
}));
