"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Company } from '@/lib/directus';

interface CompanyCardProps {
  company: {
    id: number;
    featured_image: string;
    company_name: string;  // Ora è qui nella collection principale
    slug_permalink: string;
    translations: Array<{
      languages_code: string;
      seo_title: string;
      seo_summary?: string;
    }>;
  };
  lang: string;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, lang }) => {
  const translation = company.translations.find(t => t.languages_code === lang);

  if (!translation) return null;

  return (
    <Link 
      href={`/${lang}/eccellenze/${company.slug_permalink}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    > 
      <div className="relative h-48 rounded-t-lg overflow-hidden">
        {company.featured_image && (
          <Image
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
            alt={company.company_name} // Usa company_name invece di translation.name
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
          {company.company_name} {/* Usa company_name dalla collection principale */}
        </h3>
        {translation.seo_title && (
          <p className="text-gray-600 line-clamp-3">
            {translation.seo_title}
          </p>
        )}
      </div>
    </Link>
  );
};

export default CompanyCard;