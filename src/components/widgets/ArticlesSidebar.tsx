"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import directusClient from '../../lib/directus';
import ArticleCardSidebar from '../magazine/ArticleCardSidebar';

interface ArticlesSidebarProps {
  lang: string;
}

const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({ lang }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', lang, 'sidebar'],
    queryFn: () => directusClient.getArticles(
      lang, 
      0, // offset
      20, // limit
      {
        // Escludi categoria 9
        category_id: { _neq: 9 }
      }
    ),
    enabled: isClient,
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

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800">Latest Articles</h3>
      <ul className="space-y-4">
        {data.articles.map((article) => (
          <ArticleCardSidebar key={article.id} article={article} lang={lang} />
        ))}
      </ul>
    </div>
  );
};

export default ArticlesSidebar;