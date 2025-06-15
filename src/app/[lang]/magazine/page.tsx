import { Metadata } from 'next';
import { Suspense } from 'react';
import directusClient from '@/lib/directus';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import MagazinePageClient from './MagazinePageClient';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  let pageTitle = 'Magazine';
  let pageDescription = 'Scopri gli ultimi articoli di viaggio, guide e consigli per esplorare le migliori destinazioni italiane.';

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

  return generateSEO({
    title: `${pageTitle} | TheBestItaly`,
    description: pageDescription,
    type: 'website',
    canonicalUrl,
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