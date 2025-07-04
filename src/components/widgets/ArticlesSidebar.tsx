"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ArticleCardSidebar from '../magazine/ArticleCardSidebar';

interface ArticlesSidebarProps {
  lang: string;
  currentArticleId?: string;
  categoryId?: string;
}

const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({ lang, currentArticleId, categoryId }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Query con React Query caching per articoli sidebar
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', lang, 'sidebar', categoryId, currentArticleId],
    queryFn: async () => {
      // Usa il proxy Directus invece della chiamata diretta
      const params = new URLSearchParams();
      params.append('filter[status][_eq]', 'published');
      
      // Escludi categoria 9 (sempre)
      params.append('filter[category_id][_neq]', '9');

      // Se abbiamo un articolo corrente, escludilo
      if (currentArticleId) {
        params.append('filter[id][_neq]', currentArticleId);
      }

      // Se abbiamo una categoria, mostra articoli correlati della stessa categoria
      if (categoryId) {
        params.append('filter[category_id][_eq]', categoryId);
      }

      // Campi necessari
      params.append('fields[]', 'id');
      params.append('fields[]', 'image');
      params.append('fields[]', 'date_created');
      params.append('fields[]', 'translations.titolo_articolo');
      params.append('fields[]', 'translations.slug_permalink');
      params.append('fields[]', 'translations.seo_summary');
      params.append('deep[translations][_filter][languages_code][_eq]', lang);
      params.append('sort[]', '-date_created');
      params.append('limit', '8'); // RIDOTTO: solo 8 articoli invece di 20

      const response = await fetch(`/api/directus/items/articles?${params}`);
      const result = await response.json();
      
      return {
        articles: result.data || []
      };
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 30, // 30 minuti
  });

  if (!isClient || isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.articles || data.articles.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          No articles available at the moment. Please check again later.
        </p>
      </div>
    );
  }

  const getTitle = () => {
    if (categoryId && data?.articles.length > 0) {
      return "Articoli Correlati";
    }
    return "Articoli Recenti";
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800">{getTitle()}</h3>
      <ul className="space-y-4">
        {data.articles.map((article: any) => (
          <ArticleCardSidebar key={article.id} article={article} lang={lang} />
        ))}
      </ul>
    </div>
  );
};

export default ArticlesSidebar;