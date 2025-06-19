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
        <div className="w-full mb-8">
          {article.image && (
            <div className="aspect-video relative overflow-hidden">
              <div className="relative w-full h-[200px] rounded-xl overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                  alt={translation.titolo_articolo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              </div>
            </div>
          )}
          <div className="content pb-2">
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