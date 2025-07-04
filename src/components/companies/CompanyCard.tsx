"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface CompanyCardProps {
  company: any;
  lang: string;
  className?: string;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, lang, className }) => {
  const translation = company.translations?.[0];
  
  return (
    <Link
      href={`/${lang}/poi/${company.slug_permalink || translation?.slug_permalink}`}
      className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${className || ''}`}
    >
      <div className="relative aspect-video rounded-t-lg overflow-hidden">
        {company.featured_image ? (
          <Image
            src={getOptimizedImageUrl(company.featured_image, 'CARD')}
            alt={company.company_name}
            fill
            className="object-cover"
            unoptimized={true}
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
        
        {/* Additional info */}
        <div className="mt-2 flex items-center justify-between">
          {company.category_id && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {company.category_id.translations?.[0]?.nome_categoria || 'Categoria'}
            </span>
          )}
          {company.featured && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard; 