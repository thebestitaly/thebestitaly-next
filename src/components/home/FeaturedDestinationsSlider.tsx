"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/imageUtils';
import { Destination } from '@/lib/directus'; // Aggiungiamo il tipo Destination

interface FeaturedDestinationsSliderProps {
  className?: string;
  initialDestinations: Destination[]; // Prop per ricevere i dati
}

const FeaturedDestinationsSlider: React.FC<FeaturedDestinationsSliderProps> = ({
  className = '',
  initialDestinations: destinations, // Usiamo i dati passati via prop
}) => {
  const params = useParams();
  const lang = (params?.lang as string) || 'it';
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-advance slider - only on client
  useEffect(() => {
    if (!isMounted || !destinations?.length || destinations.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isMounted, destinations?.length]);

  // Mouse tracking for parallax - only on client
  useEffect(() => {
    if (!isMounted) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMounted]);

  const nextSlide = () => {
    if (!destinations?.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  // Helper function to build destination URL
  const buildDestinationUrl = (destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId);
    if (!destination) return '#';

    const translation = destination.translations?.[0];
    if (!translation?.slug_permalink) return '#';

    const { type } = destination;
    
    if (type === 'region') {
      return `/${lang}/${translation.slug_permalink}`;
    } else if (type === 'province') {
      // Province: /{lang}/{region_slug}/{province_slug}
      // Access region data from the nested structure loaded by field presets
      const regionTranslation = destination.region_id?.translations?.[0];
      const regionSlug = regionTranslation?.slug_permalink;
      
      if (regionSlug) {
        return `/${lang}/${regionSlug}/${translation.slug_permalink}`;
      }
    } else if (type === 'municipality') {
      // Municipality: /{lang}/{region_slug}/{province_slug}/{municipality_slug}
      // Access parent data from the nested structure loaded by field presets
      const regionTranslation = destination.region_id?.translations?.[0];
      const provinceTranslation = destination.province_id?.translations?.[0];
      const regionSlug = regionTranslation?.slug_permalink;
      const provinceSlug = provinceTranslation?.slug_permalink;
      
      if (regionSlug && provinceSlug) {
        return `/${lang}/${regionSlug}/${provinceSlug}/${translation.slug_permalink}`;
      }
    }

    // Fallback: just use the slug as region-level
    return `/${lang}/${translation.slug_permalink}`;
  };

  if (!destinations?.length) {
    return (
      <div className={`relative h-[85vh] bg-yellow-900 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Featured Destinations</h2>
            <p>No destinations with featured_status = "Homepage" found</p>
          </div>
        </div>
      </div>
    );
  }

  
  const currentDestination = destinations[currentIndex];
  const currentTranslation = currentDestination?.translations?.[0];

  return (
    <div 
      ref={containerRef}
      className={`relative h-[83vh] overflow-hidden bg-black mx-6 mt-6 mb-6 rounded-xl ${className}`}
    >
      {/* Dynamic Background with Parallax */}
      <div className="absolute inset-0">
        {destinations.map((destination, index) => (
          <div
            key={destination.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
            style={{
              transform: index === currentIndex && isMounted
                ? `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px) scale(1.05)`
                : 'scale(1.1)'
            }}
          >
            {destination.image && (
              <>
                <Image
                  src={getOptimizedImageUrl(destination.image, 'HERO_DESKTOP')}
                  alt={`${destination.translations?.[0]?.destination_name || 'Beautiful destination'} - scenic landscape view`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Right gradient overlay to darken background behind gallery */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-transparent to-transparent" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main Content - Positioned Lower */}
      <div className="relative z-10 h-full flex items-end pb-8 lg:pb-32 text-left mt-8">
        <div className="container mx-auto px-8 lg:px-16">
          <div className="max-w-4xl">
            <div className={`transition-all duration-1000 ${isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
              {/* Mobile: Clean minimal text only */}
              <Link 
                href={buildDestinationUrl(currentDestination.id)} 
                className="lg:hidden text-left block"
                aria-label={`Explore ${currentTranslation?.destination_name || 'this destination'} - ${currentTranslation?.seo_summary || 'Discover more'}`}
              >
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-none mb-2 tracking-tighter">
                  {currentTranslation?.destination_name || 'Italy'}
                </h2>
                {currentTranslation?.seo_summary && (
                  <p className="text-white/80 text-base font-light max-w-sm leading-relaxed mb-16">
                    {currentTranslation.seo_summary}
                  </p>
                )}
              </Link>

              {/* Desktop: Full layout with summary - Smaller titles */}
              <Link 
                href={buildDestinationUrl(currentDestination.id)} 
                className="hidden lg:block text-left"
                aria-label={`Explore ${currentTranslation?.destination_name || 'this destination'} - ${currentTranslation?.seo_summary || 'Discover more'}`}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-bold text-white mb-2 tracking-tighter">
                  {currentTranslation?.destination_name || 'Italy'}
                </h2>
                
                {/* SEO Summary under title */}
                {currentTranslation?.seo_summary && (
                  <p className="text-xl text-white/90 font-light max-w-2xl leading-relaxed">
                    {currentTranslation.seo_summary}
                  </p>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop only: Navigation elements */}
      <div className="hidden lg:block">
        {/* Minimal Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-3">
            {destinations.map((destination, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${destination.translations?.[0]?.destination_name || `destination ${index + 1}`}`}
                className={`transition-all duration-500 ${
                  index === currentIndex 
                    ? 'w-16 h-1 bg-white' 
                    : 'w-8 h-1 bg-white/30 hover:bg-white/50'
                } rounded-full`}
              />
            ))}
          </div>
        </div>

        {/* Animated Progress Ring */}
        <div className="absolute top-8 right-8 z-20">
          <div className="relative w-16 h-16" role="progressbar" aria-label={`Slide ${currentIndex + 1} of ${destinations.length}`}>
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60" aria-hidden="true">
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 25}`}
                strokeDashoffset={`${2 * Math.PI * 25 * (1 - (currentIndex + 1) / destinations.length)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
              {String(currentIndex + 1).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Right Side Photo Scroll */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <div className="flex flex-col gap-3">
            
            {destinations.map((destination, index) => (
              <button
                key={destination.id}
                onClick={() => goToSlide(index)}
                aria-label={`View ${destination.translations?.[0]?.destination_name || `destination ${index + 1}`}`}
                className={`block w-32 h-20 rounded-lg overflow-hidden transition-all duration-500 transform ${
                  index === currentIndex 
                    ? 'ring-2 ring-white scale-110 shadow-2xl' 
                    : 'opacity-60 hover:opacity-90 scale-100 hover:scale-105'
                }`}
              >
                {destination.image && (
                  <Image
                    src={getOptimizedImageUrl(destination.image, 'THUMBNAIL')}
                    alt={`${destination.translations?.[0]?.destination_name || 'Destination'} - thumbnail image`}
                    width={128}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                )}
                <div className={`absolute inset-0 bg-black/20 transition-opacity ${
                  index === currentIndex ? 'opacity-0' : 'opacity-40'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Touch navigation - only on top area to avoid blocking content */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-20 z-10 flex">
        {/* Left half - previous */}
        <button 
          onClick={() => goToSlide(currentIndex > 0 ? currentIndex - 1 : destinations.length - 1)}
          className="flex-1 w-1/2"
          aria-label="Previous destination"
        />
        {/* Right half - next */}
        <button 
          onClick={() => goToSlide(currentIndex < destinations.length - 1 ? currentIndex + 1 : 0)}
          className="flex-1 w-1/2"
          aria-label="Next destination"
        />
      </div>

      {/* Mobile: Minimal dots indicator */}
      <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {destinations.map((_, index) => (
            <div
              key={index}
              className={`transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 h-1.5 bg-white' 
                  : 'w-1.5 h-1.5 bg-white/40'
              } rounded-full`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedDestinationsSlider; 