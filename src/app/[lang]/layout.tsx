import { Metadata } from 'next';
import { Suspense } from 'react';
import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientProviders from '@/components/ClientProviders';
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
  const isRTL = ['ar', 'fa', 'he', 'ur'].includes(lang);

  return (
    <html 
      lang={lang} 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="font-sans"
    >
      <body className="antialiased">
        <ClientProviders lang={lang}>
          <Suspense fallback={<div>Loading...</div>}>
            <Header lang={lang} />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </Suspense>
        </ClientProviders>
      </body>
    </html>
  );
}