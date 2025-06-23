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
  slug_permalink?: string;
  active: boolean;
  lat: number;
  long: number;
  featured_status: string;
  category_id?: {
    id: number;
    translations?: {
      name?: string;
    }[];
  };
  translations: {
    languages_code: string;
    seo_title?: string;
    seo_summary?: string;
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

  // Helper function to build company URL
  const buildCompanyUrl = (company: Company) => {
    // Try company.slug_permalink first
    if (company.slug_permalink) {
      return `/${lang}/poi/${company.slug_permalink}/`;
    }
    
    // Fallback: generate slug from company name
    const generatedSlug = company.company_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return generatedSlug ? `/${lang}/poi/${generatedSlug}/` : '#';
  };

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

  // Companies are already filtered by the API call with the correct conditions:
  // - featured_status = 'homepage'
  // - active = true  
  // - have translation for current language
  const filteredCompanies = companies;

  const nextSlide = () => {
    if (!filteredCompanies?.length) return;
    setCurrentSlide((prev) => (prev + 1) % filteredCompanies.length);
  };

  const prevSlide = () => {
    if (!filteredCompanies?.length) return;
    setCurrentSlide((prev) => (prev - 1 + filteredCompanies.length) % filteredCompanies.length);
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
        <div className="animate-pulse bg-blue-50 rounded-2xl p-8" style={{ height: '320px', minHeight: '320px' }}>
          <div className="flex items-center justify-between h-full">
            <div className="w-80 h-60 bg-blue-200 rounded-2xl" style={{ width: '320px', height: '240px', minWidth: '320px', minHeight: '240px' }}></div>
            <div className="flex-1 pl-8">
              <div className="h-8 bg-blue-200 rounded mb-4 w-3/4" style={{ height: '32px', minHeight: '32px' }}></div>
              <div className="h-4 bg-blue-200 rounded mb-2 w-full" style={{ height: '16px', minHeight: '16px' }}></div>
              <div className="h-4 bg-blue-200 rounded w-2/3" style={{ height: '16px', minHeight: '16px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredCompanies?.length) {
    return null;
  }

  return (
    <div className="relative w-full bg-white pb-16">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-50">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {filteredCompanies.map((company: Company) => {
            const translation = company.translations?.[0];
            const categoryTranslation = company.category_id?.translations?.[0];

            return (
              <div key={company.id} className="w-full flex-shrink-0">
                <Link 
                  href={buildCompanyUrl(company)} 
                  className="block"
                  aria-label={`Visit ${company.company_name} - ${translation?.seo_title || translation?.seo_summary || 'Learn more about this company'}`}
                >
                  <div className="p-4 md:p-8 lg:p-12">
                    {/* Mobile Layout - Image on top, content below */}
                    <div className="block md:hidden">
                      {/* Mobile Image */}
                      <div className="w-full h-64 relative rounded-2xl overflow-hidden mb-6">
                        {company.featured_image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}?width=600&height=400&fit=cover`}
                            alt={`${company.company_name} - ${translation?.seo_title || 'company image'}`}
                            fill
                            className="object-cover"
                            sizes="100vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-blue-600 text-lg">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile Content */}
                      <div className="text-left">
                        {/* Category Badge */}
                        {categoryTranslation?.name && (
                          <div className="mb-2">
                            <span className="inline-flex items-center text-lg bold text-bold font-small text-blue-800">
                              {categoryTranslation.name}
                            </span>
                          </div>
                        )}
                        {/* Company Name */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                          {company.company_name}
                        </h2>
                        
                        {/* Description */}
                        {translation?.seo_summary && (
                          <p className="text-base text-gray-600 leading-relaxed">
                            {translation.seo_summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Desktop Layout - Side by side */}
                    <div className="hidden md:flex items-center max-w-7xl mx-auto h-96">
                      {/* Left Image - 50% */}
                      <div className="w-1/2 h-full relative rounded-2xl overflow-hidden mr-8 lg:mr-12">
                        {company.featured_image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}?width=600&height=400&fit=cover`}
                            alt={`${company.company_name} - ${translation?.seo_title || 'company image'}`}
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
                        {categoryTranslation?.name && (
                          <div className="mb-6">
                            <span className="inline-flex items-center text-lg font-medium text-blue-800">
                              {categoryTranslation.name}
                            </span>
                          </div>
                        )}
                        
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
      {filteredCompanies.length > 1 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {filteredCompanies.map((company: Company, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`View ${company.company_name}`}
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