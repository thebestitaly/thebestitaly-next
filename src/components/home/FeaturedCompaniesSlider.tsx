"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
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
  const params = useParams();
  const lang = (params?.lang as string) || 'it';
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch featured companies
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['featured-companies-homepage', lang],
    queryFn: async () => {
      const result = await directusClient.getHomepageCompanies(lang);
      return result;
    }
  });

  const nextSlide = () => {
    if (!companies?.length) return;
    setCurrentSlide((prev) => (prev + 1) % companies.length);
  };

  const prevSlide = () => {
    if (!companies?.length) return;
    setCurrentSlide((prev) => (prev - 1 + companies.length) % companies.length);
  };

  if (error) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          Featured companies not available at the moment.
        </p>
      </div>
    );
  }

  if (!isClient || isLoading) {
    return (
      <div className="relative">
        <div className="animate-pulse bg-blue-50 rounded-2xl p-8 h-80">
          <div className="flex items-center justify-between h-full">
            <div className="w-80 h-60 bg-blue-200 rounded-2xl"></div>
            <div className="flex-1 pl-8">
              <div className="h-8 bg-blue-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-blue-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-blue-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!companies?.length) {
    return null;
  }

  return (
    <div className="relative w-full bg-white">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-50">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {companies?.map((company: Company) => {
            const translation = company.translations?.[0];

            return (
              <div key={company.id} className="w-full flex-shrink-0">
                <Link href={translation?.slug_permalink ? `/${lang}/poi/${translation.slug_permalink}/` : '#'}>
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center max-w-7xl mx-auto h-96">
                      {/* Left Image - 50% */}
                      <div className="w-1/2 h-full relative rounded-2xl overflow-hidden mr-8 lg:mr-12">
                        {company.featured_image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}?width=600&height=400&fit=cover`}
                            alt={translation?.seo_title || company.company_name}
                            fill
                            className="object-cover"
                            sizes="50vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-blue-600 text-lg">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Right Content - 50% */}
                      <div className="w-1/2">
                        {/* Category Badge */}
                        <div className="mb-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M19 14l-7 7m0 0l-7-7m7 7V3" clipRule="evenodd" />
                            </svg>
                            Eccellenza
                          </span>
                        </div>
                        
                        {/* Company Name */}
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                          {company.company_name}
                        </h2>
                        
                        {/* SEO Title */}
                        {translation?.seo_title && (
                          <h3 className="text-xl text-gray-700 mb-4 font-medium">
                            {translation.seo_title}
                          </h3>
                        )}
                        
                        {/* Description */}
                        {translation?.seo_summary && (
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {translation.seo_summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lines Indicator */}
      {companies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {companies.map((_: Company, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-gray-800 w-12' 
                  : 'bg-gray-300 w-6 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCompaniesSlider; 