import { getFlagImageUrl } from '@/lib/imageUtils';

/**
 * Hook semplificato per gestire le bandiere
 * Ora che la funzione è sincrona, non serve più stato complesso
 */
export function useFlags() {
  /**
   * Ottieni l'URL della bandiera per un codice lingua
   */
  const getFlagUrl = (languageCode: string): string => {
    return getFlagImageUrl(languageCode);
  };

  return {
    isLoaded: true, // Sempre caricato perché è sincrono
    error: null,
    getFlagUrl
  };
} 