"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "../../lib/directus";
import ArticleGrid from "./ArticleGrid";

interface LatestArticlesProps {
  lang: string;
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ lang }) => {
  const [isClient, setIsClient] = useState(false);

  // Assicuriamoci che il componente funzioni lato client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query per gli articoli (escludi featured e category_id = 9)
  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['latest-articles-filtered', lang, 18],
    queryFn: () => directusClient.getArticles(lang, 0, 18, {
      featured_status: { _neq: 'homepage' }, // Escludi featured
      category_id: { _neq: 9 } // Escludi category_id = 9
    }),
    enabled: !!lang,
  });

  // Estrarre articoli dalla risposta
  const articles = articlesData?.articles || [];

  // Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">
            No articles available at the moment. Please check again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ArticleGrid 
      articles={articles} 
      lang={lang} 
      loading={!isClient || isLoading}
      columns="3"
    />
  );
};

export default LatestArticles;