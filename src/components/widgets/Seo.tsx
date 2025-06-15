"use client";

import React, { useEffect, useState } from 'react';

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

// Helper function to get current URL in Client Components
function getCurrentURL() {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
}

const Seo: React.FC<SEOProps> = ({ title, description, image, type = 'website', canonicalUrl, article, schema }) => {
  const [currentURL, setCurrentURL] = useState<string>('');

  useEffect(() => {
    setCurrentURL(getCurrentURL());
  }, []);

  const defaultImage = `${process.env.NEXT_PUBLIC_APP_URL || currentURL}/images/default-og.jpg`;
  const finalImage = image || defaultImage;
  
  // Use provided canonicalUrl or fallback to current URL
  const finalCanonicalUrl = canonicalUrl || currentURL;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={finalImage} />
      {finalCanonicalUrl && <meta property="og:url" content={finalCanonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
      {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}

      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
    </>
  );
};

export default Seo;