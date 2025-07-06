"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { singletonCache, CACHE_KEYS, CACHE_TTL } from "@/lib/singleton-cache";

import ArticleGrid from "./ArticleGrid";

interface MagazineCategoryPageProps {
  lang?: string;
  category?: string;
}

interface CategoryData {
  id: string;
  nome_categoria: string;
  image: string;
  visible: boolean;
  translations: {
    id: string;
    languages_code: string;
    nome_categoria: string;
    seo_title: string;
    seo_summary: string;
    slug_permalink: string;
  }[];
}

// 🚨 EMERGENCY SINGLETON CACHE - Load data ONCE and share across all components
const MagazineCategoryPage: React.FC<MagazineCategoryPageProps> = ({ lang, category }) => {
  const params = useParams();
  const currentLang = lang || (params?.lang as string) || 'it';
  const currentCategory = category || (params?.category as string);

  const [categoryInfo, setCategoryInfo] = React.useState<CategoryData | null>(null);
  const [articles, setArticles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 🚨 STABLE CACHE KEYS - Generate once and never change
  const categoryInfoCacheKey = React.useMemo(() => 
    CACHE_KEYS.CATEGORY_INFO(currentCategory, currentLang), 
    [currentCategory, currentLang]
  );

  const articlesKey = React.useMemo(() => 
    CACHE_KEYS.CATEGORY_ARTICLES(currentCategory, currentLang), 
    [currentCategory, currentLang]
  );

  // 🚨 LOAD DATA ONCE - Using singleton cache
  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!currentCategory) return;

      try {
        setLoading(true);
        setError(null);

        // 🔍 LOAD CATEGORY INFO via Proxy (client-side CORS fix)
        const categoryData = await singletonCache.get(
          categoryInfoCacheKey,
          async () => {
            // 🔍 DEBUG: Log per debugging
            console.log(`🔍 [DEBUG] Searching for category: ${currentCategory} in lang: ${currentLang}`);
            
            // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
            const params = new URLSearchParams();
            params.append('filter[translations][slug_permalink][_eq]', currentCategory);
            params.append('filter[visible][_eq]', 'true');
            params.append('fields[]', 'id');
            params.append('fields[]', 'nome_categoria');
            params.append('fields[]', 'image');
            params.append('fields[]', 'visible');
            params.append('fields[]', 'translations.*');
            params.append('limit', '1');

            const response = await fetch(`/api/directus/items/categorias?${params}`);
            if (!response.ok) {
              throw new Error(`Category query failed: ${response.status}`);
            }

            const data = await response.json();
            const categoryResult = data?.data?.[0] || null;
            console.log(`🔍 [DEBUG] Found category (proxy):`, categoryResult);
            return categoryResult;
          },
          CACHE_TTL.CATEGORIES // 1 hour cache
        );

        // 🚨 LOAD ARTICLES via Proxy (client-side CORS fix)
        const articlesData = await singletonCache.get(
          articlesKey,
          async () => {
            if (!categoryData?.id) return [];

            console.log(`🔍 [DEBUG] Loading articles for category ID: ${categoryData.id}`);
            
            // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
            const params = new URLSearchParams();
            params.append('filter[status][_eq]', 'published');
            params.append('filter[category_id][_eq]', String(categoryData.id));
            params.append('fields[]', 'id');
            params.append('fields[]', 'image');
            params.append('fields[]', 'date_created');
            params.append('fields[]', 'translations.titolo_articolo');
            params.append('fields[]', 'translations.slug_permalink');
            params.append('fields[]', 'translations.seo_summary');
            params.append('deep[translations][_filter][languages_code][_eq]', currentLang);
            params.append('sort[]', '-date_created');
            params.append('limit', '24');

            const response = await fetch(`/api/directus/items/articles?${params}`);
            if (!response.ok) {
              throw new Error(`Articles query failed: ${response.status}`);
            }

            const data = await response.json();
            const articles = data?.data || [];
            console.log(`🔍 [DEBUG] Found ${articles.length} articles (proxy)`);
            return articles;
          },
          CACHE_TTL.ARTICLES // 30 minutes cache
        );

        if (mounted) {
          setCategoryInfo(categoryData);
          setArticles(articlesData);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [categoryInfoCacheKey, articlesKey, currentCategory, currentLang]);

  // 🚨 RENDER WITHOUT QUERIES
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Errore nel caricamento</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!categoryInfo) {
    // 🔍 DEBUG: More info when category not found
    console.log(`❌ [DEBUG] Category '${currentCategory}' not found for lang '${currentLang}'`);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 font-semibold mb-2">Categoria non trovata</h2>
          <p className="text-yellow-600 mb-4">
            La categoria <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">"{currentCategory}"</code> non è disponibile per la lingua <strong>{currentLang}</strong>.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-100 rounded text-sm">
              <strong>Debug Info:</strong>
              <br />• Category Slug: {currentCategory}
              <br />• Language: {currentLang}
              <br />• Check console for query details
            </div>
          )}
        </div>
      </div>
    );
  }

  const translation = categoryInfo.translations?.[0];
  const categoryName = translation?.nome_categoria || categoryInfo.nome_categoria;
  const seoTitle = translation?.seo_title || categoryName;
  const seoSummary = translation?.seo_summary || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {seoTitle}
            </h1>
            {seoSummary && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {seoSummary}
              </p>
            )}
          </div>
          
          {categoryInfo.image && (
            <div className="flex-shrink-0">
              <Image
                src={getOptimizedImageUrl(categoryInfo.image)}
                alt={categoryName}
                width={200}
                height={150}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Articoli di {categoryName}
        </h2>
        {articles.length > 0 && (
          <p className="text-gray-600">
            {articles.length} articoli trovati
          </p>
        )}
      </div>
      
      <ArticleGrid 
        articles={articles} 
        lang={currentLang} 
      />
    </div>
  );
};

export default MagazineCategoryPage;