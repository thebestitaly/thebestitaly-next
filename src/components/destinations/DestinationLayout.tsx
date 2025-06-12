"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import directusClient, { getSlugsAndBreadcrumbs } from "@/lib/directus";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Seo from "@/components/widgets/Seo";
import TableOfContents from "@/components/widgets/TableOfContents";
import { lazy, Suspense } from "react";

// Lazy load dei componenti non critici
const GetYourGuideWidget = lazy(() => import("@/components/widgets/GetYourGuideWidget"));
const DestinationSidebar = lazy(() => import("@/components/destinations/DestinationSidebar"));
const ArticlesSidebar = lazy(() => import("@/components/widgets/ArticlesSidebar"));
const GoogleMaps = lazy(() => import("@/components/widgets/GoogleMaps"));
const DestinationCompanies = lazy(() => import("@/components/destinations/DestinationCompanies"));

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
  // Determina gli slug e gli ID per il breadcrumb e la sidebar
  const regionSlug = slugData.regionSlug || parentSlug || "";
  const provinceSlug = slugData.provinceSlug || (type === "province" ? slug : "");
  const municipalitySlug = type === "municipality" ? slug : "";

  // SEO Configuration
  const seoTitle = translation?.seo_title || translation?.destination_name || "Destination";
  const seoDescription = translation?.seo_summary || "Discover beautiful destinations in Italy.";
  const seoImage = destination.image
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`
    : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": type === "municipality" ? "City" : type === "province" ? "AdministrativeArea" : "Region",
    name: translation?.destination_name,
    description: seoDescription,
    image: seoImage,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/${regionSlug}/${provinceSlug}/${municipalitySlug}`,
  };

  // Contenuto per il Table of Contents - usa il contenuto reale della descrizione
  const tocContent = translation?.description || "";

  return (
    <div className="min-h-screen">
      <Seo title={seoTitle} description={seoDescription} image={seoImage} schema={schema} />
      
      {/* Mobile Header - Studenti.it style */}
      <div className="md:hidden">
        {/* Breadcrumb Mobile */}
        <div className="px-4 pt-4">
          <Breadcrumb variant="mobile" />
        </div>
        
        <div className="px-4 pt-4 pb-0">
          {/* Titolo più grande */}
          <h1 className="text-5xl font-bold text-gray-900 mb-3 mt-3">
            {translation?.destination_name}
          </h1>
          
          {/* SEO Summary invece di SEO Title */}
          {translation?.seo_summary && (
            <p className="text-xl text-gray-600 mb-4">
              {translation.seo_summary}
            </p>
          )}
        </div>
        
        {/* Hero Image - Mobile - Attaccata al bottom con stesso margine laterale */}
        {destination.image && (
          <div className="px-4 mt-12">
            <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl">
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}?width=800&height=450&fit=cover&quality=85`}
                alt={translation?.destination_name || ""}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        )}
        
        {/* TOC - Table of Contents */}
        <div className="px-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <TableOfContents content={tocContent} />
          </div>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block relative h-64 sm:h-80 lg:h-[500px]">
        {/* Desktop: Image with overlay */}
        {destination.image && (
          <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}?width=1200&height=600&fit=cover&quality=85`}
              alt={translation?.destination_name || ""}
              fill
              className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
          </div>
        )}
        
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">             
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-2 sm:mb-3 lg:mb-4">
                {translation?.destination_name}
              </h1>
              {translation?.seo_title && <p className="text-sm sm:text-base lg:text-2xl font-light text-white/90 mb-4 sm:mb-6 leading-relaxed">{translation.seo_title}</p>}
            </div>
          </div>        
        </div>
      </div>

      {/* Breadcrumb - Desktop only */}
      <div className="hidden md:block">
        <Breadcrumb />
      </div>

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

            {translation?.description && (
              <article className="prose prose-base md:prose-lg max-w-none mb-6 md:mb-8">
                <ReactMarkdown>{translation.description}</ReactMarkdown>
              </article>
            )}

            {/* Google Maps Widget */}
            {destination.lat && destination.long && destination.lat !== 0 && destination.long !== 0 && (
              <div className="my-6 md:my-8">
                <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"><span className="text-gray-500">Caricamento mappa...</span></div>}>
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
                  lang={lang}
                  type={destination.type}
                />
              </Suspense>
              <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <ArticlesSidebar lang={lang} />
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
                  lang={lang}
                  type={destination.type}
                />
              </Suspense>
              <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <ArticlesSidebar lang={lang} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}