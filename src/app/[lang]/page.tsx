// app/[lang]/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/lib/directus';
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

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const homeTranslations = await getTranslations(lang, 'homepage');
  
  // Generate proper canonical URL for this page using helper
  const canonicalUrl = generateCanonicalUrl(lang);

  return generateSEO({
    title: `${homeTranslations?.seo_title || 'TheBestItaly'} | TheBestItaly`,
    description: homeTranslations?.seo_summary || '',
    type: 'website',
    canonicalUrl,
  });
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const homeTranslations = await getTranslations(lang, 'homepage');

  return (
    <div>
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