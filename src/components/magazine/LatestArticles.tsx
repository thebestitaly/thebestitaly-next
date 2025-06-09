"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import directusClient from "../../lib/directus";

interface LatestArticlesProps {
  lang: string;
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ lang }) => {
  const [isClient, setIsClient] = useState(false);

  // Assicuriamoci che il componente funzioni lato client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query per gli articoli
  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['articles', lang, 18],
    queryFn: () => directusClient.getArticles(lang, 0, 18), // Passa offset=0, limit=18
    enabled: !!lang,
  });

  // Estrarre articoli dalla risposta
  const articles = articlesData?.articles || [];

  // Loading State
  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error || articles.length === 0) {
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

  // Render degli articoli
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => {
        const translation = article.translations?.[0];
        if (!translation?.slug_permalink || !translation?.titolo_articolo) return null;

        return (
          <Link
            key={article.id}
            href={`/${lang}/magazine/${translation.slug_permalink}/`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {article.image && (
              <div className="aspect-video relative overflow-hidden">
                <div className="relative w-full h-[200px]">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                    alt={translation.titolo_articolo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">
                {translation.titolo_articolo}
              </h3>
              {translation.seo_summary && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {translation.seo_summary}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default LatestArticles;