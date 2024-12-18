// i18n.config.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = createInstance();

i18n
  .use(initReactI18next)
  .init({
    lng: 'it', // lingua di default
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      // Qui puoi aggiungere le tue traduzioni statiche se necessario
      it: {
        translation: {}
      },
      en: {
        translation: {}
      }
    }
  });

export default i18n;