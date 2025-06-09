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

  return (
    <div className="min-h-screen">
      <Seo title={seoTitle} description={seoDescription} image={seoImage} schema={schema} />

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        {destination.image && (
          <div className="relative w-full h-full">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`}
              alt={translation?.destination_name || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{translation?.destination_name}</h1>
            {translation?.seo_title && <p className="text-xl text-white/90 max-w-2xl">{translation.seo_title}</p>}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content Column */}
          <div className="lg:col-span-2">
            {translation?.seo_summary && (
              <div className="prose max-w-none mb-8">
                <p className="text-xl text-gray-600 leading-relaxed">{translation.seo_summary}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-2">
              <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
            </div>

            {translation?.description && (
              <article className="prose max-w-none mb-8">
                <ReactMarkdown>{translation.description}</ReactMarkdown>
              </article>
            )}

            <div className="my-8">
              <GetYourGuideWidget lang={lang} destinationName={translation?.destination_name || "Italy"} />
            </div>

            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6">Discover more about {translation?.destination_name}</h2>
              <LatestArticles lang={lang} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
          <DestinationSidebar
            currentDestinationId={destination.id}
            regionSlug={slugData.regionSlug}
            provinceSlug={slugData.provinceSlug}
            currentSlug={translation?.slug_permalink || ""}
            provinceId={provinceId || undefined}  // Passa solo l'ID della provincia come stringa
            lang={lang}
            type={destination.type}
          />
            <ArticlesSidebar lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}