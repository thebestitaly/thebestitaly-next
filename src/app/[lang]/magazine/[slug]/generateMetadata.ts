// app/[lang]/magazine/[slug]/generateMetadata.ts
import { Metadata } from 'next';
import directusClient from '@/lib/directus';

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}): Promise<Metadata> {
  const article = await directusClient.getArticleBySlug(params.slug, params.lang);
  const translation = article?.translations[0];

  if (!translation) {
    return {
      title: 'Article Not Found',
    };
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": translation.titolo_articolo,
    "description": translation.seo_summary,
    "image": article.image ? 
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}` : 
      undefined
  };

  return {
    title: `${translation.titolo_articolo} | TheBestItaly`,
    description: translation.seo_summary,
    openGraph: {
      title: translation.titolo_articolo,
      description: translation.seo_summary,
      type: 'article',
      images: article.image ? 
        [`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`] : 
        [],
    },
    other: {
      'schema-org': JSON.stringify(articleSchema),
    }
  };
}