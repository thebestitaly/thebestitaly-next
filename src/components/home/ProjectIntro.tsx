"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useSectionTranslations } from '@/hooks/useTranslations';

const FlorenceImage = '/images/home/florence.webp';
const SanPietroImage = '/images/home/san-pietro.webp';

const ProjectIntro: React.FC = () => {
  const params = useParams();
  const lang = (params?.lang as string) || 'it';

  const { translations: infoTranslations } = useSectionTranslations('infothebest', lang);

  return (
    <section className="container mx-auto px-4 py-12 pb-20 mb-12">
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex md:flex-row items-center">
        {/* Desktop Images - Overlapping */}
        <div className="relative md:w-1/2 mb-8 md:mb-0 h-[600px]">
          {/* Immagine posteriore (Firenze) */}
          <div className="absolute right-0 bottom-0 w-[50%] h-[80%] z-10">
            <img 
              src={FlorenceImage} 
              alt="Florence" 
              className="w-half h-full object-cover rounded-3xl shadow-lg" 
              loading="lazy"
            />
          </div>
          {/* Immagine anteriore (San Pietro) */}
          <div className="absolute left-0 top-0 w-[80%] h-[80%] z-20">
            <img 
              src={SanPietroImage} 
              alt="San Pietro" 
              className="w-half h-full object-cover rounded-3xl shadow-2xl" 
              loading="lazy"
            />
          </div>
        </div>

        {/* Desktop Text */}
        <div className="md:w-1/2 md:pl-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {infoTranslations?.title || 'TheBestItaly - All the best of Italy'}
          </h2>
          <h3 className="text-xl text-gray-700 mb-6">
            {infoTranslations?.subtitle || 'The first website dedicated to the best of Italy in more than 50 languages'}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {infoTranslations?.description || 
              'Our website brings the beauty, culture, and excellence of Italy to the world like never before. Through an innovative experience, we explore iconic places and hidden gems, also telling the stories of the best Italian companies. Thanks to personalized content available in 50 languages, we make Italy and its excellence accessible to travelers and lovers of Made in Italy all over the world. Discover the Italian lifestyle and excellence, wherever you are!'}
          </p>
        </div>
      </div>

      {/* Mobile Layout - Text first, then images */}
      <div className="block md:hidden">
        {/* Mobile Text */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {infoTranslations?.title || 'TheBestItaly - All the best of Italy'}
          </h2>
          <h3 className="text-lg text-gray-700 mb-4">
            {infoTranslations?.subtitle || 'The first website dedicated to the best of Italy in more than 50 languages'}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {infoTranslations?.description || 
              'Our website brings the beauty, culture, and excellence of Italy to the world like never before. Through an innovative experience, we explore iconic places and hidden gems, also telling the stories of the best Italian companies. Thanks to personalized content available in 50 languages, we make Italy and its excellence accessible to travelers and lovers of Made in Italy all over the world. Discover the Italian lifestyle and excellence, wherever you are!'}
          </p>
        </div>

        {/* Mobile Images - Vertical */}
        <div className="grid grid-cols-2 gap-4">
          <img 
            src={SanPietroImage} 
            alt="San Pietro" 
            className="w-full h-64 object-cover rounded-xl" 
            loading="lazy"
          />
          <img 
            src={FlorenceImage} 
            alt="Florence" 
            className="w-full h-64 object-cover rounded-xl" 
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default ProjectIntro;