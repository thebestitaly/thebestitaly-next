import React, { Suspense } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import type { Destination } from '@/lib/directus-web';

import TableOfContents from "@/components/widgets/TableOfContents";
import VideoEmbed from "@/components/widgets/VideoEmbed";
import DestinationCompanies from "@/components/destinations/DestinationCompanies";
import DestinationArticlesSidebar from "@/components/destinations/DestinationArticlesSidebar";
import DestinationSidebar from "@/components/destinations/DestinationSidebar";
import GetYourGuideWidget from "@/components/widgets/GetYourGuideWidget";

// Custom components for ReactMarkdown
const markdownComponents = {
  h2: ({ node, ...props }: any) => {
    const text = props.children?.toString() || '';
    // Remove any markdown formatting from the text
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/`(.*?)`/g, '$1')       // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links, keep text
    
    const id = cleanText.toLowerCase().replace(/\W+/g, '-').replace(/^-+|-+$/g, '');
    return <h2 id={id} {...props} />;
  },
  h3: ({ node, ...props }: any) => {
    const text = props.children?.toString() || '';
    // Remove any markdown formatting from the text
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/`(.*?)`/g, '$1')       // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links, keep text
    
    const id = cleanText.toLowerCase().replace(/\W+/g, '-').replace(/^-+|-+$/g, '');
    return <h3 id={id} {...props} />;
  },
  a: ({ href, children, ...props }: any) => {
    // Check if the link is a video URL
    if (href && (
      href.includes('youtube.com/watch') ||
      href.includes('youtu.be/') ||
      href.includes('vimeo.com/') ||
      href.match(/\.(mp4|webm|ogg)$/i)
    )) {
      return (
        <div className="my-6">
          <VideoEmbed 
            src={href} 
            title={typeof children === 'string' ? children : 'Video'} 
            className="w-full"
          />
        </div>
      );
    }
    
    // Regular link
    return (
      <a 
        href={href} 
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-blue-600 hover:text-blue-700 underline"
        {...props}
      >
        {children}
      </a>
    );
  },
};

interface DestinationLayoutProps {
  lang: string;
  destination: Destination;
  destinations: {id: string; name: string; slug: string;}[];
  title: string;
  description: string;
  breadcrumbs: { name: string; href: string }[];
  destinationType: 'region' | 'province' | 'municipality';
  sidebarData?: any; // Dati per la sidebar (opzionali)
}

