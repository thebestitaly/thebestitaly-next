"use client";

import React from 'react';
import MagazineCategoryPage from '@/components/magazine/MagazineCategoryPage';

interface MagazineCategoryPageClientProps {
  lang: string;
  category: string;
}

const MagazineCategoryPageClient: React.FC<MagazineCategoryPageClientProps> = ({ lang, category }) => {
  return <MagazineCategoryPage lang={lang} category={category} />;
};

export default MagazineCategoryPageClient; 