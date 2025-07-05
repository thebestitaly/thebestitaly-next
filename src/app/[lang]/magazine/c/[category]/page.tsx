// src/app/[lang]/magazine/c/[category]/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import directusWebClient from '@/lib/directus-web';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import MagazineCategoryPageClient from './MagazineCategoryPageClient';

interface PageProps {
  params: Promise<{ lang: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, category } = await params;
  
  // Create meaningful fallbacks based on category slug
  const categoryName = category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category';
  let pageTitle = categoryName;
  let pageDescription = `Discover articles about ${categoryName.toLowerCase()} in Italy. Read our latest travel guides, tips and insights about Italian destinations and experiences.`;

  try {
    // Get categories and find the one matching the slug
    const categories = await directusWebClient.getCategories(lang);
    const categoryInfo = categories.find((cat: any) => 
      cat.translations.some((t: any) => t.slug_permalink === category)
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