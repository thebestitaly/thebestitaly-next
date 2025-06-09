"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import directusClient from "@/lib/directus";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Seo from "@/components/widgets/Seo";

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
      // TODO: Implement proper category fetching
      return {
        id: 1,
        image: null,
        translations: [{
          nome_categoria: category,
          seo_title: category,
          seo_summary: `Articles about ${category}`,
          slug_permalink: category
        }]
      };
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
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}`
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

      <div className="relative h-[40vh] min-h-[400px]">
        {categoryInfo?.image && (
          <>
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${categoryInfo.image}`}
              alt={categoryTranslation?.nome_categoria || "Category image"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50 flex items-center">
              <div className="container mx-auto px-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.map((article) => {
            const translation = article.translations[0];
            
            // Only render link if we have a valid slug
            if (!translation?.slug_permalink) {
              return null;
            }
            
            return (
              <Link
                key={article.id}
                href={`/${lang}/magazine/${translation.slug_permalink}/`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                  {article.image && (
                    <div className="relative w-[400px] h-[250px] overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                        alt={translation?.titolo_articolo}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600">
                      {translation?.titolo_articolo}
                    </h2>
                    <p className="text-gray-600 line-clamp-2">
                      {translation?.seo_summary}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MagazineCategoryPage;