"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import directusClient from '../../lib/directus';

interface ArticlesSidebarProps {
  lang: string;
}

const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({ lang }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', lang],
    queryFn: () => directusClient.getArticles(lang),
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
        {data.articles.slice(0, 20).map((article) => {
          const translation = article.translations?.[0];
          if (!translation?.slug_permalink || !translation?.titolo_articolo) return null;

          return (
            <li key={article.id}>
              <Link
                href={`/${lang}/magazine/${translation.slug_permalink}/`}
                className="flex items-start space-x-4 group"
              >
                <div className="latest-blog-post w-full">
                  {article.image && (
                    <div className="aspect-video relative overflow-hidden">
                      <div className="relative w-full h-[200px]">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                          alt={translation.titolo_articolo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      </div>
                    </div>
                  )}
                  <div className="content">
                    <h3 className="text-xl font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {translation.titolo_articolo}
                    </h3>
                    {translation.seo_summary && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {translation.seo_summary}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ArticlesSidebar;