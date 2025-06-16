"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import directusClient, { getSlugsAndBreadcrumbs } from "@/lib/directus";
import Breadcrumb from "@/components/layout/Breadcrumb";

import TableOfContents from "@/components/widgets/TableOfContents";
import VideoEmbed from "@/components/widgets/VideoEmbed";
import { lazy, Suspense } from "react";

// Lazy load dei componenti non critici
const GetYourGuideWidget = lazy(() => import("@/components/widgets/GetYourGuideWidget"));
const DestinationSidebar = lazy(() => import("@/components/destinations/DestinationSidebar"));
const DestinationArticlesSidebar = lazy(() => import("@/components/destinations/DestinationArticlesSidebar"));
const GoogleMaps = lazy(() => import("@/components/widgets/GoogleMaps"));
const DestinationCompanies = lazy(() => import("@/components/destinations/DestinationCompanies"));

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
  slug: string;
  lang: string;
  type: "region" | "province" | "municipality";
  parentSlug?: string; // per province e municipality
}

export default function DestinationLayout({ slug, lang, type, parentSlug }: DestinationLayoutProps) {
  const { data: destination, isLoading: isLoadingDestination } = useQuery({
    queryKey: ["destination", slug, lang],
    queryFn: () => directusClient.getDestinationBySlug(slug, lang),
    enabled: !!slug,
  });
  const { data: slugData, isLoading: isLoadingSlugs } = useQuery({
    queryKey: ["slugs", destination?.id, lang],
    queryFn: () => {
      if (!destination?.id) return null;
      return getSlugsAndBreadcrumbs(destination.id, lang);
    },
    enabled: !!destination?.id,
  });

  if (isLoadingDestination || isLoadingSlugs) {
    return <div>Loading...</div>;
  }

  if (!destination || !slugData) {
    return <div>Not found</div>;
  }

  const translation = destination.translations[0];
  const provinceId = destination.province_id?.id || null; // Estrai l'ID corretto
  const regionId = destination.region_id?.id || null; // Estrai l'ID della regione
  // Determina gli slug e gli ID per il breadcrumb e la sidebar
  const regionSlug = slugData.regionSlug || parentSlug || "";
  const provinceSlug = slugData.provinceSlug || (type === "province" ? slug : "");
  const municipalitySlug = type === "municipality" ? slug : "";

  // Schema for structured data (still needed for page content)
  const seoImage = destination.image
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`
    : undefined;
  const seoDescription = translation?.seo_summary || translation?.description || "Discover beautiful destinations in Italy.";
  
  // Improved schema for destinations
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  let canonicalUrl = `${baseUrl}/${lang}`;
  if (regionSlug) canonicalUrl += `/${regionSlug}`;
  if (provinceSlug) canonicalUrl += `/${provinceSlug}`;
  if (municipalitySlug) canonicalUrl += `/${municipalitySlug}`;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": type === "municipality" ? "City" : type === "province" ? "AdministrativeArea" : "AdministrativeArea",
    "name": translation?.destination_name,
    "description": seoDescription,
    "url": canonicalUrl,
    "containedInPlace": type === "municipality" ? [
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
    ] : type === "province" ? [
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
    "geo": destination.lat && destination.long && destination.lat !== 0 && destination.long !== 0 ? {
      "@type": "GeoCoordinates",
      "latitude": destination.lat,
      "longitude": destination.long
    } : undefined,
    "image": seoImage ? {
      "@type": "ImageObject",
      "url": seoImage,
      "width": 1200,
      "height": 630
    } : undefined,
    "touristType": "Cultural Tourism, Food Tourism, Nature Tourism",
    "keywords": `${translation?.destination_name}, Italy, travel, tourism, destinations, attractions`
  };

  // Contenuto per il Table of Contents - usa il contenuto reale della descrizione
  const tocContent = translation?.description || "";

  return (
    <div className="min-h-screen">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* SEO meta tags are handled by generateMetadata in page.tsx files */}
      
      {/* Breadcrumb - Always on top */}
      <div className="px-4 pt-4">
        <Breadcrumb />
      </div>
      
      {/* Header Section - Responsive */}
      <div className="container mx-auto px-4 pt-4 pb-0 ">
        {/* Responsive title */}
        <h1 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 mt-3">
          {translation?.destination_name}
        </h1>
        
        {/* SEO Summary responsive */}
        {translation?.seo_summary && (
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4">
            {translation.seo_summary}
          </p>
        )}
      </div>
      
      {/* Hero Image - Responsive */}
      {destination.image && (
        <div className="px-4 mt-6 md:mt-12">
          <div className="container mx-auto relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[5/2] mb-4 md:mb-8 overflow-hidden rounded-xl md:rounded-2xl">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}?width=1200&height=500&fit=cover&quality=85`}
              alt={translation?.destination_name || ""}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 60vw, 50vw"
            />
          </div>
        </div>
      )}
      

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-20">
          {/* Content Column */}
          <div className="lg:col-span-2">
            <div className="mb-6 md:mb-8">
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
              </Suspense>
            </div>

            {/* Video Section */}
            {destination.video_url && (
              <div className="mb-8">
                <VideoEmbed 
                  src={destination.video_url} 
                  title={translation?.destination_name || 'Video della destinazione'} 
                  className="w-full"
                />
              </div>
            )}

            {translation?.description && (
              <article className="prose prose-base md:prose-lg max-w-none mb-6 md:mb-8">
                <ReactMarkdown components={markdownComponents}>{translation.description}</ReactMarkdown>
              </article>
            )}

            {/* Google Maps Widget */}
            {destination.lat && destination.long && destination.lat !== 0 && destination.long !== 0 && (
              <div className="my-6 md:my-8">
                <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"><span className="text-gray-900">Caricamento mappa...</span></div>}>
                  <GoogleMaps 
                    lat={destination.lat} 
                    lng={destination.long} 
                    name={translation?.destination_name || "Destinazione"} 
                  />
                </Suspense>
              </div>
            )}

            {/* Destination Companies/Points of Interest */}
            <div className="my-6 md:my-8">
              <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <DestinationCompanies 
                  destinationId={destination.id}
                  destinationType={type}
                  lang={lang}
                  destinationName={translation?.destination_name}
                />
              </Suspense>
            </div>

            <div className="my-6 md:my-8">
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Table of Contents - Sticky - Desktop only */}
            <div className="hidden md:block sticky top-16 z-10 mb-10">
              <TableOfContents content={tocContent} />
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse mb-6"></div>}>
                <DestinationSidebar
                  currentDestinationId={destination.id}
                  regionSlug={slugData.regionSlug}
                  provinceSlug={slugData.provinceSlug}
                  currentSlug={translation?.slug_permalink || ""}
                  provinceId={provinceId || undefined}  // Passa solo l'ID della provincia come stringa
                  regionId={regionId || undefined}  // Passa l'ID della regione
                  lang={lang}
                  type={destination.type}
                />
              </Suspense>
              <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <DestinationArticlesSidebar lang={lang} destinationId={destination.id} />
              </Suspense>
            </div>
            
            {/* Mobile sidebar content */}
            <div className="md:hidden space-y-6">
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <DestinationSidebar
                  currentDestinationId={destination.id}
                  regionSlug={slugData.regionSlug}
                  provinceSlug={slugData.provinceSlug}
                  currentSlug={translation?.slug_permalink || ""}
                  provinceId={provinceId || undefined}
                  regionId={regionId || undefined}  // Passa l'ID della regione
                  lang={lang}
                  type={destination.type}
                />
              </Suspense>
              <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <DestinationArticlesSidebar lang={lang} destinationId={destination.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}