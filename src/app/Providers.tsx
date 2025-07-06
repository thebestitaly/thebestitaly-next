// src/app/providers.tsx

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 🚨 EMERGENCY: Completely disable cache to identify memory leak
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🚨 EMERGENCY: Disable all caching temporarily
      staleTime: 0, // Always stale - no cache
      gcTime: 0, // Immediate garbage collection
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