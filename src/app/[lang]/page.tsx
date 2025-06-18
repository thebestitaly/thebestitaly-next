// app/[lang]/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import directusClient, { getSupportedLanguages } from '@/lib/directus';
import { getTranslationsForSection } from '@/lib/translations-server';
import FeaturedDestinationsSlider from '../../components/home/FeaturedDestinationsSlider';
import FeaturedCompaniesSlider from '../../components/home/FeaturedCompaniesSlider';
import HomepageDestinationsCarousel from '../../components/home/HomepageDestinationsCarousel';
import GetYourGuideWidget from '../../components/widgets/GetYourGuideWidget';
import LatestArticles from '../../components/magazine/LatestArticles';
import FeaturedHomepageArticles from '../../components/magazine/FeaturedHomepageArticles';
import CategoriesList from '../../components/magazine/CategoriesList';
import ProjectIntro from '../../components/home/ProjectIntro';
import BookExperience from '../../components/home/BookExperience';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import JsonLdSchema from '@/components/widgets/JsonLdSchema';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  let pageTitle = 'TheBestItaly - Discover the Best of Italy';
  let pageDescription = 'Discover the best destinations and excellences of Italy. The complete guide for quality tourism in over 50 languages.';

  // Traduzioni specifiche per lingua
  const descriptions = {
    it: 'Scopri le migliori destinazioni e eccellenze d\'Italia. La guida completa per il turismo di qualità in oltre 50 lingue.',
    en: 'Discover the best destinations and excellences of Italy. The complete guide for quality tourism in over 50 languages.',
    fr: 'Découvrez les meilleures destinations et excellences d\'Italie. Le guide complet pour un tourisme de qualité en plus de 50 langues.',
    es: 'Descubre los mejores destinos y excelencias de Italia. La guía completa para el turismo de calidad en más de 50 idiomas.',
    de: 'Entdecken Sie die besten Reiseziele und Exzellenzen Italiens. Der komplette Reiseführer für Qualitätstourismus in über 50 Sprachen.',
    pt: 'Descubra os melhores destinos e excelências da Itália. O guia completo para turismo de qualidade em mais de 50 idiomas.'
  };

  // Usa la descrizione specifica per la lingua o fallback in inglese
  pageDescription = descriptions[lang as keyof typeof descriptions] || descriptions.en;

  try {
    // Fetch homepage specific data from titles collection with ID = 1 (homepage)
    const record = await directusClient.get('/items/titles/1', {
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
    console.warn('Could not fetch homepage titles from database, using defaults:', error);
    // Fallback to translations
    try {
      const homeTranslations = await getTranslationsForSection('homepage', lang);
      if (homeTranslations) {
        pageTitle = homeTranslations.seo_title || homeTranslations.title || pageTitle;
        pageDescription = homeTranslations.seo_summary || pageDescription;
      }
    } catch (translationError) {
      console.warn('Could not fetch translations either, using language-specific defaults:', translationError);
    }
  }
  
  // Generate proper canonical URL for homepage
  const canonicalUrl = generateCanonicalUrl(lang);
  
  // Generate hreflang for homepage (all supported languages)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  const supportedLangs = await getSupportedLanguages();
  const hreflangs: { [key: string]: string } = {};
  
  supportedLangs.forEach(supportedLang => {
    hreflangs[supportedLang] = `${baseUrl}/${supportedLang}`;
  });
  
  // Schema for homepage
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TheBestItaly",
    "description": pageDescription,
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
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
    title: pageTitle,
    description: pageDescription,
    type: 'website',
    canonicalUrl,
    hreflangs,
    schema,
  });
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const homeTranslations = await getTranslationsForSection('homepage', lang);
  
  // Generate schema for homepage
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  const supportedLangs = await getSupportedLanguages();
  const hreflangs: { [key: string]: string } = {};
  
  supportedLangs.forEach(supportedLang => {
    hreflangs[supportedLang] = `${baseUrl}/${supportedLang}`;
  });
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TheBestItaly",
    "description": "Discover the best destinations and excellences of Italy. The complete guide for quality tourism.",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
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

  return (
    <div>
      <JsonLdSchema schema={schema} />
      <Suspense fallback={<div>Loading...</div>}>
        <FeaturedDestinationsSlider />
        <div className="container mx-auto px-4 py-12">
          <ProjectIntro />
        </div>

        <HomepageDestinationsCarousel lang={lang} />
        {/* Sezione Eccellenze/Companies */}
        <div className="py-12">
          <FeaturedCompaniesSlider />
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <GetYourGuideWidget lang={lang} destinationName="Italy" />
        </div>
                {/* Featured Articles Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {homeTranslations?.featured_articles_title || 'Featured Articles'}
              </h2>
            </div>
            <FeaturedHomepageArticles lang={lang} />
          </div>
        </div>

        {/* Latest Articles Section */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Latest Articles</h2>
          <LatestArticles lang={lang} />
        </div>
        
        <BookExperience />
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <CategoriesList lang={lang} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}