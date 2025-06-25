"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/directus";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

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
        className="flex items-start space-x-4 group mb-6"
      >
        {/* Foto quadrata con bordi arrotondati */}
        {article.image && (
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden">
              <Image
                src={getOptimizedImageUrl(article.image, 'THUMBNAIL')}
                alt={translation.titolo_articolo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>
          </div>
        )}
        
        {/* Titolo a destra */}
        <div className="flex-1 min-w-0">
          <h3 className="text-md text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {translation.titolo_articolo}
          </h3>
        </div>
      </Link>
    </li>
  );
};

export default ArticleCardSidebar; 