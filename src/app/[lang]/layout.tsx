import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientProviders from '@/components/ClientProviders';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const currentLang = resolvedParams?.lang || 'it';
  const isRTL = ['ar', 'fa', 'he', 'ur'].includes(currentLang);

  return (
    <html 
      lang={currentLang} 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="font-sans"
    >
      <body className="antialiased">
        <ClientProviders lang={currentLang}>
          <Header lang={currentLang} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}