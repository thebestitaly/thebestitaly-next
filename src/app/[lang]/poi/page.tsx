import { Metadata } from 'next';
import { Suspense } from 'react';
import directusClient from '@/lib/directus';
import EccellenzeList from '../../../components/companies/EccellenzeList';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
const ExcellenceeroImage = '/images/excellence.webp';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  let pageTitle = 'Eccellenze Italiane';
  let pageDescription = 'Scopri le migliori eccellenze italiane: hotel di lusso, ristoranti stellati, esperienze uniche e attività imperdibili in Italia.';

  try {
    // Fetch eccellenze specific data from titles collection with ID = 3 (eccellenze)
    const record = await directusClient.get('/items/titles/3', {
      params: {
        fields: ['translations.title', 'translations.seo_title', 'translations.seo_summary'],
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
      pageTitle = translation.seo_title || translation.title || pageTitle;
      pageDescription = translation.seo_summary || pageDescription;
    }
  } catch (error) {
    console.warn('Could not fetch eccellenze titles from database, using defaults:', error);
    // I valori di default sono già impostati
  }
  
  // Generate proper canonical URL for eccellenze page
  const canonicalUrl = generateCanonicalUrl(lang, ['poi']);

  return generateSEO({
    title: `${pageTitle}`,
    description: pageDescription,
    type: 'website',
    canonicalUrl,
  });
}

export default async function EccellenzePage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Caricamento eccellenze...</p>
          </div>
        </div>
      }>
        <EccellenzeList lang={lang} />
      </Suspense>
    </div>
  );
} 