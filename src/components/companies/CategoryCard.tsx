"use client";

import React from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  category: {
    id: number;
    company_name: string; // Ora è nella collection principale
    translations: Array<{
      languages_code: string;
      slug_permalink: string;
      description?: string;
    }>;
  };
  lang: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, lang }) => {
  const translation = category.translations.find(t => t.languages_code === lang);

  if (!translation) return null;

  return (
    <Link 
      href={`/${lang}/companies/categories/${translation.slug_permalink}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <h3 className="text-xl font-semibold mb-2">
        {category.company_name} {/* Accediamo direttamente al company_name dalla category */}
      </h3>
      {translation.description && (
        <p className="text-gray-600 line-clamp-3">
          {translation.description}
        </p>
      )}
    </Link>
  );
};

export default CategoryCard;