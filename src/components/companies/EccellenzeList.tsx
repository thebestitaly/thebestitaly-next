"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface EccellenzeListProps {
  lang: string;
  initialCompanies: any[];
  initialCategories: any[];
  initialPageTranslations: any;
  initialPageTitles: any;
  className?: string;
}

const EccellenzeList: React.FC<EccellenzeListProps> = ({ 
  lang, 
  initialCompanies, 
  initialCategories, 
  initialPageTranslations, 
  initialPageTitles,
  className 
}) => {
  return (
    <div className={`${className || ''}`}>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Eccellenze Italiane
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scopri le migliori eccellenze italiane selezionate da TheBestItaly
        </p>
      </div>

      {/* Categories Grid */}
      {initialCategories && initialCategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Categorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialCategories.map((category: any) => {
              const translation = category.translations?.[0];
              if (!translation?.slug_permalink) return null;

              return (
                <Link
                  key={category.id}
                  href={`/${lang}/poi/categories/${translation.slug_permalink}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
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
            })}
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {initialCompanies && initialCompanies.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Eccellenze</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialCompanies.map((company: any) => {
              const translation = company.translations?.[0];
              
              return (
                <Link
                  key={company.id}
                  href={`/${lang}/poi/${company.slug_permalink || translation?.slug_permalink}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video rounded-t-lg overflow-hidden">
                    {company.featured_image ? (
                      <Image
                        src={getOptimizedImageUrl(company.featured_image, 'CARD')}
                        alt={company.company_name}
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
                      {company.company_name}
                    </h3>
                    {translation?.seo_summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {translation.seo_summary}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EccellenzeList; 