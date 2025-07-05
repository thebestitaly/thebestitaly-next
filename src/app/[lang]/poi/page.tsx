import { Metadata } from 'next';
import { Suspense } from 'react';
import directusWebClient from '@/lib/directus-web';
import EccellenzeList from '@/components/companies/EccellenzeList';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import { getTranslations } from '@/lib/directus-web';

const ExcellenceeroImage = '/images/excellence.webp';

// 🚀 ISR: Rigenera la pagina ogni 2 ore (7200 secondi)
export const revalidate = 7200;

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  let pageTitle = 'Eccellenze Italiane';
  let pageDescription = 'Scopri le migliori eccellenze italiane: hotel di lusso, ristoranti stellati, esperienze uniche e attività imperdibili in Italia.';

  try {
    // Fetch eccellenze specific data from titles collection with ID = 3 (eccellenze)
    const record = await directusWebClient.get('/items/titles/3', {
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

export default async function EccellenzePage({ params: { lang } }: { params: { lang: string } }) {
  
  // 🚀 Load companies and translations in parallel
  const [companiesResult, pageTranslations, pageTitles] = await Promise.all([
    directusWebClient.getCompanies({ lang, filters: { active: { _eq: true } }, limit: 50 }),
    getTranslations(lang, 'eccellenze'),
    // Get titles from the titles collection (ID 3 for eccellenze)
    directusWebClient.get('/items/titles/3', {
      params: {
        fields: ['translations.title', 'translations.subtitle', 'translations.seo_title'],
        deep: {
          translations: {
            _filter: { languages_code: { _eq: lang } }
          }
        }
      }
    }).then(response => response?.data?.data?.translations?.[0]).catch(() => ({}))
  ]);

  // Convert companiesResult to array
  const companies = Array.isArray(companiesResult) ? companiesResult : (companiesResult ? [companiesResult] : []);
  
  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8">
        <div>
          <EccellenzeList 
             lang={lang}
             initialCompanies={companies}
             initialPageTranslations={pageTranslations}
             initialPageTitles={pageTitles}
           />
        </div>
      </div>
    </div>
  );
} 