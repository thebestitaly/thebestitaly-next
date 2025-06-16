// Non è un Client Component
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  canonicalUrl?: string;
  hreflangs?: { [lang: string]: string };
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author?: string;
    category?: string;
  };
  schema?: object;
  noindex?: boolean;
}

// Helper function to generate canonical URLs consistently
export function generateCanonicalUrl(lang: string, path?: string[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  
  if (!path || path.length === 0) {
    return `${baseUrl}/${lang}`;
  }
  
  const cleanPath = path
    .filter(segment => segment && segment.trim() !== '')
    .join('/');
  
  return `${baseUrl}/${lang}/${cleanPath}`;
}

// Funzione per generare i metadati lato server
export function generateMetadata({
  title,
  description,
  image,
  type = 'website',
  canonicalUrl,
  hreflangs,
  article,
  schema,
  noindex,
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
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
  };

  // Add canonical URL and hreflang if provided
  if (canonicalUrl || hreflangs) {
    metadata.alternates = {
      ...(canonicalUrl && { canonical: canonicalUrl }),
      ...(hreflangs && { languages: hreflangs }),
    };
  }

  // Add noindex if specified
  if (noindex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  // Note: Schema is now handled by JsonLdSchema component
  // to ensure proper insertion into DOM in Next.js 13+

  // Article-specific fields for Open Graph
  if (type === 'article' && article) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: article.publishedTime,
      ...(article.modifiedTime && { modifiedTime: article.modifiedTime }),
      ...(article.author && { authors: [article.author] }),
      ...(article.category && { section: article.category }),
    };
  }

  return metadata;
}