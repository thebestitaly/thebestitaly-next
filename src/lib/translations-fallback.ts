// Traduzioni di fallback essenziali quando il database non è disponibile
export const FALLBACK_TRANSLATIONS = {
  // Menu principale
  menu: {
    destinations: {
      it: 'Destinazioni',
      en: 'Destinations',
      fr: 'Destinations',
      es: 'Destinos',
      de: 'Reiseziele',
      pt: 'Destinos'
    },
    magazine: {
      it: 'Magazine',
      en: 'Magazine',
      fr: 'Magazine',
      es: 'Revista',
      de: 'Magazin',
      pt: 'Revista'
    },
    search: {
      it: 'Cerca',
      en: 'Search',
      fr: 'Rechercher',
      es: 'Buscar',
      de: 'Suchen',
      pt: 'Pesquisar'
    },
    experience: {
      it: 'Prenota la tua esperienza',
      en: 'Book your experience',
      fr: 'Réservez votre expérience',
      es: 'Reserva tu experiencia',
      de: 'Buchen Sie Ihr Erlebnis',
      pt: 'Reserve sua experiência'
    },
    borghi: {
      it: 'Borghi',
      en: 'Villages',
      fr: 'Villages',
      es: 'Pueblos',
      de: 'Dörfer',
      pt: 'Aldeias'
    },
    sea: {
      it: 'Mare',
      en: 'Sea',
      fr: 'Mer',
      es: 'Mar',
      de: 'Meer',
      pt: 'Mar'
    }
  },
  
  // Homepage
  homepage: {
    seo_title: {
      it: 'The Best Italy - Scopri l\'Italia Autentica',
      en: 'The Best Italy - Discover Authentic Italy',
      fr: 'The Best Italy - Découvrez l\'Italie Authentique',
      es: 'The Best Italy - Descubre la Italia Auténtica',
      de: 'The Best Italy - Entdecken Sie das authentische Italien',
      pt: 'The Best Italy - Descubra a Itália Autêntica'
    },
    seo_summary: {
      it: 'Esplora l\'Italia come un locale con The Best Italy. Destinazioni autentiche, esperienze uniche e consigli esclusivi.',
      en: 'Explore Italy like a local with The Best Italy. Authentic destinations, unique experiences and exclusive tips.',
      fr: 'Explorez l\'Italie comme un local avec The Best Italy. Destinations authentiques, expériences uniques et conseils exclusifs.',
      es: 'Explora Italia como un local con The Best Italy. Destinos auténticos, experiencias únicas y consejos exclusivos.',
      de: 'Erkunden Sie Italien wie ein Einheimischer mit The Best Italy. Authentische Reiseziele, einzigartige Erfahrungen und exklusive Tipps.',
      pt: 'Explore a Itália como um local com The Best Italy. Destinos autênticos, experiências únicas e dicas exclusivas.'
    }
  },

  // Info generali
  infothebest: {
    title: {
      it: 'The Best Italy',
      en: 'The Best Italy',
      fr: 'The Best Italy',
      es: 'The Best Italy',
      de: 'The Best Italy',
      pt: 'The Best Italy'
    },
    subtitle: {
      it: 'Scopri l\'Italia Autentica',
      en: 'Discover Authentic Italy',
      fr: 'Découvrez l\'Italie Authentique',
      es: 'Descubre la Italia Auténtica',
      de: 'Entdecken Sie das authentische Italien',
      pt: 'Descubra a Itália Autêntica'
    },
    description: {
      it: 'La tua guida per esplorare l\'Italia come un vero italiano. Destinazioni nascoste, tradizioni locali e esperienze autentiche.',
      en: 'Your guide to exploring Italy like a true Italian. Hidden destinations, local traditions and authentic experiences.',
      fr: 'Votre guide pour explorer l\'Italie comme un vrai Italien. Destinations cachées, traditions locales et expériences authentiques.',
      es: 'Tu guía para explorar Italia como un verdadero italiano. Destinos ocultos, tradiciones locales y experiencias auténticas.',
      de: 'Ihr Reiseführer, um Italien wie ein echter Italiener zu erkunden. Versteckte Reiseziele, lokale Traditionen und authentische Erfahrungen.',
      pt: 'Seu guia para explorar a Itália como um verdadeiro italiano. Destinos escondidos, tradições locais e experiências autênticas.'
    }
  },

  // Footer
  footer: {
    about: {
      it: 'Chi Siamo',
      en: 'About Us',
      fr: 'À Propos',
      es: 'Acerca de',
      de: 'Über Uns',
      pt: 'Sobre Nós'
    },
    contact: {
      it: 'Contatti',
      en: 'Contact',
      fr: 'Contact',
      es: 'Contacto',
      de: 'Kontakt',
      pt: 'Contato'
    },
    privacy: {
      it: 'Privacy',
      en: 'Privacy',
      fr: 'Confidentialité',
      es: 'Privacidad',
      de: 'Datenschutz',
      pt: 'Privacidade'
    }
  },

  // Common
  common: {
    loading: {
      it: 'Caricamento...',
      en: 'Loading...',
      fr: 'Chargement...',
      es: 'Cargando...',
      de: 'Laden...',
      pt: 'Carregando...'
    },
    error: {
      it: 'Errore',
      en: 'Error',
      fr: 'Erreur',
      es: 'Error',
      de: 'Fehler',
      pt: 'Erro'
    }
  }
};

/**
 * Ottieni una traduzione di fallback
 */
export function getFallbackTranslation(
  section: string,
  key: string,
  language: string,
  fallbackLanguage: string = 'it'
): string {
  const sectionTranslations = FALLBACK_TRANSLATIONS[section as keyof typeof FALLBACK_TRANSLATIONS];
  
  if (!sectionTranslations) {
    return key;
  }
  
  const keyTranslations = sectionTranslations[key as keyof typeof sectionTranslations];
  
  if (!keyTranslations) {
    return key;
  }
  
  return keyTranslations[language as keyof typeof keyTranslations] || 
         keyTranslations[fallbackLanguage as keyof typeof keyTranslations] || 
         key;
}

/**
 * Ottieni tutte le traduzioni di fallback per una sezione
 */
export function getFallbackTranslationsForSection(
  section: string,
  language: string,
  fallbackLanguage: string = 'it'
): Record<string, string> {
  const sectionTranslations = FALLBACK_TRANSLATIONS[section as keyof typeof FALLBACK_TRANSLATIONS];
  
  if (!sectionTranslations) {
    return {};
  }
  
  const result: Record<string, string> = {};
  
  for (const [key, translations] of Object.entries(sectionTranslations)) {
    result[key] = translations[language as keyof typeof translations] || 
                  translations[fallbackLanguage as keyof typeof translations] || 
                  key;
  }
  
  return result;
} 