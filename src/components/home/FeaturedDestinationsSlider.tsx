"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import directusClient from '../../lib/directus';

interface FeaturedDestinationsSliderProps {
  className?: string;
}

const FeaturedDestinationsSlider: React.FC<FeaturedDestinationsSliderProps> = ({ className = '' }) => {
  console.log('🚀 FeaturedDestinationsSlider component is mounting...');
  
  const params = useParams();
  const lang = (params?.lang as string) || 'it';
  console.log('🌍 Language detected:', lang);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch featured destinations
  const { data: destinations, isLoading, error } = useQuery({
    queryKey: ['featured-destinations-homepage', lang],
    queryFn: async () => {
      console.log('🔍 Fetching homepage destinations for lang:', lang);
      const result = await directusClient.getHomepageDestinations(lang);
      console.log('📊 Homepage destinations result:', result);
      console.log('📊 Number of destinations:', result?.length || 0);
      if (result?.length > 0) {
        console.log('📊 First destination:', result[0]);
        console.log('📊 First destination translations:', result[0]?.translations);
      }
      return result;
    }
  });

  console.log('📊 Query state - isLoading:', isLoading, 'error:', error, 'destinations:', destinations?.length || 0);

  // Auto-advance slider
  useEffect(() => {
    if (!destinations?.length || destinations.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [destinations?.length]);

  // Mouse tracking for parallax
  useEffect(() => {
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
  }, []);

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

  if (isLoading) {
    console.log('⏳ Showing loading state...');
    return (
      <div className={`relative h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error in FeaturedDestinationsSlider:', error);
    return (
      <div className={`relative h-screen bg-red-900 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error loading destinations</h2>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!destinations?.length) {
    console.log('🚫 No destinations found, returning null');
    return (
      <div className={`relative h-screen bg-yellow-900 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Featured Destinations</h2>
            <p>No destinations with featured_status = "Homepage" found</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering slider with', destinations.length, 'destinations');

  const currentDestination = destinations[currentIndex];
  const currentTranslation = currentDestination?.translations?.[0];

  return (
    <div 
      ref={containerRef}
      className={`relative h-screen overflow-hidden bg-black mx-[40px] rounded-xl ${className}`}
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
              transform: index === currentIndex 
                ? `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px) scale(1.05)`
                : 'scale(1.1)'
            }}
          >
            {destination.image && (
              <>
                <Image
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`}
                  alt={destination.translations?.[0]?.destination_name || ''}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Floating Glass Card */}
      <div className="hidden lg:block absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-sm shadow-2xl">
          <div className={`transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
              {currentTranslation?.destination_name || 'Destination'}
            </h3>
            {currentTranslation?.seo_title && (
              <p className="text-white/80 text-lg mb-4 font-light">
                {currentTranslation.seo_title}
              </p>
            )}
            {currentTranslation?.seo_summary && (
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {currentTranslation.seo_summary}
              </p>
            )}
            {currentTranslation?.slug_permalink && (
              <Link
                href={`/${lang}/${currentTranslation.slug_permalink}/`}
                className="group inline-flex items-center text-white font-medium hover:text-white/80 transition-all duration-300"
              >
                <span className="mr-2">Discover More</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-16">
          <div className="max-w-4xl">
            <div className={`transition-all duration-1000 ${isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
              {/* Mobile: Clean minimal text only */}
              <div className="lg:hidden text-center">
                <div className="text-white/70 text-xs font-medium mb-3 tracking-widest uppercase">
                  Explore Italy
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-none mb-2">
                  {currentTranslation?.destination_name?.split(' ')[0] || 'Italy'}
                </h1>
                {currentTranslation?.destination_name?.split(' ')[1] && (
                  <h2 className="text-2xl sm:text-3xl font-light text-white/90 leading-none">
                    {currentTranslation.destination_name.split(' ').slice(1).join(' ')}
                  </h2>
                )}
                {currentTranslation?.seo_title && (
                  <p className="text-white/80 text-sm mt-4 font-light max-w-sm mx-auto">
                    {currentTranslation.seo_title}
                  </p>
                )}
              </div>

              {/* Desktop: Full layout */}
              <div className="hidden lg:block">
                <div className="text-white/60 text-sm font-medium mb-4 tracking-widest uppercase">
                  Explore Italy
                </div>
                <h1 className="text-6xl lg:text-8xl xl:text-9xl font-black text-white leading-none mb-8">
                  {currentTranslation?.destination_name?.split(' ')[0] || 'Italy'}
                </h1>
                {currentTranslation?.destination_name?.split(' ')[1] && (
                  <h2 className="text-4xl lg:text-6xl xl:text-7xl font-light text-white/80 leading-none mb-12 -mt-4">
                    {currentTranslation.destination_name.split(' ').slice(1).join(' ')}
                  </h2>
                )}
                
                <div className="flex items-center gap-6">
                  
                  <button 
                    onClick={nextSlide}
                    className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop only: Navigation elements */}
      <div className="hidden lg:block">
        {/* Minimal Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-3">
            {destinations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
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
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
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

        {/* Side Navigation Thumbnails */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 space-y-4">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              onClick={() => goToSlide(index)}
              className={`block w-20 h-20 rounded-xl overflow-hidden transition-all duration-500 ${
                index === currentIndex 
                  ? 'ring-2 ring-white scale-110' 
                  : 'opacity-50 hover:opacity-80 scale-100'
              }`}
            >
              {destination.image && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`}
                  alt={destination.translations?.[0]?.destination_name || ''}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Simple touch navigation */}
      <div className="lg:hidden absolute inset-0 z-10 flex">
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