"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAppCurrency } from "@/lib/utils";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  agency?: {
    id: number;
    name: string;
    slug: string;
    plan: string;
    currency?: string;
    locale?: string;
  };
}

function applyCurrencyFromUser(user: AuthUser | null) {
  if (user?.agency) {
    setAppCurrency(user.agency.currency, user.agency.locale);
  }
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: () => boolean;
  setSession: (data: { token: string; user: AuthUser }) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,
      setSession: ({ token, user }) => {
        applyCurrencyFromUser(user);
        set({ token, user });
      },
      setUser: (user) => {
        applyCurrencyFromUser(user);
        set({ user });
      },
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "rsv-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Al rehidratar desde localStorage al recargar la página
        applyCurrencyFromUser(state?.user ?? null);
      },
    },
  ),
);
