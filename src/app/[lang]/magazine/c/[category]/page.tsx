// src/app/[lang]/magazine/c/[category]/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import directusClient from '@/lib/directus';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import MagazineCategoryPageClient from './MagazineCategoryPageClient';

interface PageProps {
  params: Promise<{ lang: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, category } = await params;
  
  let pageTitle = 'Category';
  let pageDescription = 'Scopri gli articoli di questa categoria.';

  try {
    // Get categories and find the one matching the slug
    const categories = await directusClient.getCategories(lang);
    const categoryInfo = categories.find(cat => 
      cat.translations.some(t => t.slug_permalink === category)
    );
    
    const translation = categoryInfo?.translations?.[0];
    if (translation) {
      pageTitle = translation.seo_title || translation.nome_categoria || pageTitle;
      pageDescription = translation.seo_summary || pageDescription;
    }
  } catch (error) {
    console.warn('Could not fetch category data from database, using defaults:', error);
  }
  
  // Generate proper canonical URL for magazine category page
  const canonicalUrl = generateCanonicalUrl(lang, ['magazine', 'c', category]);

  return generateSEO({
    title: `${pageTitle} | TheBestItaly`,
    description: pageDescription,
    type: 'website',
    canonicalUrl,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { lang, category } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagazineCategoryPageClient lang={lang} category={category} />
    </Suspense>
  );
}