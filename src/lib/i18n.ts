import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Definisci le lingue RTL
const RTL_LANGUAGES = ['ar', 'fa', 'ur', 'he'];

// Supported languages list
const SUPPORTED_LANGUAGES = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw','tk','hu','it'
];

// Inizializza i18n
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'it',
    supportedLngs: [
      'it', 'en', 'fr', 'es', 'pt', 'de', 'tk', 'hu', 'ro', 'nl', 'sv',
      'pl', 'vi', 'id', 'el', 'uk', 'ru', 'bn', 'zh', 'hi', 'ar', 'fa',
      'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk',
      'sl', 'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk',
      'az', 'ka', 'hy', 'is', 'sw', 'zh-tw'
    ],
    resources: {}, // Inizializza con un oggetto vuoto dato che le traduzioni vengono caricate dinamicamente
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // Disabilita Suspense per evitare problemi con il caricamento dinamico
    }
  });

// Funzione di utilità per aggiungere traduzioni dinamicamente
export const addTranslations = (lang: string, namespace: string, translations: object) => {
  if (!i18n.hasResourceBundle(lang, namespace)) {
    i18n.addResourceBundle(lang, namespace, translations);
  }
};

/**
 * Extract language from URL pathname
 * @param pathname - The URL pathname
 * @returns The language code or 'it' as default
 */
export function extractLanguageFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Check if first segment is a supported language
  if (firstSegment && SUPPORTED_LANGUAGES.includes(firstSegment)) {
    return firstSegment;
  }
  
  // Default to Italian
  return 'it';
}

/**
 * Check if a language is RTL
 * @param lang - Language code
 * @returns true if the language is RTL
 */
export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

// Le funzioni sono già importate sopra

// Funzione per caricare traduzioni da database (compatibilità con sistema esistente)
export const getTranslations = async (lang: string, section: string) => {
  try {
    // Usa le API per ottenere le traduzioni
    const response = await fetch(`/api/admin/translations?language=${lang}&section=${section}`);
    const data = await response.json();
    
    if (data.success) {
      return data.translations;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching translations:', error);
    return {};
  }
};

// Funzione helper per singole traduzioni
export const getTranslation = async (key: string, lang: string, section?: string) => {
  try {
    const translations = await getTranslations(lang, section || 'common');
    return translations[key] || key;
  } catch (error) {
    console.error('Error fetching translation:', error);
    return key;
  }
};

export { RTL_LANGUAGES, SUPPORTED_LANGUAGES };
export default i18n;