import { Metadata } from 'next';
import { Suspense } from 'react';
import directusClient, { getSupportedLanguages } from '@/lib/directus';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import MagazinePageClient from './MagazinePageClient';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  let pageTitle = 'Magazine';
  let pageDescription = 'Discover the latest travel articles, guides and tips to explore the best Italian destinations.';

  try {
    // Fetch magazine specific data from categories collection with ID = 10 (magazine)
    const record = await directusClient.get('/items/categorias/10', {
      params: {
        fields: ['translations.nome_categoria', 'translations.seo_title', 'translations.seo_summary'],
        deep: {
          translations: {
            _filter: {
              languages_code: { _eq: lang }
            }
          }
        }
      }
    });

    const titleData = record?.data?.data;
    const translation = titleData?.translations?.[0];
    if (translation) {
      pageTitle = translation.seo_title || translation.nome_categoria || pageTitle;
      pageDescription = translation.seo_summary || pageDescription;
    }
  } catch (error) {
    console.warn('Could not fetch magazine titles from database, using defaults:', error);
  }
  
  // Generate proper canonical URL for magazine page
  const canonicalUrl = generateCanonicalUrl(lang, ['magazine']);
  
  // Generate hreflang for magazine page
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  const supportedLangs = await getSupportedLanguages();
  const hreflangs: { [key: string]: string } = {};
  
  supportedLangs.forEach(supportedLang => {
    hreflangs[supportedLang] = `${baseUrl}/${supportedLang}/magazine`;
  });
  
  // Schema for magazine page
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${pageTitle} | TheBestItaly`,
    "description": pageDescription,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "TheBestItaly",
      "url": baseUrl
    },
    "about": {
      "@type": "Thing",
      "name": "Italian Travel and Tourism",
      "description": "Travel articles, guides and tips about Italy"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TheBestItaly",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`,
        "width": 200,
        "height": 60
      }
    },
    "sameAs": Object.values(hreflangs)
  };

  return generateSEO({
    title: `${pageTitle} | TheBestItaly`,
    description: pageDescription,
    type: 'website',
    canonicalUrl,
    hreflangs,
    schema,
  });
}

export default async function MagazinePage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagazinePageClient lang={lang} />
    </Suspense>
  );
}