"use client";

import React, { useEffect } from 'react';
import { useSectionTranslations } from '@/hooks/useTranslations';
import Breadcrumb from '@/components/layout/Breadcrumb';
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

interface ExperienceClientComponentProps {
  lang: string;
}

const ExperienceClientComponent: React.FC<ExperienceClientComponentProps> = ({ lang }) => {
  const langDisplay = lang?.toUpperCase();

  const { translations: menuTranslations } = useSectionTranslations('menu', lang);

  useEffect(() => {
    // Optimized lazy load GetYourGuide script
    const loadScript = () => {
      if (document.querySelector('script[src*="getyourguide"]')) return;
      
      const script = document.createElement('script');
      script.src = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';
      script.async = true;
      script.defer = true;
      // script.loading = 'lazy'; // Not supported on script elements
      
      // Add error handling
      script.onerror = () => console.warn('GetYourGuide script failed to load');
      
      document.body.appendChild(script);
    };

    // Load on first meaningful user interaction
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    let loaded = false;
    
    const handleInteraction = () => {
      if (!loaded) {
        loaded = true;
        loadScript();
        events.forEach(event => document.removeEventListener(event, handleInteraction));
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    // Fallback: load after 3 seconds if no interaction
    const timeout = setTimeout(() => {
      if (!loaded) {
        loaded = true;
        loadScript();
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      events.forEach(event => document.removeEventListener(event, handleInteraction));
    };
  }, []);

  return (
    <>
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
    </>
  );
};

export default ExperienceClientComponent; 