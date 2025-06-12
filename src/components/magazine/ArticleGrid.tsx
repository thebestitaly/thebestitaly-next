"use client";

import React from "react";
import { Article } from "@/lib/directus";
import ArticleCard from "./ArticleCard";

interface ArticleGridProps {
  articles: Article[];
  lang: string;
  loading?: boolean;
  columns?: "2" | "3" | "4";
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ 
  articles, 
  lang, 
  loading = false, 
  columns = "3" 
}) => {
  // Loading State
  if (loading) {
    const gridCols = columns === "2" ? "md:grid-cols-2" : 
                    columns === "3" ? "md:grid-cols-2 lg:grid-cols-3" : 
                    "md:grid-cols-2 lg:grid-cols-4";
    
    return (
      <div className={`grid grid-cols-1 ${gridCols} gap-12`}>
        {Array.from({ length: parseInt(columns) * 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-[250px] rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-900">No articles available at the moment.</p>
      </div>
    );
  }

  const gridCols = columns === "2" ? "md:grid-cols-2" : 
                  columns === "3" ? "md:grid-cols-2 lg:grid-cols-3" : 
                  "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-12`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} lang={lang} />
      ))}
    </div>
  );
};

export default ArticleGrid; 