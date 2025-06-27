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
    queryKey: ['latest-articles-homepage', lang],
    queryFn: async () => {
      console.log('🔍 Fetching latest articles for lang:', lang);
      const response = await fetch(`/api/articles/latest?lang=${lang}`);
      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText);
        throw new Error('Failed to fetch articles');
      }
      const result = await response.json();
      console.log('✅ Latest articles API result:', result);
      console.log('📊 Articles data length:', result.data?.length);
      return result.data;
    },
    enabled: !!lang,
  });

  // Estrarre articoli dalla risposta
  const articles = articlesData || [];


  // Error State
  if (error) {
    console.error('❌ LatestArticles Error:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">
            No articles available at the moment. Please check again later.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Error: {error.message}
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