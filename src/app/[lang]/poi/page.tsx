import { Metadata } from 'next';
import { Suspense } from 'react';
import directusClient from '@/lib/directus';
import EccellenzeList from '@/components/companies/EccellenzeList';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import { getTranslations } from '@/lib/directus';

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

export default async function EccellenzePage({ params: { lang } }: { params: { lang: string } }) {
  
  const [companies, categories, pageTranslations] = await Promise.all([
    directusClient.getCompaniesForListing(lang, { active: { _eq: true } }, 50),
    directusClient.getCompanyCategories(lang),
    getTranslations(lang, 'eccellenze')
  ]);
  
  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8">
        <div>
          <EccellenzeList 
             lang={lang}
             initialCompanies={companies}
             initialCategories={categories}
             initialPageTranslations={pageTranslations}
             initialPageTitles={{}}
           />
        </div>
      </div>
    </div>
  );
} 