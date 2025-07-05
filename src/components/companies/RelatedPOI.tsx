"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface RelatedPOIProps {
  companies?: any[];
  lang: string;
  currentCompanyId?: string;
  destinationId?: string;
  className?: string;
}

const RelatedPOI: React.FC<RelatedPOIProps> = ({ companies, lang, currentCompanyId, destinationId, className }) => {
  // For now, just return null if no companies are provided
  // In a full implementation, we could fetch companies based on destinationId
  if (!companies || companies.length === 0) return null;

  // Filter out current company
  const filteredCompanies = companies.filter(company => company.id !== currentCompanyId);

  if (filteredCompanies.length === 0) return null;

  return (
    <div className={`${className || ''}`}>
      <h3 className="text-xl font-bold mb-4">POI Correlati</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.slice(0, 6).map((company: any) => {
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
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 line-clamp-1">
                  {company.company_name}
                </h4>
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
  );
};

export default RelatedPOI; 