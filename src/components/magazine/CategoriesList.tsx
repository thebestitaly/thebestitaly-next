"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { useSectionTranslations } from '@/hooks/useTranslations';
import { Category } from '@/lib/directus';

interface CategoriesListProps {
  lang: string;
  initialCategories: Category[];
}

const CategoriesList: React.FC<CategoriesListProps> = ({ lang, initialCategories: categories }) => {
  const { translations } = useSectionTranslations('categories', lang);

  if (!categories) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4 mb-8">
            <div className="h-8 bg-gray-200 w-1/3 mx-auto rounded"></div>
            <div className="h-4 bg-gray-200 w-2/3 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {translations?.title || 'Explore the Wonders of Italy'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl">
            {translations?.subtitle || 'From Art Cities to Untouched Nature: A Journey Through Italian Excellence'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {categories.map(category => {
            const translation = category.translations?.[0];
            if (!translation?.slug_permalink || !translation?.nome_categoria) return null;

            return (
              <Link 
                key={category.id}
                href={`/${lang}/magazine/c/${translation.slug_permalink}/`}
                className="group flex flex-col overflow-hidden rounded-lg transition-all duration-300"
              >
                <div className="relative aspect-w-16 aspect-h-12 overflow-hidden">
                  {category.image && (
                    <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                      <Image 
                        src={getOptimizedImageUrl(category.image, 'CARD')}
                        alt={translation.nome_categoria}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="pt-4 pb-2 flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {translation.nome_categoria}
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
      </div>
    </section>
  );
};

export default CategoriesList;