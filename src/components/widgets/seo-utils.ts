// Non è un Client Component
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  canonicalUrl?: string;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author?: string;
    category?: string;
  };
  schema?: object;
}

// Helper function to generate canonical URLs consistently
export function generateCanonicalUrl(lang: string, path?: string[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.it';
  
  if (!path || path.length === 0) {
    return `${baseUrl}/${lang}`;
  }
  
  const cleanPath = path.filter(segment => segment && segment.trim() !== '').join('/');
  return `${baseUrl}/${lang}/${cleanPath}`;
}

// Funzione per generare i metadati lato server
export function generateMetadata({
  title,
  description,
  image,
  type = 'website',
  canonicalUrl,
  article,
  schema,
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.thebestitaly.eu';
  const defaultImage = `${siteUrl}/images/default-og.jpg`;
  const finalImage = image || defaultImage;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      url: canonicalUrl || siteUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [finalImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };

  // Note: Next.js OpenGraph doesn't support article-specific fields in current version
  // if (type === 'article' && article) {
  //   // Article-specific metadata would go here if supported
  // }

  return metadata;
}