"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface CategoryCardProps {
  category: any;
  lang: string;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, lang, className }) => {
  const translation = category.translations?.[0];
  
  if (!translation?.slug_permalink) return null;

  return (
    <Link
      href={`/${lang}/poi/categories/${translation.slug_permalink}`}
      className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${className || ''}`}
    >
      <div className="relative aspect-video rounded-t-lg overflow-hidden">
        {category.image ? (
          <Image
            src={getOptimizedImageUrl(category.image, 'CARD')}
            alt={translation.nome_categoria}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">
          {translation.nome_categoria}
        </h3>
        {translation.seo_summary && (
          <p className="text-sm text-gray-600 mt-1">
            {translation.seo_summary}
          </p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard; 