export default function DestinationLayout({ 
  lang,
  destination, 
  destinations,
  title,
  description: layoutDescription,
  breadcrumbs,
  destinationType,
  sidebarData
}: DestinationLayoutProps) {
  
  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-yellow-50 p-8 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">Destinazione non Trovata</h2>
        </div>
      </div>
    );
  }

  const translation = destination.translations?.[0];
  if (!translation) {
    return <div>Translation not available for this destination.</div>;
  }
  
  const regionSlug = breadcrumbs[0]?.href.split('/')[2] || "";
  const provinceSlug = breadcrumbs.length > 1 ? breadcrumbs[1]?.href.split('/')[3] || "" : "";
  const destinationName = translation?.destination_name || "this beautiful destination";
  
  // Determina il titolo per la sidebar
  let sidebarTitle = `Esplora ${destinationName}`;
  if(destinationType === 'region') sidebarTitle = `Province in ${destinationName}`;
  if(destinationType === 'province') sidebarTitle = `Comuni in ${destinationName}`;
  if(destinationType === 'municipality') sidebarTitle = `Nei dintorni`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  const canonicalPath = [breadcrumbs[0]?.href.split('/')[2], breadcrumbs[1]?.href.split('/')[3], breadcrumbs[2]?.href.split('/')[4]].filter(Boolean).join('/');
  const canonicalUrl = `${baseUrl}/${lang}/${canonicalPath}`;
  
  const seoImage = destination.image
    ? `${process.env.NEXT_PUBLIC_APP_URL}${getOptimizedImageUrl(destination.image, 'HERO_DESKTOP')}`
    : undefined;
  const seoDescription = translation?.seo_summary || translation?.description || "Discover beautiful destinations in Italy.";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": destination.type === "municipality" ? "City" : destination.type === "province" ? "AdministrativeArea" : "AdministrativeArea",
    "name": translation?.destination_name,
    "description": seoDescription,
    "url": canonicalUrl,
    "containedInPlace": destination.type === "municipality" ? [
      {
        "@type": "AdministrativeArea",
        "name": provinceSlug,
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": regionSlug,
          "containedInPlace": {
            "@type": "Country",
            "name": "Italy",
            "url": "https://thebestitaly.eu"
          }
        }
      }
    ] : destination.type === "province" ? [
      {
        "@type": "AdministrativeArea",
        "name": regionSlug,
        "containedInPlace": {
          "@type": "Country",
          "name": "Italy",
          "url": "https://thebestitaly.eu"
        }
      }
    ] : {
      "@type": "Country",
      "name": "Italy",
      "url": "https://thebestitaly.eu"
    },
    // "geo": coordinates not available in current Destination type,
    "image": seoImage ? {
      "@type": "ImageObject",
      "url": seoImage,
      "width": 1200,
      "height": 630
    } : undefined,
    "touristType": "Cultural Tourism, Food Tourism, Nature Tourism",
    "keywords": `${translation?.destination_name}, Italy, travel, tourism, destinations, attractions`
  };

  const tocContent = translation?.description || "";

  // Logic to split markdown and inject the widget
  const description = translation?.description || "";
  const headings = description.match(/^## .*/gm) || [];
  let contentBeforeWidget: string = description;
  let contentAfterWidget: string | null = null;

  if (headings.length >= 2) {
    const secondHeading = headings[1];
    const splitIndex = description.indexOf(secondHeading);
    if (splitIndex !== -1) {
      contentBeforeWidget = description.substring(0, splitIndex);
      contentAfterWidget = description.substring(splitIndex);
    }
  }

  return (
    <div className="min-h-screen">

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <div className="px-4 pt-4">
        <Breadcrumb />
      </div>
      
      {/* Header Section - Responsive */}
      <div className="container mx-auto px-4 pt-4 pb-0 ">
        {/* Responsive title */}
        <h1 className="text-2xl md:text-5xl font-bold mb-4 text-gray-900">
          {translation?.destination_name}
        </h1>
        
        {/* SEO Summary responsive */}
        {translation?.seo_summary && (
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {translation.seo_summary}
          </p>
        )}
      </div>
      
      {/* Hero Image - OTTIMIZZATO per performance */}
      {destination.image && (
        <div className="px-4 mt-6 md:mt-12">
          <div className="container mx-auto relative h-60 md:h-80 rounded-lg overflow-hidden">
            {/* Unified responsive image */}
            <Image
              src={getOptimizedImageUrl(destination.image, 'HERO_DESKTOP')}
              alt={translation?.destination_name || ""}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2">
            <article className="prose lg:prose-lg max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {contentBeforeWidget}
              </ReactMarkdown>
              
              {contentAfterWidget && (
                <>
                  <GetYourGuideWidget destinationName={destinationName} lang={lang} />
                  <ReactMarkdown components={markdownComponents}>
                    {contentAfterWidget}
                  </ReactMarkdown>
                </>
              )}
            </article>
            <DestinationCompanies 
              destinationId={destination.id} 
              destinationType={destinationType} 
              lang={lang}
              companies={sidebarData?.companies || []} 
            />
          </div>
          <aside className="lg:col-span-1 space-y-8">
            <TableOfContents content={tocContent} />
            <DestinationSidebar 
              destinations={destinations} 
              title={sidebarTitle}
              currentDestinationId={destination.id}
              lang={lang}
              regionSlug={regionSlug}
              provinceSlug={provinceSlug}
              destinationType={destinationType}
            />
            <Suspense fallback={<div>Loading articles...</div>}>
              <DestinationArticlesSidebar 
                destinationId={destination.id} 
                lang={lang}
                articles={sidebarData?.articles || []} 
              />
            </Suspense>
            <GetYourGuideWidget destinationName={destinationName} lang={lang} />
          </aside>
        </div>
      </div>
    </div>
  );
}