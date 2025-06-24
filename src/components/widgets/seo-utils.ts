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
  const baseUrl = 'https://thebestitaly.eu'; // Hardcoded per produzione
  
  if (!path || path.length === 0) {
    return `${baseUrl}/${lang}`;
  }
  
  const cleanPath = path
    .filter(segment => segment && segment.trim() !== '')
    .join('/');
  
  return `${baseUrl}/${lang}/${cleanPath}`;
}

// Helper function to generate hreflangs for multilingual support
export function generateHreflangs(lang: string, path?: string[]): { [lang: string]: string } {
  const languages = ['it', 'en', 'fr', 'de', 'es'];
  const hreflangs: { [lang: string]: string } = {};
  
  languages.forEach(langCode => {
    hreflangs[langCode] = generateCanonicalUrl(langCode, path);
  });
  
  return hreflangs;
}

// FUNZIONE PRINCIPALE PER GENERARE METADATA STATICI
export function generateMetadata({
  title,
  description,
  image = 'https://thebestitaly.eu/images/default-og.jpg',
  type = 'website',
  canonicalUrl,
  hreflangs = {},
  article,
  schema,
  noindex = false
}: SEOProps): Metadata {
  
  // Debug logging per verificare che i metadata vengano generati
  console.log('🔍 SEO Debug:', {
    title: title.substring(0, 50) + '...',
    description: description.substring(0, 50) + '...',
    type,
    canonicalUrl,
    hasHreflangs: Object.keys(hreflangs).length > 0,
    noindex
  });

  // Metadata base ottimizzati per PageSpeed Insights
  const metadata: Metadata = {
    title,
    description,
    robots: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    
    // Alternates per canonical e hreflangs
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangs,
    },
    
    // Open Graph ottimizzato
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type as any,
      siteName: 'TheBestItaly',
      locale: 'it_IT',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@thebestitaly',
    },
    
    // Metadata aggiuntivi per SEO
    other: {
      'format-detection': 'telephone=no',
      'theme-color': '#1e40af',
      'color-scheme': 'light',
    },
  };

  // Aggiungi metadata specifici per gli articoli
  if (type === 'article' && article) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: article.publishedTime,
      modifiedTime: article.modifiedTime,
      authors: article.author ? [article.author] : undefined,
      section: article.category,
    };
  }

  return metadata;
}