import { Suspense } from 'react';
import "../globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientProviders from '@/components/ClientProviders';
import HtmlLangUpdater from '@/components/HtmlLangUpdater';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import directusWebClient from '@/lib/directus-web';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { lang } = await params;

  // 🛡️ LANG VALIDATION: Ensure we have a valid language
  const validLang = ['it', 'en', 'fr', 'es', 'de', 'pt', 'tr', 'nl', 'ro', 'sv', 'pl', 'vi', 'id', 'el', 'uk', 'ru', 'bn', 'zh', 'hi', 'ar', 'fa', 'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk', 'sl', 'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk', 'az', 'ka', 'hy', 'is', 'sw', 'zh-tw', 'no'].includes(lang) ? lang : 'it';

  // 🔄 DEBUG: Log language being used
  console.log(`🌍 [LAYOUT] Loading layout for language: ${validLang} (original: ${lang})`);

  // Fetch data for the header on the server with fallback
  let destinations = [];
  let categories = [];
  
  try {
    // 🔄 FORCE CACHE REFRESH: Clear cache for destinations and categories
    await directusWebClient.invalidateContentCache('destinations');
    await directusWebClient.invalidateContentCache('categories');
    
    console.log(`🔄 [LAYOUT] Cache cleared, fetching fresh data for ${validLang}`);
    
    [destinations, categories] = await Promise.all([
      directusWebClient.getDestinationsByType('region', validLang),
      directusWebClient.getCategories(validLang)
    ]);
    
    // 🔄 DEBUG: Log what we got
    console.log(`🏛️ [LAYOUT] Destinations loaded: ${destinations.length} items`);
    console.log(`📂 [LAYOUT] Categories loaded: ${categories.length} items`);
    
    // 🔄 DEBUG: Check language in first destination
    if (destinations.length > 0) {
      const firstDest = destinations[0];
      console.log(`🎯 [LAYOUT] First destination language: ${firstDest.translations?.[0]?.languages_code}`);
      console.log(`🎯 [LAYOUT] First destination name: ${firstDest.translations?.[0]?.destination_name}`);
    }
    
    // 🔄 DEBUG: Check language in first category
    if (categories.length > 0) {
      const firstCat = categories[0];
      console.log(`🎯 [LAYOUT] First category language: ${firstCat.translations?.[0]?.languages_code}`);
      console.log(`🎯 [LAYOUT] First category name: ${firstCat.translations?.[0]?.nome_categoria}`);
    }
    
  } catch (error) {
    console.error('❌ [LAYOUT] Directus error, using fallback data:', error);
    
    // 🛡️ FALLBACK: Usa dati statici minimi per evitare crash
    destinations = [
      { 
        id: 1, 
        uuid_id: 'fallback-lombardia',
        type: 'region',
        region_id: null,
        province_id: null,
        image: null,
        translations: [{ 
          destination_name: 'Lombardia', 
          slug_permalink: 'lombardia',
          seo_title: 'Lombardia',
          seo_summary: 'Regione Lombardia',
          description: null
        }] 
      },
      { 
        id: 2, 
        uuid_id: 'fallback-lazio',
        type: 'region',
        region_id: null,
        province_id: null,
        image: null,
        translations: [{ 
          destination_name: 'Lazio', 
          slug_permalink: 'lazio',
          seo_title: 'Lazio',
          seo_summary: 'Regione Lazio',
          description: null
        }] 
      },
      { 
        id: 3, 
        uuid_id: 'fallback-campania',
        type: 'region',
        region_id: null,
        province_id: null,
        image: null,
        translations: [{ 
          destination_name: 'Campania', 
          slug_permalink: 'campania',
          seo_title: 'Campania',
          seo_summary: 'Regione Campania',
          description: null
        }] 
      }
    ] as any[];
    
    categories = [
      {
        id: 1,
        uuid_id: 'fallback-ristoranti',
        nome_categoria: 'Ristoranti',
        image: null,
        visible: true,
        translations: [{ 
          nome_categoria: 'Ristoranti', 
          slug_permalink: 'ristoranti' 
        }]
      },
      {
        id: 2,
        uuid_id: 'fallback-hotel',
        nome_categoria: 'Hotel',
        image: null,
        visible: true,
        translations: [{ 
          nome_categoria: 'Hotel', 
          slug_permalink: 'hotel' 
        }]
      }
    ] as any[];
  }

  return (
    <ClientProviders lang={validLang}>
      <HtmlLangUpdater />
      <PerformanceMonitor />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Header lang={validLang} destinations={destinations} categories={categories} />
        <main className="min-h-screen" style={{ minHeight: 'calc(100vh - 160px)' }}>
          {children}
        </main>
        <Footer regions={destinations} categories={categories} />
      </Suspense>
    </ClientProviders>
  );
}