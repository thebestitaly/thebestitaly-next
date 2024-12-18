"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Correzione dell'import
import { useQuery } from '@tanstack/react-query';
import directusClient from '@/lib/directus';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Seo from '@/components/widgets/Seo';
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
  const { lang = 'it' } = useParams<{ lang: string }>();
  const langDisplay = lang?.toUpperCase();

  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const { data: menuTranslations, error: translationsError } = useQuery({
    queryKey: ['translations', lang, 'menu'],
    queryFn: async () => {
      try {
        const response = await directusClient.getTranslations(lang, 'menu');
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
    <>
      <Seo
        title={`${menuTranslations?.experience || 'Italian Experiences'} | TheBestItaly`}
        description={menuTranslations?.experience_sub || ''}
        image={ExperienceHeroImage}
        type="website"
        schema={experienceSchema}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[400px] bg-gray-900">
          <div className="absolute inset-0">
            <img
              src={ExperienceHeroImage}
              alt={menuTranslations?.experience}
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {menuTranslations?.experience || 'Discover Italian Experiences'}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {menuTranslations?.experience_sub || 'Find and book the best tours, activities, and experiences across Italy'}
              </p>
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
                  className="bg-white rounded-lg shadow-lg p-6"
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
    </>
  );
};

export default ExperiencePage;