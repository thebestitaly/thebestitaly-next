"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/imageUtils';
import { Destination } from '@/lib/directus';

interface HomepageDestinationsCarouselProps {
  lang: string;
  initialRegions: Destination[];
}

const HomepageDestinationsCarousel: React.FC<HomepageDestinationsCarouselProps> = ({ lang, initialRegions: regions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 5; // Show 5 regions at a time on desktop
  const mobileItemsToShow = 2; // Show 2 regions at a time on mobile

  // Helper function to build destination URL
  const buildDestinationUrl = (destination: Destination) => {
    const translation = destination.translations?.[0];
    if (!translation?.slug_permalink) return '#';

    const { type } = destination;
    
    if (type === 'region') {
      return `/${lang}/${translation.slug_permalink}`;
    } else if (type === 'province') {
      // Province: /{lang}/{region_slug}/{province_slug}
      const regionSlug = destination.region_id?.translations?.find(
        (t: any) => t.languages_code === lang
      )?.slug_permalink;
      
      if (regionSlug) {
        return `/${lang}/${regionSlug}/${translation.slug_permalink}`;
      }
    } else if (type === 'municipality') {
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

  if (!regions || !regions.length) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Explore Italian Regions</h2>
          {/* Mobile loading */}
          <div className="grid grid-cols-2 gap-3 md:hidden h-[300px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-full"></div>
            ))}
          </div>
          {/* Desktop loading */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 h-[400px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    if (regions && currentIndex < regions.length - itemsToShow) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const nextMobileSlide = () => {
    if (regions && currentIndex < regions.length - mobileItemsToShow) {
      setCurrentIndex(prev => prev + mobileItemsToShow);
    }
  };

  const prevMobileSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => Math.max(0, prev - mobileItemsToShow));
    }
  };

  const visibleRegions = regions.slice(currentIndex, currentIndex + itemsToShow);
  const visibleMobileRegions = regions.slice(currentIndex, currentIndex + mobileItemsToShow);

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-800">
          Explore Italian Regions
        </h2>
        
        {/* Mobile Layout - 2 vertical cards */}
        <div className="md:hidden">
          <div className="relative">
            {/* Mobile Navigation */}
            {currentIndex > 0 && (
              <button
                onClick={prevMobileSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 hover:bg-white flex items-center justify-center transition-all duration-200"
                aria-label="Previous regions"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            
            {currentIndex < regions.length - mobileItemsToShow && (
              <button
                onClick={nextMobileSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 hover:bg-white flex items-center justify-center transition-all duration-200"
                aria-label="Next regions"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Mobile Cards Grid */}
            <div className="grid grid-cols-2 gap-3 h-[300px]">
              {visibleMobileRegions.map((region) => {
                const translation = region.translations?.[0];
                if (!translation?.slug_permalink || !translation?.destination_name) return null;

                return (
                  <Link
                    key={region.id}
                    href={buildDestinationUrl(region)}
                    className="group relative h-full overflow-hidden rounded-lg transition-all duration-300 active:scale-95"
                    aria-label={`Explore ${translation.destination_name} - ${translation.seo_summary || 'Discover this beautiful region'}`}
                  >
                    {region.image && (
                      <div className="absolute inset-0">
                        <Image
                          src={getOptimizedImageUrl(region.image, 'CARD')}
                          alt={`${translation.destination_name} - scenic regional landscape`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-bold leading-tight">
                        {translation.destination_name}
                      </h3>
                      
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile lines indicator */}
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: Math.ceil(regions.length / mobileItemsToShow) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * mobileItemsToShow)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / mobileItemsToShow) === index
                      ? 'bg-gray-800 w-12' 
                      : 'bg-gray-300 w-6'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout - 5 horizontal cards */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Desktop Navigation Buttons */}
            {currentIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white rounded-full w-12 h-12 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
                aria-label="Previous regions"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            {regions && currentIndex < regions.length - itemsToShow && (
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white rounded-full w-12 h-12 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
                aria-label="Next regions"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Desktop Carousel Content */}
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 h-[400px]">
              {visibleRegions.map((region) => {
                const translation = region.translations?.[0];
                if (!translation?.slug_permalink || !translation?.destination_name) return null;

                return (
                  <Link
                    key={region.id}
                    href={buildDestinationUrl(region)}
                    className="group relative h-full overflow-hidden rounded-lg transition-all duration-500 transform hover:-translate-y-2"
                    aria-label={`Explore ${translation.destination_name} - ${translation.seo_summary || 'Discover this beautiful region'}`}
                  >
                    {region.image && (
                      <div className="absolute inset-0">
                        <div className="relative w-full h-full">
                          <Image
                            src={getOptimizedImageUrl(region.image, 'CARD')}
                            alt={`${translation.destination_name} - scenic regional landscape`}
                            fill
                            sizes="(max-width: 1200px) 33vw, 20vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 group-hover:to-black/90 transition-all duration-500" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-xl font-bold mb-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {translation.destination_name}
                      </h3>
                      {translation.seo_summary && (
                        <p className="text-sm opacity-0 group-hover:opacity-90 line-clamp-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                          {translation.seo_summary}
                        </p>
                      )}
                    </div>

                    {/* Hover overlay effect */}
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Progress indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.ceil(regions.length / itemsToShow) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * itemsToShow)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / itemsToShow) === index
                      ? 'bg-gray-800 w-12' 
                      : 'bg-gray-300 w-6 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageDestinationsCarousel; 