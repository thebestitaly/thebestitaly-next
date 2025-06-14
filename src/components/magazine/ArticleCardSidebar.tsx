"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/directus";

interface ArticleCardSidebarProps {
  article: Article;
  lang: string;
}

const ArticleCardSidebar: React.FC<ArticleCardSidebarProps> = ({ article, lang }) => {
  const translation = article.translations[0];

  // Only render if we have a valid slug
  if (!translation?.slug_permalink || !translation?.titolo_articolo) {
    return null;
  }

  return (
    <li>
      <Link
        href={`/${lang}/magazine/${translation.slug_permalink}/`}
        className="flex items-start space-x-4 group"
      >
        <div className="latest-blog-post w-full">
          {article.image && (
            <div className="aspect-video relative overflow-hidden">
              <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                  alt={translation.titolo_articolo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            </div>
          )}
          <div className="content pt-4 pb-2">
            {/* Category Badge */}
            {article.category_id && (
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {article.category_id.translations?.[0]?.nome_categoria}
                </span>
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
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
};

export default ArticleCardSidebar; 