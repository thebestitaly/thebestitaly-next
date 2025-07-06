// src/app/providers.tsx

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 🚨 EMERGENCY: Configure QueryClient to prevent memory accumulation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🚨 Reduced cache times to prevent memory build-up
      staleTime: 180000, // 3 minutes default
      gcTime: 360000, // 6 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}