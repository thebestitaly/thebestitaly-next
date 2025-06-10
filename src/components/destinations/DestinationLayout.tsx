"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import directusClient, { getSlugsAndBreadcrumbs } from "@/lib/directus";
import GetYourGuideWidget from "@/components/widgets/GetYourGuideWidget";
import LatestArticles from "@/components/magazine/LatestArticles";
import Breadcrumb from "@/components/layout/Breadcrumb";
import DestinationSidebar from "@/components/destinations/DestinationSidebar";
import ArticlesSidebar from "@/components/widgets/ArticlesSidebar";
import Seo from "@/components/widgets/Seo";
import TableOfContents from "@/components/widgets/TableOfContents";
import GoogleMaps from "@/components/widgets/GoogleMaps";
import DestinationCompanies from "@/components/destinations/DestinationCompanies";

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
      {/* Hero Section */}      
      <div className="relative h-96 lg:h-[500px]">
      {destination.image && (
          <div className="absolute inset-0 m-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`}
              alt={translation?.destination_name || ""}
              fill
              className="object-cover rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
          </div>
        )}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">             
              <div className="max-w-4xl">
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-none mb-4">
              {translation?.destination_name}</h1>

            {translation?.seo_title && <p className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">{translation.seo_title}</p>}
          </div>
          </div>        
          </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Content Column */}
          <div className="lg:col-span-2">
            {translation?.seo_summary && (
              <div className="prose max-w-none mb-8">
                <p className="text-xl text-gray-600 leading-relaxed">{translation.seo_summary}</p>
              </div>
            )}

            <div>
              <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
            </div>

            {translation?.description && (
              <article className="prose max-w-none mb-8">
                <ReactMarkdown>{translation.description}</ReactMarkdown>
              </article>
            )}

            {/* Google Maps Widget */}
            {destination.lat && destination.long && destination.lat !== 0 && destination.long !== 0 && (
              <div className="my-8">
                <GoogleMaps 
                  lat={destination.lat} 
                  lng={destination.long} 
                  name={translation?.destination_name || "Destinazione"} 
                />
              </div>
            )}

            {/* Destination Companies/Points of Interest */}
            <div className="my-8">
              <DestinationCompanies 
                destinationId={destination.id}
                destinationType={type}
                lang={lang}
                destinationName={translation?.destination_name}
              />
            </div>

            <div className="my-8">
              <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Table of Contents - Sticky */}
            <div className="sticky top-16 z-10 mb-10">
              <TableOfContents content={tocContent} />
              <ArticlesSidebar lang={lang} />
              <DestinationSidebar
                currentDestinationId={destination.id}
                regionSlug={slugData.regionSlug}
                provinceSlug={slugData.provinceSlug}
                currentSlug={translation?.slug_permalink || ""}
                provinceId={provinceId || undefined}  // Passa solo l'ID della provincia come stringa
                lang={lang}
                type={destination.type}
              />
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}