import { useState, useEffect, useCallback } from 'react';

// Hook per una singola traduzione
export function useTranslation(
  keyName: string, 
  languageCode: string, 
  section?: string,
  fallbackLanguage: string = 'it'
) {
  const [translation, setTranslation] = useState<string>(keyName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usa API per ottenere singola traduzione
        const response = await fetch(`/api/admin/translations?language=${languageCode}&section=${section || 'common'}`);
        const data = await response.json();
        
        if (data.success && data.translations[keyName]) {
          setTranslation(data.translations[keyName]);
        } else {
          // Fallback su lingua di fallback
          const fallbackResponse = await fetch(`/api/admin/translations?language=${fallbackLanguage}&section=${section || 'common'}`);
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.success && fallbackData.translations[keyName]) {
            setTranslation(fallbackData.translations[keyName]);
          } else {
            setTranslation(keyName);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTranslation(keyName); // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [keyName, languageCode, section, fallbackLanguage]);

  return { translation, loading, error };
}

// Hook per tutte le traduzioni di una sezione
export function useSectionTranslations(
  section: string,
  languageCode: string,
  fallbackLanguage: string = 'it'
) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usa API per ottenere traduzioni di sezione
        const response = await fetch(`/api/admin/translations?language=${languageCode}&section=${section}`);
        const data = await response.json();
        
        if (data.success) {
          setTranslations(data.translations);
        } else {
          setTranslations({});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [section, languageCode, fallbackLanguage]);

  // Funzione helper per ottenere una traduzione specifica
  const t = useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations]);

  return { translations, t, loading, error };
}

// Hook per tutte le traduzioni (per admin)
export function useAllTranslations(
  languageCode: string,
  fallbackLanguage: string = 'it'
) {
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usa API per ottenere tutte le traduzioni
      const response = await fetch(`/api/admin/translations?language=${languageCode}`);
      const data = await response.json();
      
      if (data.success) {
        setTranslations(data.translations);
      } else {
        setTranslations({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTranslations({});
    } finally {
      setLoading(false);
    }
  }, [languageCode]);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  // Funzione helper per ottenere una traduzione specifica
  const t = useCallback((section: string, key: string): string => {
    return translations[section]?.[key] || key;
  }, [translations]);

  return { translations, t, loading, error, reload: loadTranslations };
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
      if (sectionTranslations[key]) {
        return sectionTranslations[key];
      }
    }

    return key;
  }, [translations]);

  return { t, loading };
} 