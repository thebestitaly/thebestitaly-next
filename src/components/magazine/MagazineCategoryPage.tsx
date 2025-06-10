"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import directusClient from "@/lib/directus";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Seo from "@/components/widgets/Seo";
import ArticleGrid from "./ArticleGrid";

const MagazineCategoryPage: React.FC = () => {
  const params = useParams<{ lang: string; category: string }>();
  const lang = params?.lang;
  const category = params?.category;
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Se non ti serve usare 'currentUrl' per SEO SSR, potresti rimuoverlo
    setCurrentUrl(window.location.href);
  }, []);

  const { data: articles } = useQuery({
    queryKey: ["articles", category, lang],
    queryFn: () => directusClient.getArticlesByCategory(category || "", lang || 'it', 200), // Passa il limite di 100
    enabled: !!category,
  });
  const { data: categoryInfo } = useQuery({
    queryKey: ["category", category, lang],
    queryFn: async () => {
      // TODO: Implement proper category fetching from Directus
      // For now, we get the category from the articles data
      const categories = await directusClient.getCategories(lang || 'it');
      return categories.find(cat => 
        cat.translations.some(t => t.slug_permalink === category)
      );
    },
    enabled: !!category,
  });

  const categoryTranslation = categoryInfo?.translations?.[0];

  // Schema for SEO
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryTranslation?.seo_title,
    description: categoryTranslation?.seo_summary,
    url: currentUrl,
    image: categoryInfo?.image
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}?width=1200&height=630&quality=90&fit=cover`
      : undefined,
    isPartOf: {
      "@type": "WebSite",
      name: "TheBestItaly",
    },
  };

  return (
    <div className="min-h-screen">
      <Seo
        title={`${
          categoryTranslation?.seo_title ||
          categoryTranslation?.nome_categoria ||
          "Category"
        } | TheBestItaly`}
        description={categoryTranslation?.seo_summary || ""}
        image={
          categoryInfo?.image
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}`
            : undefined
        }
        type="website"
        schema={categorySchema}
      />
      <div className="relative h-64 sm:h-80 lg:h-[500px]">
        {categoryInfo?.image && (
          <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}`}
              alt={categoryTranslation?.nome_categoria || "Category image"}
              fill
              className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
          </div>
        )}
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">             
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-6xl font-black text-white leading-tight mb-2 sm:mb-3 lg:mb-4">
                {categoryTranslation?.nome_categoria}
              </h1>
              <p className="text-sm sm:text-base lg:text-2xl font-light text-white/90 mb-4 sm:mb-6 leading-relaxed">
                {categoryTranslation?.seo_summary}
              </p>
            </div>
          </div>        
        </div>
      </div>

      <Breadcrumb />

      <div className="container mx-auto px-4 py-16">
        <ArticleGrid 
          articles={articles || []} 
          lang={lang || 'it'} 
          columns="3"
        />
      </div>
    </div>
  );
};

export default MagazineCategoryPage;