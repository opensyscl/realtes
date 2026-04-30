"use client";

import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TrialBanner } from "@/components/billing/trial-banner";
import { UsageBanner } from "@/components/billing/usage-banner";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const expanded = useUiStore((s) => s.sidebarExpanded);
  const toggle = useUiStore((s) => s.toggleSidebar);

  // Atajo Ctrl/Cmd + B para toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
          expanded ? "pl-60" : "pl-16",
        )}
      >
        <TrialBanner />
        <UsageBanner />
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
