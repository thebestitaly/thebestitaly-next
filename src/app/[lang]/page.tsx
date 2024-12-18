// app/[lang]/page.tsx
import { Metadata } from 'next';
import { getTranslations } from '../../lib/directus';
import HeroSection from '../../components/home/HeroSection';
import GetYourGuideWidget from '../../components/widgets/GetYourGuideWidget';
import LatestArticles from '../../components/magazine/LatestArticles';
import CategoriesList from '../../components/magazine/CategoriesList';
import DestinationsCarousel from '../../components/destinations/DestinationsCarousel';
import ProjectIntro from '../../components/home/ProjectIntro';
import BookExperience from '../../components/home/BookExperience';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';

interface HomePageProps {
  params: {
    lang: string;
  };
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = params;
  const homeTranslations = await getTranslations(lang, 'homepage');

  return generateSEO({
    title: `${homeTranslations?.seo_title || 'TheBestItaly'} | TheBestItaly`,
    description: homeTranslations?.seo_summary || '',
    type: 'website',
  });
}

export default async function Home({ params }: HomePageProps) {
  const { lang } = params;
  const homeTranslations = await getTranslations(lang, 'homepage');

  return (
    <div className="space-y-12">
      <HeroSection />
      <div className="container mx-auto px-4">
        <DestinationsCarousel lang={lang} type="region" />
      </div>
      <GetYourGuideWidget lang={lang} destinationName="Italy" />
      <div className="container mx-auto px-4">
        <LatestArticles lang={lang} />
      </div>
      <div className="container mx-auto px-4">
        <ProjectIntro lang={lang} />
      </div>
      <BookExperience lang={lang} />
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <CategoriesList lang={lang} />
        </div>
      </div>
    </div>
  );
}