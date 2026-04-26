"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sileo";
import "sileo/styles.css";
import { CommandPaletteProvider } from "@/components/layout/command-palette-provider";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={250} skipDelayDuration={50}>
        <ConfirmProvider>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </ConfirmProvider>
        <Toaster
          position="top-right"
          theme="dark"
          options={{
            fill: "#1C1F24",
            roundness: 16,
            styles: {
              title: "!text-[#26de81] !font-semibold",
              description: "!text-white/70",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
