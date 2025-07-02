"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import directusClient from '../../lib/directus';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface DestinationsCarouselProps {
  lang: string;
  type: 'region' | 'province' | 'municipality';
}

const DestinationsCarousel: React.FC<DestinationsCarouselProps> = ({ lang, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 4;

  // Helper function to build destination URL
  const buildDestinationUrl = (destination: any) => {
    const translation = destination.translations?.[0];
    if (!translation?.slug_permalink) return '#';

    const { type: destinationType } = destination;
    
    if (destinationType === 'region') {
      return `/${lang}/${translation.slug_permalink}`;
    } else if (destinationType === 'province') {
      // Province: /{lang}/{region_slug}/{province_slug}
      const regionSlug = destination.region_id?.translations?.find(
        (t: any) => t.languages_code === lang
      )?.slug_permalink;
      
      if (regionSlug) {
        return `/${lang}/${regionSlug}/${translation.slug_permalink}`;
      }
    } else if (destinationType === 'municipality') {
      // Municipality: /{lang}/{region_slug}/{province_slug}/{municipality_slug}
      const regionSlug = destination.region_id?.translations?.find(
        (t: any) => t.languages_code === lang
      )?.slug_permalink;
      
      const provinceSlug = destination.province_id?.translations?.find(
        (t: any) => t.languages_code === lang
      )?.slug_permalink;
      
      if (regionSlug && provinceSlug) {
        return `/${lang}/${regionSlug}/${provinceSlug}/${translation.slug_permalink}`;
      }
    }

    // Fallback: just use the slug as region-level
    return `/${lang}/${translation.slug_permalink}`;
  };

  const { data: destinations, isLoading } = useQuery({
    queryKey: ['destinations', type, lang],
    queryFn: () => directusClient.getDestinationsByType(type, lang)
  });

  if (isLoading || !destinations) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-full"></div>
        ))}
      </div>
    );
  }

  const nextSlide = () => {
    if (destinations && currentIndex < destinations.length - itemsToShow) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const visibleDestinations = destinations.slice(currentIndex, currentIndex + itemsToShow);

  return (
    <div className="relative py-8">
      <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
      
      <div className="relative">
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white rounded-full w-12 h-12 shadow-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
            aria-label="Previous destinations"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {destinations && currentIndex < destinations.length - itemsToShow && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white rounded-full w-12 h-12 shadow-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
            aria-label="Next destinations"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Carousel Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
          {visibleDestinations.map((destination) => {
            const translation = destination.translations?.[0];
            if (!translation?.slug_permalink || !translation?.destination_name) return null;

            return (
              <Link
                key={destination.id}
                href={buildDestinationUrl(destination)}
                className="group relative h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {destination.image && (
                  <div className="absolute inset-0">
                    <div className="relative w-full h-full">
                      <Image
                        src={getOptimizedImageUrl(destination.image, 'CARD')}
                        alt={translation.destination_name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={currentIndex === 0} // Prioritize loading for first visible set
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">
                    {translation.destination_name}
                  </h3>
                  {translation.seo_summary && (
                    <p className="text-sm opacity-90 line-clamp-2">
                      {translation.seo_summary}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DestinationsCarousel;