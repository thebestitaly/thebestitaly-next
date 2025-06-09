"use client";

import React, { useEffect, useState } from 'react';

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

// Helper function to get current URL in Client Components
function getCurrentURL() {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
}

const Seo: React.FC<SEOProps> = ({ title, description, image, type = 'website', article, schema }) => {
  const [currentURL, setCurrentURL] = useState<string>('');

  useEffect(() => {
    setCurrentURL(getCurrentURL());
  }, []);

  const defaultImage = `${process.env.NEXT_PUBLIC_APP_URL || currentURL}/images/default-og.jpg`;
  const finalImage = image || defaultImage;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={finalImage} />
      {currentURL && <meta property="og:url" content={currentURL} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
      {currentURL && <link rel="canonical" href={currentURL} />}

      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
    </>
  );
};

export default Seo;