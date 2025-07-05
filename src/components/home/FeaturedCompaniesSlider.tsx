"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { Company } from '@/lib/directus-web'; // Import tipo
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface FeaturedCompaniesSliderProps {
  initialCompanies: Company[];
}

const FeaturedCompaniesSlider: React.FC<FeaturedCompaniesSliderProps> = ({ initialCompanies: companies }) => {
   const params = useParams();
   const lang = (params?.lang as string) || 'it';
   
   const [currentSlide, setCurrentSlide] = useState(0);
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
     setIsClient(true);
   }, []);
   
   if (!isClient) {
     return <div>Loading...</div>; // O uno scheletro di caricamento
   }

   if (!companies?.length) {
     return null; // O un messaggio di "nessuna azienda"
   }

   const nextSlide = () => {
     setCurrentSlide((prev) => (prev + 1) % companies.length);
   };
 
   const prevSlide = () => {
     setCurrentSlide((prev) => (prev - 1 + companies.length) % companies.length);
   };

  const buildCompanyUrl = (company: Company) => {
    if (company.slug_permalink) {
      return `/${lang}/poi/${company.slug_permalink}/`;
    }
    return '#';
  };

   return (
    <div className="relative w-full bg-white pb-16">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-50">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {companies.map((company: Company) => {
            const translation = company.translations?.[0];

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
                            src={getOptimizedImageUrl(company.featured_image, 'CARD')}
                            alt={`${company.company_name} - ${translation?.seo_title || 'company image'}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-blue-600 text-lg">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile Content */}
                      <div className="text-left">
                        {/* Category Badge - Removed temporarily */}
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
                            src={getOptimizedImageUrl(company.featured_image, 'CARD')}
                            alt={`${company.company_name} - ${translation?.seo_title || 'company image'}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-blue-600 text-lg">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Right Content - 50% */}
                      <div className="w-1/2">
                        {/* Category Badge - Removed temporarily */}
                        
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
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {companies.map((company: Company, index: number) => (
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