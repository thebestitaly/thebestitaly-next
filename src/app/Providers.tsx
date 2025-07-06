// src/app/providers.tsx

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 🔧 MEMORY OPTIMIZED: Conservative cache settings to stay under 400MB
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🎯 SHORT-TERM cache: 3 minutes for most queries
      staleTime: 1000 * 60 * 3, // 3 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes in memory
      
      // 🚫 REDUCED refetch frequency to save memory
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Only refetch if stale
      refetchOnReconnect: false,
      
      // 🔄 CONSERVATIVE retry
      retry: 1, // Only 1 retry instead of 3
      retryDelay: 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}