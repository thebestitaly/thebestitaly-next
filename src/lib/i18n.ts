import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Definisci le lingue RTL
const RTL_LANGUAGES = ['ar', 'fa', 'ur', 'he'];

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

export { RTL_LANGUAGES };
export default i18n;