"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
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
    queryKey: ["articles", category, lang, Date.now()],
    queryFn: async () => {
      // Usa il proxy Directus invece della chiamata diretta
      const categoryParams = new URLSearchParams();
      categoryParams.append('filter[translations][slug_permalink][_eq]', category || '');
      categoryParams.append('fields[]', 'id');
      categoryParams.append('limit', '1');

      const categoryResponse = await fetch(`/api/directus/items/categorias?${categoryParams}`);
      const categoryResult = await categoryResponse.json();
      
      if (!categoryResult.data || categoryResult.data.length === 0) {
        return [];
      }

      const categoryId = categoryResult.data[0].id;
      
      // Ora cerca gli articoli per questa categoria
      const articlesParams = new URLSearchParams();
      articlesParams.append('filter[status][_eq]', 'published');
      articlesParams.append('filter[category_id][_eq]', categoryId.toString());
      articlesParams.append('fields[]', 'id');
      articlesParams.append('fields[]', 'image');
      articlesParams.append('fields[]', 'date_created');
      articlesParams.append('fields[]', 'translations.titolo_articolo');
      articlesParams.append('fields[]', 'translations.slug_permalink');
      articlesParams.append('fields[]', 'translations.seo_summary');
      articlesParams.append('deep[translations][_filter][languages_code][_eq]', lang || 'it');
      articlesParams.append('sort[]', '-date_created');
      articlesParams.append('limit', '24');

      const articlesResponse = await fetch(`/api/directus/items/articles?${articlesParams}`);
      const articlesResult = await articlesResponse.json();
      
      return articlesResult.data || [];
    },
    enabled: !!category,
    staleTime: 0,
    cacheTime: 1000 * 60 * 2,
  });

  const { data: categoryInfo } = useQuery({
    queryKey: ["category", category, lang, Date.now()],
    queryFn: async () => {
      // Usa il proxy Directus per ottenere le categorie
      const params = new URLSearchParams();
      params.append('filter[visible][_eq]', 'true');
      params.append('filter[id][_nin]', '10'); // Escludo la categoria Magazine
      params.append('fields[]', 'id');
      params.append('fields[]', 'nome_categoria');
      params.append('fields[]', 'image');
      params.append('fields[]', 'visible');
      params.append('fields[]', 'translations.nome_categoria');
      params.append('fields[]', 'translations.seo_title');
      params.append('fields[]', 'translations.seo_summary');
      params.append('fields[]', 'translations.slug_permalink');
      params.append('deep[translations][_filter][languages_code][_eq]', lang || 'it');

      const response = await fetch(`/api/directus/items/categorias?${params}`);
      const result = await response.json();
      
      const categories = result.data || [];
      const foundCategory = categories.find((cat: any) => 
        cat.translations.some((t: any) => t.slug_permalink === category)
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
                unoptimized={true}
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