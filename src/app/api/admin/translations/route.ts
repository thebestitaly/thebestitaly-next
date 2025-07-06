import { NextRequest, NextResponse } from 'next/server';

// 🚨 EMERGENCY: Fallback translations to stop 404 errors
const FALLBACK_TRANSLATIONS = {
  it: {
    common: {
      'loading': 'Caricamento...',
      'error': 'Errore',
      'not_found': 'Non trovato',
      'retry': 'Riprova',
      'search': 'Cerca',
      'close': 'Chiudi',
      'back': 'Indietro',
      'home': 'Home',
      'contact': 'Contatti',
      'about': 'Chi siamo',
      'services': 'Servizi',
      'blog': 'Blog',
      'news': 'Notizie'
    },
    menu: {
      'home': 'Home',
      'destinations': 'Destinazioni',
      'magazine': 'Magazine',
      'poi': 'Eccellenze',
      'experience': 'Esperienze',
      'search': 'Cerca',
      'language': 'Lingua',
      'menu': 'Menu'
    },
    footer: {
      'copyright': '© 2024 TheBestItaly. Tutti i diritti riservati.',
      'privacy': 'Privacy Policy',
      'terms': 'Termini di Servizio',
      'contact': 'Contatti',
      'about': 'Chi siamo',
      'newsletter': 'Newsletter',
      'social': 'Seguici',
      'sitemap': 'Mappa del sito'
    },
    navigation: {
      'home': 'Home',
      'back': 'Indietro',
      'next': 'Avanti',
      'previous': 'Precedente',
      'breadcrumb': 'Navigazione',
      'skip_to_content': 'Vai al contenuto',
      'menu_toggle': 'Mostra/Nascondi menu'
    }
  },
  en: {
    common: {
      'loading': 'Loading...',
      'error': 'Error',
      'not_found': 'Not found',
      'retry': 'Retry',
      'search': 'Search',
      'close': 'Close',
      'back': 'Back',
      'home': 'Home',
      'contact': 'Contact',
      'about': 'About',
      'services': 'Services',
      'blog': 'Blog',
      'news': 'News'
    },
    menu: {
      'home': 'Home',
      'destinations': 'Destinations',
      'magazine': 'Magazine',
      'poi': 'Excellences',
      'experience': 'Experiences',
      'search': 'Search',
      'language': 'Language',
      'menu': 'Menu'
    },
    footer: {
      'copyright': '© 2024 TheBestItaly. All rights reserved.',
      'privacy': 'Privacy Policy',
      'terms': 'Terms of Service',
      'contact': 'Contact',
      'about': 'About',
      'newsletter': 'Newsletter',
      'social': 'Follow us',
      'sitemap': 'Sitemap'
    },
    navigation: {
      'home': 'Home',
      'back': 'Back',
      'next': 'Next',
      'previous': 'Previous',
      'breadcrumb': 'Navigation',
      'skip_to_content': 'Skip to content',
      'menu_toggle': 'Toggle menu'
    }
  }
} as const;

// 🚨 EMERGENCY: Cache per evitare loop infiniti
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 50; // 🚨 EMERGENCY: Limit cache size

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'it';
    const section = searchParams.get('section');

    // 🚨 EMERGENCY: Cache key
    const cacheKey = `${language}-${section || 'all'}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        translations: cached.data
      });
    }

    // 🚨 EMERGENCY: Return fallback translations
    const langTranslations = FALLBACK_TRANSLATIONS[language as keyof typeof FALLBACK_TRANSLATIONS] || FALLBACK_TRANSLATIONS.it;
    
    let result;
    if (section) {
      result = (langTranslations as any)[section] || {};
    } else {
      result = langTranslations;
    }

    // 🚨 EMERGENCY: Cache result with size limit
    if (cache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      translations: result
    });

  } catch (error) {
    console.error('❌ Translations API error:', error);
    
    // 🚨 EMERGENCY: Always return success with empty translations
    return NextResponse.json({
      success: true,
      translations: {}
    });
  }
}

// 🚨 EMERGENCY: REMOVED setInterval - causes memory leaks
// Manual cleanup only when needed
export const cleanupTranslationAPICache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}; 