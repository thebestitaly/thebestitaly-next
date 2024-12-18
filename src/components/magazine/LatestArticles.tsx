"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import directusClient, { getTranslations } from '../../lib/directus';

const LatestArticles: React.FC<{ lang: string }> = ({ lang }) => {
  // Query per gli articoli
  const { data: articles, isLoading: articlesLoading, error: articlesError } = useQuery({
    queryKey: ['articles', lang],
    queryFn: () => directusClient.getArticles(lang, 50),
    select: (data) => data.filter(article => article.category_id !== 9).slice(0, 18),
    enabled: true
  });

  // Query per le traduzioni del menu
  const { data: menuTranslations } = useQuery({
    queryKey: ['translations', lang, 'menu'],
    queryFn: () => getTranslations(lang, 'menu'),
  });

  if (articlesLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 w-48 mx-auto mb-4 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 w-96 mx-auto rounded animate-pulse"></div>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (articlesError || !articles) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">
            Articles are temporarily unavailable. Please check again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-12">
      {/* Titoli della sezione */}
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {menuTranslations?.magazine || 'Magazine'}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl">
          {menuTranslations?.magazine_sub || 'The Magazine that tells the story of Italy through its hidden treasures'}
        </p>
      </div>

      {/* Grid degli articoli */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => {
          const translation = article.translations?.[0];
          if (!translation?.slug_permalink || !translation?.titolo_articolo) return null;

          return (
            <Link 
              href={`/${lang}/magazine/${translation.slug_permalink}/`}
              key={article.id}
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
    </section>
  );
};

export default LatestArticles;