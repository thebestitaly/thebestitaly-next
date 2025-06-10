"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Correzione dell'import
import { useQuery } from '@tanstack/react-query';
import directusClient, { getTranslations } from '@/lib/directus';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Seo from '@/components/widgets/Seo';
import Image from 'next/image';
const ExperienceHeroImage = '/images/experience.webp';

const CITIES = [
  { name: 'Roma', query: 'Rome' },
  { name: 'Pompei', query: 'Pompei' },
  { name: 'Napoli', query: 'Naples, Italy' },
  { name: 'Milano', query: 'Milan' },
  { name: 'Venezia', query: 'Venice' },
  { name: 'Torino', query: 'Turin' },
  { name: 'Palermo', query: 'Palermo' },
  { name: 'Bologna', query: 'Bologna' },
  { name: 'Firenze', query: 'Florence' },
];

const ExperiencePage: React.FC = () => {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || 'it';
  const langDisplay = lang?.toUpperCase();

  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const { data: menuTranslations, error: translationsError } = useQuery({
    queryKey: ['translations', lang, 'menu'],
    queryFn: async () => {
      try {
        const response = await getTranslations(lang, 'menu');
        return response;
      } catch (error) {
        console.error('Error fetching translations:', error);
        return null;
      }
    },
  });

  const experienceSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": menuTranslations?.experience || "Italian Experiences",
    "description": menuTranslations?.experience_sub || "Find and book the best tours, activities, and experiences across Italy",
    "url": currentUrl, // Usare lo stato aggiornato con `window.location.href`
    "image": ExperienceHeroImage,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IT"
    },
    "tourBookingPage": currentUrl,
    "touristType": ["Family vacation", "Cultural tourism", "Adventure tourism"]
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Seo
        title={`${menuTranslations?.experience || 'Italian Experiences'} | TheBestItaly`}
        description={menuTranslations?.experience_sub || ''}
        image={ExperienceHeroImage}
        type="website"
        schema={experienceSchema}
      />

      {/* Hero Section */}
      <div className="relative h-80 lg:h-[500px]">
        <div className="absolute inset-0 m-10">
          <Image
            src={ExperienceHeroImage}
            alt={menuTranslations?.experience || 'Italian Experiences'}
            fill
            className="object-cover rounded-2xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
          
        </div>
        <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <div className="max-w-4xl">
                <h1 className="text-3xl lg:text-5xl font-black text-white leading-none mb-4">
                {menuTranslations?.experience || 'Discover Italian Experiences'}
              </h1>
              <p className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">
                {menuTranslations?.experience_sub || 'Find and book the best tours, activities, and experiences across Italy'}
              </p>
            </div>
          </div>        
        </div>
      </div>

        <Breadcrumb />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">
              {menuTranslations?.all_activities || 'All Activities in Italy'}
            </h2>
          </section>

          <div className="grid grid-cols-1 gap-8">
            {CITIES.map((city) => (
              <section key={city.name}>
                <h2 className="text-2xl font-bold mb-6">
                  {menuTranslations?.experiences_in?.replace('{city}', city.name) || city.name}
                </h2>
                <div
                  data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                  data-gyg-locale-code={`${lang}-${langDisplay}`}
                  data-gyg-widget="activities"
                  data-gyg-number-of-items="4"
                  data-gyg-partner-id="6JFNZ19"
                  data-gyg-q={city.query}
                ></div>
              </section>
            ))}
          </div>
        </div>
      </div>
  );
};

export default ExperiencePage;