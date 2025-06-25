"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/directus";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

interface ArticleCardProps {
  article: Article;
  lang: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, lang }) => {
  const translation = article.translations[0];

  // Only render if we have a valid slug
  if (!translation?.slug_permalink) {
    return null;
  }

  return (
    <Link
      href={`/${lang}/magazine/${translation.slug_permalink}/`}
      className="group"
    >
      <div className="overflow-hidden">
        {article.image && (
          <div className="relative w-full h-[250px] overflow-hidden rounded-lg">
            <Image
              src={getOptimizedImageUrl(article.image, 'HERO_MOBILE')}
              alt={translation?.titolo_articolo}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
                <div className="pt-4 pb-2">
          {/* Category Badge */}
          {article.category_id && (
            <div className="mb-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                {article.category_id.translations?.[0]?.nome_categoria || 'Categoria'}
              </span>
            </div>
          )}
          
          <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600">
            {translation?.titolo_articolo}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {translation?.seo_summary}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard; 