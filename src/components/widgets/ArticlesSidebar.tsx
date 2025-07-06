"use client";
import React from 'react';
import ArticleCardSidebar from '../magazine/ArticleCardSidebar';
import { singletonCache, CACHE_KEYS, CACHE_TTL } from '@/lib/singleton-cache';

interface ArticlesSidebarProps {
  lang: string;
  currentArticleId?: string | number;
  categoryId?: string | number;
}

// 🚨 EMERGENCY SINGLETON CACHE - Load data ONCE and share across all components
const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({ lang, currentArticleId, categoryId }) => {
  const [articles, setArticles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 🚨 STABILIZE IDS - Convert to strings only once
  const stableCurrentArticleId = React.useMemo(() => 
    currentArticleId ? String(currentArticleId) : undefined, 
    [currentArticleId]
  );

  const stableCategoryId = React.useMemo(() => 
    categoryId ? String(categoryId) : undefined, 
    [categoryId]
  );

  // 🚨 STABLE CACHE KEY - Generate once and never change
  const cacheKey = React.useMemo(() => 
    CACHE_KEYS.ARTICLES_SIDEBAR(lang, stableCategoryId, stableCurrentArticleId), 
    [lang, stableCategoryId, stableCurrentArticleId]
  );

  // 🚨 LOAD DATA ONCE - Using singleton cache
  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await singletonCache.get(
          cacheKey,
          async () => {
            // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
            const params = new URLSearchParams();
            params.append('filter[status][_eq]', 'published');
            
            // 🚨 ALWAYS EXCLUDE MAGAZINE CATEGORY (ID 9)
            params.append('filter[category_id][_neq]', '9');
            
            // 🚨 INCLUDE ARTICLES FROM SAME CATEGORY (not exclude!)
            if (stableCategoryId && stableCategoryId !== '9') {
              params.append('filter[category_id][_eq]', stableCategoryId);
            }
            
            // 🚨 EXCLUDE CURRENT ARTICLE
            if (stableCurrentArticleId) {
              params.append('filter[id][_neq]', stableCurrentArticleId);
            }

            params.append('fields[]', 'id');
            params.append('fields[]', 'image');
            params.append('fields[]', 'date_created');
            params.append('fields[]', 'translations.titolo_articolo');
            params.append('fields[]', 'translations.slug_permalink');
            params.append('fields[]', 'translations.seo_summary');
            params.append('deep[translations][_filter][languages_code][_eq]', lang);
            params.append('sort[]', '-date_created');
            params.append('limit', '8');

            const response = await fetch(`/api/directus/items/articles?${params}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data?.data || [];
          },
          CACHE_TTL.SIDEBAR // 2 hours cache
        );

        if (mounted) {
          setArticles(result);
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
  }, [cacheKey, lang, stableCategoryId, stableCurrentArticleId]);

  // 🚨 RENDER WITHOUT QUERIES
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Articoli Correlati</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Articoli Correlati</h3>
        <p className="text-red-600 text-sm">Errore nel caricamento: {error}</p>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Articoli Correlati</h3>
        <p className="text-gray-600 text-sm">Nessun articolo correlato disponibile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Articoli Correlati</h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCardSidebar
            key={article.id}
            article={article}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
};

export default ArticlesSidebar;