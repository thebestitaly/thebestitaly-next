"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface EccellenzeListProps {
  lang: string;
  initialCompanies: any[];
  initialPageTranslations: any;
  initialPageTitles: any;
  className?: string;
}

const EccellenzeList: React.FC<EccellenzeListProps> = ({ 
  lang, 
  initialCompanies, 
  initialPageTranslations, 
  initialPageTitles,
  className 
}) => {
  // 🌍 Get translations or fallback to defaults
  const pageTitle = initialPageTitles?.title || initialPageTranslations?.title || 'Eccellenze Italiane';
  const pageSubtitle = initialPageTitles?.subtitle || initialPageTranslations?.subtitle || 'Scopri le migliori eccellenze italiane selezionate da TheBestItaly';
  const sectionTitle = initialPageTranslations?.companies_section || '';

  return (
    <div className={`max-w-7xl mx-auto ${className || ''}`}>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {pageTitle}
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          {pageSubtitle}
        </p>
      </div>

      {/* Companies Grid */}
      {initialCompanies && initialCompanies.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-10 text-center">{sectionTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialCompanies.map((company: any) => {
              const translation = company.translations?.[0];
              
              return (
                <Link
                  key={company.id}
                  href={`/${lang}/poi/${company.slug_permalink || translation?.slug_permalink}`}
                  className="block group transition-transform"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                    {company.featured_image ? (
                      <Image
                        src={getOptimizedImageUrl(company.featured_image, 'CARD')}
                        alt={company.company_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {company.company_name}
                    </h3>
                    {translation?.seo_summary && (
                      <p className="text-gray-600 leading-relaxed">
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