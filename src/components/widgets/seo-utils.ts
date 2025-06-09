// Non è un Client Component
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author?: string;
    category?: string;
  };
  schema?: object;
}

// Funzione per generare i metadati lato server
export function generateMetadata({
  title,
  description,
  image,
  type = 'website',
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
      url: siteUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [finalImage],
    },
    alternates: {
      canonical: siteUrl,
    },
  };

  // Note: Next.js OpenGraph doesn't support article-specific fields in current version
  // if (type === 'article' && article) {
  //   // Article-specific metadata would go here if supported
  // }

  return metadata;
}