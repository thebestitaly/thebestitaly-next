import { Metadata } from 'next';
import { Suspense } from 'react';
import directusWebClient from '@/lib/directus-web';
import { getTranslationsForSection } from '@/lib/translations-server';
import ExperienceClientComponent from './ExperienceClientComponent';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  let pageTitle = 'Esperienze Italiane';
  let pageDescription = 'Scopri e prenota le migliori esperienze, tour e attività in Italia. La guida completa per vivere l\'Italia autentica.';

  try {
    // Fetch experience specific data from titles collection with ID = 4 (experience)
    const record = await directusWebClient.get('/items/titles/2', {
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
    console.warn('Could not fetch experience titles from database, using defaults:', error);
    // Fallback to translations
    try {
      const menuTranslations = await getTranslationsForSection('menu', lang);
      if (menuTranslations) {
        pageTitle = menuTranslations.experience || pageTitle;
        pageDescription = menuTranslations.experience_sub || pageDescription;
      }
    } catch (translationError) {
      console.warn('Could not fetch menu translations either:', translationError);
    }
  }
  
  // Generate proper canonical URL for experience page
  const canonicalUrl = generateCanonicalUrl(lang, ['experience']);

  return generateSEO({
    title: `${pageTitle}`,
    description: pageDescription,
    type: 'website',
    canonicalUrl,
  });
}

export default async function ExperiencePage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Caricamento esperienze...</p>
          </div>
        </div>
      }>
        <ExperienceClientComponent lang={lang} />
      </Suspense>
    </div>
  );
}