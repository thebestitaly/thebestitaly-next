"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Image from "next/image";
import { Category } from "@/lib/directus-web";

interface MagazinePageClientProps {
  lang: string;
}

const MagazinePageClient: React.FC<MagazinePageClientProps> = ({ lang }) => {
  // Query per ottenere le traduzioni del magazine (categoria 10) - USA PROXY
  const { data: magazineData } = useQuery({
    queryKey: ["category", 10, lang],
    queryFn: async () => {
      // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
      const params = new URLSearchParams();
      params.append('filter[id][_eq]', '10');
      params.append('fields[]', '*');
      params.append('fields[]', 'translations.*');
      params.append(`deep[translations][_filter][languages_code][_eq]`, lang);
      
      const response = await fetch(`/api/directus/items/categorias?${params}`);
      const result = await response.json();
      return result.data?.[0];
    },
  });

  // Query per ottenere le categorie - USA PROXY
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories", lang],
    queryFn: async () => {
      // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
      const params = new URLSearchParams();
      // Filtro per categorie visibili E escludo la categoria 10 (Magazine)
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
      params.append(`deep[translations][_filter][languages_code][_eq]`, lang);
      
      const response = await fetch(`/api/directus/items/categorias?${params}`);
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 1800000, // 🚨 FIXED: 30 minuti invece di 0!
    gcTime: 3600000, // 🚨 FIXED: 1 ora garbage collection
    refetchOnWindowFocus: false, // 🚨 FIXED: No refetch on focus
    refetchOnMount: false, // 🚨 FIXED: No refetch on mount
    refetchOnReconnect: false, // 🚨 FIXED: No refetch on reconnect
    retry: 1, // 🚨 FIXED: Ridotto retry per evitare traffico
  });

  const { data: articlesByCategory } = useQuery({
    queryKey: ["articlesByCategory", lang], // 🚨 FIXED: No Date.now()!
    queryFn: async () => {
      const allArticles: Record<string, any> = {};
      if (categories) {
        for (const category of categories) {
          // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
          const categoryId = category.id;
          if (categoryId) {
            try {
              const params = new URLSearchParams();
              params.append('filter[status][_eq]', 'published');
              params.append('filter[category_id][_eq]', categoryId.toString());
              params.append('fields[]', 'id');
              params.append('fields[]', 'image');
              params.append('fields[]', 'date_created');
              params.append('fields[]', 'translations.titolo_articolo');
              params.append('fields[]', 'translations.slug_permalink');
              params.append('fields[]', 'translations.seo_summary');
              params.append(`deep[translations][_filter][languages_code][_eq]`, lang);
              params.append('sort[]', '-date_created');
              params.append('limit', '9');
              
              const response = await fetch(`/api/directus/items/articles?${params}`);
              const result = await response.json();
              allArticles[category.id] = result.data || [];
            } catch (error) {
              console.error(`Error fetching articles for category ${categoryId}:`, error);
              allArticles[category.id] = [];
            }
          }
        }
      }
      return allArticles;
    },
    enabled: !!categories,
    staleTime: 1800000, // 🚨 FIXED: 30 minuti invece di 0!
    gcTime: 3600000, // 🚨 FIXED: 1 ora garbage collection
    refetchOnWindowFocus: false, // 🚨 FIXED: No refetch on focus
    refetchOnMount: false, // 🚨 FIXED: No refetch on mount
    refetchOnReconnect: false, // 🚨 FIXED: No refetch on reconnect
    retry: 1, // 🚨 FIXED: Ridotto retry per evitare traffico
  });

  const magazineTranslation = magazineData?.translations?.[0];

  return (
    <div className="min-h-screen">
      {/* Mobile Header - Studenti.it style */}
      <div className="md:hidden">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {magazineTranslation?.nome_categoria || "Magazine"}
          </h1>
          {magazineTranslation?.seo_summary && (
            <p className="text-base text-gray-600 mb-4">
              {magazineTranslation.seo_summary}
            </p>
          )}
          
          {/* Hero Image - Mobile */}
          <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl">
            <Image
              src="/images/magazine.webp"
              alt={magazineTranslation?.seo_title || "Magazine"}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          
          {/* TOC - Table of Contents */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categorie disponibili:</h3>
            <ul className="space-y-2 text-sm">
              {categories?.map((category) => {
                const translation = category.translations[0];
                return (
                  <li key={category.id}>
                    <a href={`#category-${category.id}`} className="text-blue-600 hover:text-blue-800">
                      • {translation?.nome_categoria}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block relative h-64 sm:h-80 lg:h-[500px]">
        <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
          <Image
            src="/images/magazine.webp"
            alt={magazineTranslation?.seo_title || "Magazine"}
            fill
            className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
          
        </div>
        <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">
              <div className="max-w-4xl">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight mb-2 sm:mb-3 lg:mb-4">
                {magazineTranslation?.nome_categoria || "Magazine"}
              </h1>
              {magazineTranslation?.seo_summary && (
                <p className="text-sm sm:text-base lg:text-2xl font-light text-white/90 mb-4 sm:mb-6 leading-relaxed">
                  {magazineTranslation.seo_summary}
                </p>
              )}
            </div>
          </div>        
        </div>
      </div>

      {/* Breadcrumb - Desktop only */}
      <div className="hidden md:block">
        <Breadcrumb />
      </div>

      {/* Categories and Articles */}
      <div className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          {categories?.map((category) => {
            const translation = category.translations[0];
            const categoryArticles = articlesByCategory?.[category.id] || [];

            return (
              <section key={category.id} id={`category-${category.id}`} className="mb-12 md:mb-20">
                {/* Category Header */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    {translation?.nome_categoria}
                  </h2>
                  {translation?.seo_summary && (
                    <p className="text-gray-600 text-base md:text-lg mb-4">
                      {translation.seo_summary}
                    </p>
                  )}
                </div>

                {/* Articles Grid */}
                {categoryArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {categoryArticles.map((article: any) => {
                      const articleTranslation = article.translations?.[0];
                      const categorySlug = translation?.slug_permalink;
                      
                      return (
                        <Link
                          key={article.id}
                          href={`/${lang}/magazine/${articleTranslation?.slug_permalink}`}
                          className="group block overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="aspect-[16/9] relative overflow-hidden">
                            <Image
                              src={getOptimizedImageUrl(article.image, 'CARD')}
                              alt={articleTranslation?.titolo_articolo || "Article"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <div className="p-4 md:p-6">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {articleTranslation?.titolo_articolo}
                            </h3>
                            {articleTranslation?.seo_summary && (
                              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                {articleTranslation.seo_summary}
                              </p>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(article.date_created).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nessun articolo disponibile per questa categoria.</p>
                  </div>
                )}

                {/* See More Link */}
                {categoryArticles.length > 0 && (
                  <div className="mt-8 text-center">
                    <Link
                      href={`/${lang}/magazine/c/${translation?.slug_permalink}`}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Vedi tutti gli articoli di {translation?.nome_categoria}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MagazinePageClient; 