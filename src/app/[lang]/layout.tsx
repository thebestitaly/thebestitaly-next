"use client";
import "../globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, use } from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n.config'; // Assicurati che il path sia corretto
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const resolvedParams = use(params);
  const currentLang = resolvedParams?.lang || 'it';
  const isRTL = ['ar', 'fa', 'he', 'ur'].includes(currentLang);

  return (
    <html 
      lang={currentLang} 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="font-sans"
    >
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <Header lang={currentLang} />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </I18nextProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}