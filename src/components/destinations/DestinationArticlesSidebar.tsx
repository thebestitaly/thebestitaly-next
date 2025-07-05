"use client";
import React from 'react';
import ArticleCardSidebar from '../magazine/ArticleCardSidebar';
import { useTranslation } from '@/hooks/useTranslations';
import type { Article } from '@/lib/directus-web';

interface DestinationArticlesSidebarProps {
  lang: string;
  destinationId: string;
  articles: Article[];
}

const DestinationArticlesSidebar: React.FC<DestinationArticlesSidebarProps> = ({ 
  lang, 
  destinationId,
  articles
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const { translation: featuredArticlesText } = useTranslation('featured_articles', lang, 'general');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Ensure articles is always an array
  const articlesArray = Array.isArray(articles) ? articles : [];

  if (articlesArray.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          No articles available at the moment. Please check again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800">{featuredArticlesText}</h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
          📍 Articoli su questa destinazione
        </h4>
        <ul className="space-y-3">
          {articlesArray.map((article: any) => (
            <ArticleCardSidebar key={article.id} article={article} lang={lang} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DestinationArticlesSidebar; 