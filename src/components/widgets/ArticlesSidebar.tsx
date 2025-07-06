"use client";
import React from 'react';
import ArticleCardSidebar from '../magazine/ArticleCardSidebar';
import { useQuery } from '@tanstack/react-query';
import { Article } from '@/lib/directus-web';

interface ArticlesSidebarProps {
  lang: string;
  currentArticleId?: string | number;
  categoryId?: string | number;
}

// 🚨 EMERGENCY SINGLETON CACHE - Load data ONCE and share across all components
const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({ lang, currentArticleId, categoryId }) => {
  
  // 🚨 EMERGENCY: SOLO REACT QUERY - NO SINGLETON CACHE!
  const { data: sidebarData, isLoading, error } = useQuery<Article[]>({
    queryKey: ["sidebar-articles", lang, categoryId, currentArticleId],
    queryFn: async () => {
      // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
      const params = new URLSearchParams();
      params.append('filter[status][_eq]', 'published');
      
      if (categoryId && categoryId !== 9) {
        // Se abbiamo una categoria e non è Magazine, mostra articoli della stessa categoria
        params.append('filter[category_id][_eq]', categoryId.toString());
      } else {
        // Se non abbiamo categoria o è Magazine, escludi solo Magazine
        params.append('filter[category_id][_neq]', '9');
      }
      
      if (currentArticleId) {
        params.append('filter[id][_neq]', currentArticleId.toString());
      }
      
      params.append('fields[]', 'id');
      params.append('fields[]', 'image');
      params.append('fields[]', 'date_created');
      params.append('fields[]', 'translations.titolo_articolo');
      params.append('fields[]', 'translations.slug_permalink');
      params.append('fields[]', 'translations.seo_summary');
      params.append(`deep[translations][_filter][languages_code][_eq]`, lang);
      params.append('sort[]', '-date_created');
      params.append('limit', '8');
      
      const response = await fetch(`/api/directus/items/articles?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 180000, // 🚨 REDUCED: 3 minutes instead of 1 hour
    gcTime: 360000, // 🚨 REDUCED: 6 minutes instead of 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  // 🚨 RENDER WITHOUT QUERIES
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Caricamento articoli...
        </h2>
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="w-full h-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Errore nel caricamento
        </h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!sidebarData || sidebarData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Nessun articolo trovato
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Articoli Consigliati
      </h2>
      <div className="space-y-4">
        {sidebarData.map((article) => {
          const translation = article.translations?.[0];
          if (!translation) return null;
          
          return (
            <ArticleCardSidebar
              key={article.id}
              article={article}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ArticlesSidebar;