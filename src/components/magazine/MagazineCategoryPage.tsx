"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import directusClient from "@/lib/directus";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

import ArticleGrid from "./ArticleGrid";

interface MagazineCategoryPageProps {
  lang?: string;
  category?: string;
}

const MagazineCategoryPage: React.FC<MagazineCategoryPageProps> = ({ lang: propLang, category: propCategory }) => {
  const params = useParams<{ lang: string; category: string }>();
  const lang = propLang || params?.lang;
  const category = propCategory || params?.category;


  const { data: articles } = useQuery({
    queryKey: ["articles", category, lang],
    queryFn: () => directusClient.getArticlesByCategory(category || "", lang || 'it', 24), // Limite ridotto a 24 per performance
    enabled: !!category,
  });
  const { data: categoryInfo } = useQuery({
    queryKey: ["category", category, lang],
    queryFn: async () => {
      // TODO: Implement proper category fetching from Directus
      // For now, we get the category from the articles data
      const categories = await directusClient.getCategories(lang || 'it');
      const foundCategory = categories.find(cat => 
        cat.translations.some(t => t.slug_permalink === category)
      );
      
      // Always return a valid object, even if category is not found
      if (foundCategory) {
        return foundCategory;
      }
      
      // Create a fallback category with meaningful defaults
      const fallbackTitle = category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category';
      return {
        id: 0,
        nome_categoria: fallbackTitle,
        image: '',
        visible: true,
        translations: [{
          id: 0,
          languages_code: lang || 'it',
          nome_categoria: fallbackTitle,
          seo_title: fallbackTitle,
          seo_summary: `Discover articles about ${fallbackTitle.toLowerCase()}`,
          slug_permalink: category || ''
        }]
      };
    },
    enabled: !!category,
  });

  const categoryTranslation = categoryInfo?.translations?.[0];
  
  // Fallback values if category is not found
  const displayTitle = categoryTranslation?.nome_categoria || 
    (category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category');
  const displayDescription = categoryTranslation?.seo_summary || 
    `Discover articles about ${displayTitle.toLowerCase()}`;



  return (
    <div className="min-h-screen">
      {/* Mobile Header - Clean style without background image */}
      <div className="md:hidden">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {displayTitle}
          </h1>
          <p className="text-base text-gray-600 mb-4">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block relative h-64 sm:h-80 lg:h-[500px]">
        {/* Always show background, with image if available or gradient if not */}
        <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
          {categoryInfo?.image ? (
            <>
              <Image
                src={getOptimizedImageUrl(categoryInfo.image, 'HERO_DESKTOP')}
                alt={categoryTranslation?.nome_categoria || "Category image"}
                fill
                className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-lg sm:rounded-xl lg:rounded-2xl" />
          )}
        </div>
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">             
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tighter">
                {displayTitle}
              </h1>
              <p className="text-sm sm:text-base lg:text-2xl font-light text-white/90 mb-4 sm:mb-6 leading-relaxed">
                {displayDescription}
              </p>
            </div>
          </div>        
        </div>
      </div>

      {/* Breadcrumb - Desktop only */}
      <div className="hidden md:block">
        <Breadcrumb />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <ArticleGrid 
          articles={articles || []} 
          lang={lang || 'it'} 
          columns="3"
        />
      </div>
    </div>
  );
};

export default MagazineCategoryPage;