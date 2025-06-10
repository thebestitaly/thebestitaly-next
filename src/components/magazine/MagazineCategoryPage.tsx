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
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}?width=1200&height=630&quality=90&fit=cover`
            : undefined
        }
        type="website"
        schema={categorySchema}
      />

      <div className="relative h-[40vh] min-h-[400px] rounded-lg overflow-hidden">
        {categoryInfo?.image && (
          <>
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}?width=1400&height=600&quality=90&fit=cover`}
              alt={categoryTranslation?.nome_categoria || "Category image"}
              fill
              className="object-cover rounded-lg"
              priority
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-3">
                <h1 className="text-5xl font-bold text-white mb-4">
                  {categoryTranslation?.nome_categoria}
                </h1>
                <p className="text-xl text-white/90 max-w-2xl">
                  {categoryTranslation?.seo_summary}
                </p>
              </div>
            </div>
          </>
        )}
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