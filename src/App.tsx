import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Importiamo i componenti delle pagine
import HomePage from './app/home/page';
import DestinationsPage from './pages/DestinationsPage';
import ExperiencePage from './app/experience/page';
import MagazineArticlePage from './pages/MagazineArticlePage';
import MagazineCategoryPage from './pages/MagazineCategoryPage';
import MagazineListPage from './pages/MagazineListPage';
import SearchResultsPage from './app/[lang]/search/page';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from './lib/i18n'; // Importa le lingue RTL

// Importiamo i componenti di layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop'; // Importa il nuovo componente

// Configurazione del client di React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      refetchOnWindowFocus: false,
    },
  },
});

const SUPPORTED_LANGUAGES = [
  'it', 'en', 'fr', 'es', 'pt', 'de', 'tk', 'hu', 'ro', 'nl', 'sv',
  'pl', 'vi', 'id', 'el', 'uk', 'ru', 'bn', 'zh', 'hi', 'ar', 'fa',
  'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk',
  'sl', 'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk',
  'az', 'ka', 'hy', 'is', 'sw', 'zh-tw'
];

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isRTL = RTL_LANGUAGES.includes(currentLanguage);

    // Imposta l'attributo dir su html
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Redirect dalla root alla lingua di default */}
            <Route path="/" element={<Navigate to="/it/" replace />} />

            {/* Routes con gestione della lingua */}
            <Route path="/:lang/*" element={<LanguageRoute />} />

            {/* Catch-all route per URL non validi */}
            <Route path="*" element={<Navigate to="/it/" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

// Componente HOC per gestire la validazione della lingua e passare Header e Footer

const LanguageRoute: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();

  if (!SUPPORTED_LANGUAGES.includes(lang ?? '')) {
    return <Navigate to="/it/" replace />;
  }

  return (
    <>
      <Header lang={lang!} />
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage lang={lang!} />} />
            <Route path="magazine/" element={<MagazineListPage lang={lang!} />} />
            <Route path="magazine/:slug/" element={<MagazineArticlePage lang={lang!} />} />
            <Route path="magazine/c/:category/" element={<MagazineCategoryPage lang={lang!} />} />
            <Route path="experience/" element={<ExperiencePage lang={lang!} />} />
            <Route path="/search" element={<SearchResultsPage lang={lang!} />} />
            <Route path=":slug/" element={<DestinationsPage lang={lang!} />} />
            <Route path=":slug/:slug/" element={<DestinationsPage lang={lang!} />} />
          </Routes>
        </div>
      <Footer />
    </>
  );
};

export default App;