import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

// Hook per una singola traduzione
export function useTranslation(
  keyName: string, 
  languageCode: string, 
  section?: string,
  fallbackLanguage: string = 'it'
) {
  // 🚨 EMERGENCY: Use React Query with aggressive caching
  const { data: translations, isLoading, error } = useQuery({
    queryKey: ["translation", languageCode, section || 'common'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/translations?language=${languageCode}&section=${section || 'common'}`);
      const data = await response.json();
      return data.success ? data.translations : {};
    },
    staleTime: 3600000, // 🚨 EMERGENCY: 1 hour cache!
    gcTime: 7200000, // 🚨 EMERGENCY: 2 hours garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0, // 🚨 EMERGENCY: No retries!
  });

  // 🚨 EMERGENCY: Fallback query only if main translation not found
  const { data: fallbackTranslations } = useQuery({
    queryKey: ["translation", fallbackLanguage, section || 'common'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/translations?language=${fallbackLanguage}&section=${section || 'common'}`);
      const data = await response.json();
      return data.success ? data.translations : {};
    },
    enabled: !!translations && !translations[keyName], // Only load if main translation missing
    staleTime: 3600000, // 🚨 EMERGENCY: 1 hour cache!
    gcTime: 7200000, // 🚨 EMERGENCY: 2 hours garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0, // 🚨 EMERGENCY: No retries!
  });

  const translation = translations?.[keyName] || fallbackTranslations?.[keyName] || keyName;

  return { 
    translation, 
    loading: isLoading, 
    error: error ? error.message : null 
  };
}

// Hook per tutte le traduzioni di una sezione
export function useSectionTranslations(
  section: string,
  languageCode: string,
  fallbackLanguage: string = 'it'
) {
  // 🚨 EMERGENCY: Use React Query with aggressive caching
  const { data: translations, isLoading, error } = useQuery({
    queryKey: ["section-translations", languageCode, section],
    queryFn: async () => {
      const response = await fetch(`/api/admin/translations?language=${languageCode}&section=${section}`);
      const data = await response.json();
      return data.success ? data.translations : {};
    },
    staleTime: 3600000, // 🚨 EMERGENCY: 1 hour cache!
    gcTime: 7200000, // 🚨 EMERGENCY: 2 hours garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0, // 🚨 EMERGENCY: No retries!
  });

  // Funzione helper per ottenere una traduzione specifica
  const t = useCallback((key: string): string => {
    return translations?.[key] || key;
  }, [translations]);

  return { 
    translations: translations || {}, 
    t, 
    loading: isLoading, 
    error: error ? error.message : null 
  };
}

// Hook per tutte le traduzioni (per admin)
export function useAllTranslations(
  languageCode: string,
  fallbackLanguage: string = 'it'
) {
  // 🚨 EMERGENCY: Use React Query with aggressive caching
  const { data: translations, isLoading, error, refetch } = useQuery({
    queryKey: ["all-translations", languageCode],
    queryFn: async () => {
      const response = await fetch(`/api/admin/translations?language=${languageCode}`);
      const data = await response.json();
      return data.success ? data.translations : {};
    },
    staleTime: 3600000, // 🚨 EMERGENCY: 1 hour cache!
    gcTime: 7200000, // 🚨 EMERGENCY: 2 hours garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0, // 🚨 EMERGENCY: No retries!
  });

  // Funzione helper per ottenere una traduzione specifica
  const t = useCallback((section: string, key: string): string => {
    return translations?.[section]?.[key] || key;
  }, [translations]);

  return { 
    translations: translations || {}, 
    t, 
    loading: isLoading, 
    error: error ? error.message : null, 
    reload: refetch 
  };
}

// Hook semplificato per uso comune
export function useT(languageCode: string) {
  const { translations, loading } = useAllTranslations(languageCode);

  const t = useCallback((key: string, section?: string): string => {
    if (section) {
      return translations[section]?.[key] || key;
    }

    // Cerca in tutte le sezioni
    for (const sectionTranslations of Object.values(translations)) {
      if (sectionTranslations && typeof sectionTranslations === 'object' && (sectionTranslations as any)[key]) {
        return (sectionTranslations as any)[key];
      }
    }

    return key;
  }, [translations]);

  return { t, loading };
} 