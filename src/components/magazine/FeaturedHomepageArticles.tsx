"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "../../lib/directus";
import Link from "next/link";
import Image from "next/image";

interface FeaturedHomepageArticlesProps {
  lang: string;
}

const FeaturedHomepageArticles: React.FC<FeaturedHomepageArticlesProps> = ({ lang }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query per gli articoli featured in homepage
  const { data: featuredData, isLoading: featuredLoading, error: featuredError } = useQuery({
    queryKey: ['featured-homepage-articles', lang],
    queryFn: () => directusClient.getArticles(lang, 0, 4, {}, 'homepage'), // Usa lo stesso metodo di LatestArticles
    enabled: !!lang,
  });

  // Fallback: se non ci sono articoli featured, usa gli ultimi articoli
  const { data: latestData, isLoading: latestLoading, error: latestError } = useQuery({
    queryKey: ['latest-articles-fallback', lang],
    queryFn: () => directusClient.getArticles(lang, 0, 4), // Ultimi 4 articoli
    enabled: !!lang && (!featuredData?.articles || featuredData?.articles?.length === 0),
  });

  const articles = (featuredData?.articles?.length || 0) > 0 ? featuredData?.articles : (latestData?.articles || []);
  const isLoading = featuredLoading || latestLoading;
  const error = featuredError || latestError;

  if (error) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          Featured articles not available at the moment.
        </p>
      </div>
    );
  }

  if (!isClient || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No featured articles available. Please check that articles have featured_status = 'homepage' and Italian translations.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {articles?.map((article: any) => {
        const translation = article.translations?.find(
          (t: any) => t.languages_code === lang
        );

        if (!translation) return null;

        const categoryTranslation = article.category_id?.translations?.find(
          (t: any) => t.languages_code === lang
        );

        return (
          <article key={article.id} className="group">
            <Link href={`/${lang}/magazine/${translation.slug_permalink}`}>
              <div className="relative overflow-hidden rounded-lg mb-4 aspect-[4/3]">
                {article.image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}?width=400&height=300&fit=cover`}
                    alt={translation.titolo_articolo}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">No Image</span>
                  </div>
                )}
                
                {/* Overlay con categoria */}
                {categoryTranslation && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {categoryTranslation.nome_categoria}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {translation.titolo_articolo}
                </h3>
                
                {translation.seo_summary && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {translation.seo_summary}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-500">
                  <time dateTime={article.date_created}>
                    {new Date(article.date_created).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
};

export default FeaturedHomepageArticles; 