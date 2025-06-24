import { Metadata } from 'next';

interface StaticSEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  type?: 'website' | 'article';
  hreflangs?: { [lang: string]: string };
  noindex?: boolean;
}

// Componente per metadata statici che PageSpeed può leggere
export function StaticSEOHead({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage = 'https://thebestitaly.eu/images/default-og.jpg',
  type = 'website',
  hreflangs = {},
  noindex = false 
}: StaticSEOProps) {
  return (
    <>
      {/* Meta tags principali - STATICI per PageSpeed */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Hreflang tags */}
      {Object.entries(hreflangs).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TheBestItaly" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#1e40af" />
    </>
  );
}

// Funzione helper per generare metadata Next.js E HTML statico
export function generateStaticMetadata({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://thebestitaly.eu/images/default-og.jpg',
  type = 'website',
  hreflangs = {},
  noindex = false
}: StaticSEOProps): Metadata {
  return {
    title,
    description,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    canonical: canonicalUrl,
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangs,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type as any,
      siteName: 'TheBestItaly',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'format-detection': 'telephone=no',
      'theme-color': '#1e40af',
    },
  };
} 