"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import directusClient from '../../lib/directus';

interface Company {
  id: number;
  company_name: string;
  website?: string;
  featured_image?: string;
  translations?: {
    seo_title?: string;
    seo_summary?: string;
    slug_permalink?: string;
  }[];
}

interface FeaturedCompaniesSliderProps {
  className?: string;
}

const FeaturedCompaniesSlider: React.FC<FeaturedCompaniesSliderProps> = ({ className = '' }) => {
  console.log('🚀 FeaturedCompaniesSlider component is mounting...');
  
  const params = useParams();
  const lang = (params?.lang as string) || 'it';
  console.log('🌍 Language detected:', lang);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch featured companies
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['featured-companies-homepage', lang],
    queryFn: async () => {
      console.log('🔍 Fetching homepage companies for lang:', lang);
      const result = await directusClient.getHomepageCompanies(lang);
      console.log('📊 Homepage companies result:', result);
      console.log('📊 Number of companies:', result?.length || 0);
      if (result?.length > 0) {
        console.log('📊 First company:', result[0]);
        console.log('📊 First company translations:', result[0]?.translations);
      }
      return result;
    }
  });

  console.log('📊 Query state - isLoading:', isLoading, 'error:', error, 'companies:', companies?.length || 0);

  // Auto-advance slider
  useEffect(() => {
    if (!companies?.length || companies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % companies.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [companies?.length]);

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
    if (!companies?.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % companies.length);
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
      <div className={`relative h-96 bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 mx-[40px] rounded-xl ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error in FeaturedCompaniesSlider:', error);
    return null; // Nascondi il componente se c'è un errore
  }

  if (!companies?.length) {
    console.log('🚫 No companies found, returning null');
    return null; // Nascondi il componente se non ci sono companies
  }

  console.log('✅ Rendering slider with', companies.length, 'companies');

  const currentCompany = companies[currentIndex];
  const currentTranslation = currentCompany?.translations?.[0];

  return (
    <div 
      ref={containerRef}
      className={`relative h-96 overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 mx-[40px] rounded-xl ${className}`}
    >
      {/* Dynamic Background with Parallax */}
      <div className="absolute inset-0">
        {companies.map((company: Company, index: number) => (
          <div
            key={company.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentIndex ? 'opacity-30 scale-100' : 'opacity-0 scale-110'
            }`}
            style={{
              transform: index === currentIndex 
                ? `translate(${(mousePosition.x - 0.5) * 10}px, ${(mousePosition.y - 0.5) * 10}px) scale(1.02)`
                : 'scale(1.1)'
            }}
          >
            {company.featured_image && (
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                alt={currentTranslation?.seo_title || company.company_name || ''}
                fill
                className="object-cover"
                priority={index === 0}
              />
            )}
          </div>
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 via-amber-800/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className={`transition-all duration-1000 ${isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
              
              {/* Section Title */}
              <div className="text-amber-200 text-sm font-medium mb-4 tracking-widest uppercase">
                🏆 Le Nostre Eccellenze
              </div>
              
              {/* Company Name */}
              <h2 className="text-4xl lg:text-6xl font-black text-white leading-none mb-4">
                {currentCompany?.company_name || 'Eccellenza'}
              </h2>
              
              {/* SEO Title/Description */}
              {currentTranslation?.seo_title && (
                <p className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">
                  {currentTranslation.seo_title}
                </p>
              )}
              
              {/* Summary */}
              {currentTranslation?.seo_summary && (
                <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-2xl">
                  {currentTranslation.seo_summary}
                </p>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-4">
                {currentTranslation?.slug_permalink && (
                  <Link
                    href={`/${lang}/eccellenze/${currentTranslation.slug_permalink}/`}
                    className="group inline-flex items-center px-6 py-3 bg-white text-amber-900 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 shadow-lg"
                  >
                    <span className="mr-2">Scopri di più</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                
                <button 
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 group"
                >
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {companies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-2">
            {companies.map((_: Company, index: number) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 ${
                  index === currentIndex 
                    ? 'w-12 h-2 bg-white' 
                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                } rounded-full`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Ring */}
      <div className="absolute top-6 right-6 z-20">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - (currentIndex + 1) / companies.length)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
            {String(currentIndex + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCompaniesSlider; 