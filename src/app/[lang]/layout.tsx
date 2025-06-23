import { Metadata } from 'next';
import { Suspense } from 'react';
import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientProviders from '@/components/ClientProviders';
import HtmlLangUpdater from '@/components/HtmlLangUpdater';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { generateCanonicalUrl } from '@/components/widgets/seo-utils';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { lang } = await params;
  
  // Generate proper canonical URL for homepage
  const canonicalUrl = generateCanonicalUrl(lang);
  
  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'it': 'https://thebestitaly.eu/it',
        'en': 'https://thebestitaly.eu/en',
        'fr': 'https://thebestitaly.eu/fr',
        'de': 'https://thebestitaly.eu/de',
        'es': 'https://thebestitaly.eu/es',
      },
    },
  };
}

export default async function Layout({ children, params }: LayoutProps) {
  const { lang } = await params;

  return (
    <ClientProviders lang={lang}>
      <HtmlLangUpdater />
      <PerformanceMonitor />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Header lang={lang} />
        <main className="min-h-screen" style={{ minHeight: 'calc(100vh - 160px)' }}>
          {children}
        </main>
        <Footer />
      </Suspense>
    </ClientProviders>
  );
}