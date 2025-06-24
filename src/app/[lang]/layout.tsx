import { Suspense } from 'react';
import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientProviders from '@/components/ClientProviders';
import HtmlLangUpdater from '@/components/HtmlLangUpdater';
import PerformanceMonitor from '@/components/PerformanceMonitor';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
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