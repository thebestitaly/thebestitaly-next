"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import directusClient, { getSlugsAndBreadcrumbs } from "@/lib/directus";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

import TableOfContents from "@/components/widgets/TableOfContents";
import VideoEmbed from "@/components/widgets/VideoEmbed";
import { Suspense } from "react";

// Componenti importati normalmente per evitare problemi
import GetYourGuideWidget from "@/components/widgets/GetYourGuideWidget";
import DestinationSidebar from "@/components/destinations/DestinationSidebar";
import DestinationArticlesSidebar from "@/components/destinations/DestinationArticlesSidebar";
import GoogleMaps from "@/components/widgets/GoogleMaps";
import DestinationCompanies from "@/components/destinations/DestinationCompanies";

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
  const { data: destination, isLoading: isLoadingDestination, error: destinationError } = useQuery({
    queryKey: ["destination", slug, lang],
    queryFn: () => directusClient.getDestinationBySlug(slug, lang),
    enabled: !!slug,
  });
  const { data: slugData, isLoading: isLoadingSlugs, error: slugsError } = useQuery({
    queryKey: ["slugs", destination?.id, lang],
    queryFn: () => {
      if (!destination?.id) return null;
      return getSlugsAndBreadcrumbs(destination.id, lang);
    },
    enabled: !!destination?.id,
  });

  // 🚨 DEBUG: Log errors to console
  if (destinationError) {
    console.error('🚨 DestinationLayout - Destination Error:', destinationError);
  }
  if (slugsError) {
    console.error('🚨 DestinationLayout - Slugs Error:', slugsError);
  }

  if (isLoadingDestination || isLoadingSlugs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {slug}...</p>
          {destinationError && <p className="text-red-600 mt-2">Destination Error: {destinationError.message}</p>}
          {slugsError && <p className="text-red-600 mt-2">Slugs Error: {slugsError.message}</p>}
        </div>
      </div>
    );
  }

  if (destinationError || slugsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error Loading Destination</h2>
          {destinationError && (
            <div className="mb-4">
              <p className="text-red-600 font-semibold">Destination Error:</p>
              <p className="text-red-500">{destinationError.message}</p>
            </div>
          )}
          {slugsError && (
            <div className="mb-4">
              <p className="text-red-600 font-semibold">Slugs Error:</p>
              <p className="text-red-500">{slugsError.message}</p>
            </div>
          )}
          <p className="text-gray-600">Slug: {slug}, Lang: {lang}, Type: {type}</p>
        </div>
      </div>
    );
  }

  if (!destination || !slugData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-yellow-50 p-8 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">Destination Not Found</h2>
          <p className="text-gray-600">Slug: {slug}, Lang: {lang}, Type: {type}</p>
          <p className="text-gray-500 mt-2">Destination: {destination ? 'Found' : 'Not Found'}</p>
          <p className="text-gray-500">Slug Data: {slugData ? 'Found' : 'Not Found'}</p>
        </div>
      </div>
    );
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
          ? `${process.env.NEXT_PUBLIC_APP_URL}${getOptimizedImageUrl(destination.image, 'HERO_DESKTOP')}`
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
      
      {/* Hero Image - OTTIMIZZATO per ridurre Egress */}
      {destination.image && (
        <div className="px-4 mt-6 md:mt-12">
          <div className="container mx-auto relative h-60 md:h-96 rounded-lg overflow-hidden">
            {/* Mobile: immagine più piccola */}
            <div className="block md:hidden w-full h-full relative">
              <Image
                src={getOptimizedImageUrl(destination.image, 'HERO_MOBILE')}
                alt={translation?.destination_name || ""}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            {/* Desktop: immagine ottimizzata */}
            <div className="hidden md:block w-full h-full relative">
              <Image
                src={getOptimizedImageUrl(destination.image, 'HERO_DESKTOP')}
                alt={translation?.destination_name || ""}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 80vw, 60vw"
              />
            </div>
          </div>
        </div>
      )}
      

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-20">
          {/* Content Column */}
          <div className="lg:col-span-2">
            {/* Widget solo su desktop per performance mobile */}
            <div className="hidden md:block mb-6 md:mb-8">
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
                <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
              </Suspense>
            </div>

            {/* Video Section - SOLO DESKTOP per performance mobile */}
            {destination.video_url && (
              <div className="hidden md:block mb-8">
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

            {/* Google Maps Widget - SOLO DESKTOP per performance mobile */}
            {destination.lat && destination.long && destination.lat !== 0 && destination.long !== 0 && (
              <div className="hidden md:block my-6 md:my-8">
                <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
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
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
                <DestinationCompanies 
                  destinationId={destination.id}
                  destinationType={type}
                  lang={lang}
                  destinationName={translation?.destination_name}
                />
              </Suspense>
            </div>

            {/* Widget finale solo su desktop */}
            <div className="hidden md:block my-6 md:my-8">
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
                <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Table of Contents - Sticky - Desktop only */}
            <div className="hidden md:block sticky top-16 z-10 mb-10">
              <TableOfContents content={tocContent} />
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg mb-4"></div>}>
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
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
                <DestinationArticlesSidebar lang={lang} destinationId={destination.id} />
              </Suspense>
            </div>
            
            {/* Mobile: Solo contenuto essenziale, niente sidebar pesanti */}
            <div className="md:hidden">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  📱 Per una migliore esperienza e più contenuti, visita questa pagina da desktop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}