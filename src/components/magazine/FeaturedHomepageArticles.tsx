"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import directusWebClient from "../../lib/directus-web";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

interface FeaturedHomepageArticlesProps {
  lang: string;
}

const FeaturedHomepageArticles: React.FC<FeaturedHomepageArticlesProps> = ({ lang }) => {
  const [isClient, setIsClient] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query per gli articoli featured in homepage (SOLO featured)
  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['featured-homepage-articles', lang],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/articles/homepage?lang=${lang}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!lang,
  });

  const articles = articlesData || [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  if (error) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          Featured articles not available at the moment.
        </p>
      </div>
    );
  }

  if (!isClient || isLoading) {
    return (
      <div className="relative">
        <div className="animate-pulse bg-gray-100 rounded-2xl p-8 h-80">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 pr-8">
              <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="w-80 h-60 bg-gray-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No featured articles available. Please check that articles have featured_status = 'homepage' and Italian translations.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white pb-16">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-50">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {articles?.map((article: any) => {
            const translation = article.translations?.find(
              (t: any) => t.languages_code === lang
            );

            if (!translation) {
              console.log('No translation found for article', article.id, 'lang:', lang);
              return null;
            }

            const categoryTranslation = article.category_id?.translations?.find(
              (t: any) => t.languages_code === lang
            );

            return (
              <div key={article.id} className="w-full flex-shrink-0">
                <Link 
                  href={`/${lang}/magazine/${translation.slug_permalink}`} 
                  className="block"
                  aria-label={`Read article: ${translation.titolo_articolo} - ${translation.seo_summary || 'Learn more'}`}
                >
                  <div className="p-4 md:p-8 lg:p-12">
                    {/* Mobile Layout - Stack vertically */}
                    <div className="block md:hidden">
                      {/* Mobile Image */}
                      <div className="w-full h-48 relative rounded-2xl overflow-hidden mb-4">
                        {article.image ? (
                          <Image
                            src={getOptimizedImageUrl(article.image, 'CARD')}
                            alt={`${translation.titolo_articolo} - article featured image`}
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
                        {categoryTranslation && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                              </svg>
                              {categoryTranslation.nome_categoria}
                            </span>
                          </div>
                        )}
                        
                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                          {translation.titolo_articolo}
                        </h2>
                        
                        {/* Description */}
                        {translation.seo_summary && (
                          <p className="text-base text-gray-600 leading-relaxed">
                            {translation.seo_summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Desktop Layout - Side by side */}
                    <div className="hidden md:flex items-center max-w-7xl mx-auto h-96">
                      {/* Left Content - 50% */}
                      <div className="w-1/2 pr-8 lg:pr-12">
                        {/* Category Badge */}
                        {categoryTranslation && (
                          <div className="mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                              </svg>
                              {categoryTranslation.nome_categoria}
                            </span>
                          </div>
                        )}
                        
                        {/* Title */}
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                          {translation.titolo_articolo}
                        </h2>
                        
                        {/* Description */}
                        {translation.seo_summary && (
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {translation.seo_summary}
                          </p>
                        )}
                      </div>
                      
                      {/* Right Image - Exactly 50% and taller */}
                      <div className="w-1/2 h-full relative rounded-2xl overflow-hidden">
                        {article.image ? (
                          <Image
                            src={getOptimizedImageUrl(article.image, 'CARD')}
                            alt={`${translation.titolo_articolo} - article featured image`}
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
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lines Indicator */}
      {articles.length > 1 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {articles.map((article: any, index: number) => {
            const translation = article.translations?.find((t: any) => t.languages_code === lang);
            return (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`View article: ${translation?.titolo_articolo || `article ${index + 1}`}`}
                className={`h-1 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-gray-800 w-12' 
                    : 'bg-gray-300 w-6 hover:bg-gray-400'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedHomepageArticles; 