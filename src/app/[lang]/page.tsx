// app/[lang]/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/lib/directus';
import FeaturedDestinationsSlider from '../../components/home/FeaturedDestinationsSlider';
import FeaturedCompaniesSlider from '../../components/home/FeaturedCompaniesSlider';
import HomepageDestinationsCarousel from '../../components/home/HomepageDestinationsCarousel';
import GetYourGuideWidget from '../../components/widgets/GetYourGuideWidget';
import LatestArticles from '../../components/magazine/LatestArticles';
import CategoriesList from '../../components/magazine/CategoriesList';
import ProjectIntro from '../../components/home/ProjectIntro';
import BookExperience from '../../components/home/BookExperience';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const homeTranslations = await getTranslations(lang, 'homepage');

  return generateSEO({
    title: `${homeTranslations?.seo_title || 'TheBestItaly'} | TheBestItaly`,
    description: homeTranslations?.seo_summary || '',
    type: 'website',
  });
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;

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