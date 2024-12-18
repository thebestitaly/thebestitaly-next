"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import Seo from "@/components/widgets/Seo";
import Image from "next/image";

const MagazineListPage: React.FC = () => {
  const { lang = "it" } = useParams<{ lang: string }>();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Query per ottenere le traduzioni del magazine (categoria 10)
  const { data: magazineData } = useQuery({
    queryKey: ["category", 10, lang],
    queryFn: async () => {
      const response = await directusClient.get("/items/categorias", {
        params: {
          filter: { id: { _eq: 10 } },
          fields: ["*", "translations.*"],
          deep: {
            translations: {
              _filter: {
                languages_code: { _eq: lang },
              },
            },
          },
        },
      });
      return response.data?.data[0];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", lang],
    queryFn: () => directusClient.getCategories(lang),
  });

  const { data: articlesByCategory } = useQuery({
    queryKey: ["articlesByCategory", lang],
    queryFn: async () => {
      const allArticles: Record<string, any> = {};
      if (categories) {
        for (const category of categories) {
          const articles = await directusClient.getArticlesByCategory(
            category.translations[0]?.slug_permalink || "",
            lang,
            9
          );
          allArticles[category.id] = articles;
        }
      }
      return allArticles;
    },
    enabled: !!categories,
  });

  const magazineTranslation = magazineData?.translations?.[0];

  // Schema for SEO
  const magazineSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: magazineTranslation?.seo_title,
    description: magazineTranslation?.seo_summary,
    url: currentUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "TheBestItaly",
    },
  };

  return (
    <div className="min-h-screen">
      <Seo
        title={`${magazineTranslation?.seo_title || "Magazine"} | TheBestItaly`}
        description={magazineTranslation?.seo_summary || ""}
        type="website"
        schema={magazineSchema}
      />

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[400px]">
        <Image
          src="/images/magazine.webp"
          alt={magazineTranslation?.seo_title || "Magazine"}
          layout="fill"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold text-white">
              {magazineTranslation?.nome_categoria || "Magazine"}
            </h1>
            {magazineTranslation?.seo_summary && (
              <p className="text-xl text-white/90 mt-4 max-w-2xl">
                {magazineTranslation.seo_summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Categories and Articles */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          {categories?.map((category) => {
            const translation = category.translations[0];
            const categoryArticles = articlesByCategory?.[category.id] || [];

            return (
              <section key={category.id} className="mb-20">
                {/* Category Header */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold mb-2">
                    {translation?.nome_categoria}
                  </h2>
                  <p className="text-gray-600 text-lg max-w-3xl">
                    {translation?.seo_summary}
                  </p>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryArticles.map((article) => {
                    const articleTranslation = article.translations[0];
                    return (
                      <Link
                        key={article.id}
                        href={`/${lang}/magazine/${articleTranslation?.slug_permalink}/`}
                        className="group"
                      >
                        <div className="rounded-lg overflow-hidden shadow-lg">
                          {article.image && (
                            <div className="aspect-[16/9] overflow-hidden">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                                alt={articleTranslation?.titolo_articolo}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">
                              {articleTranslation?.titolo_articolo}
                            </h3>
                            <p className="text-gray-600 line-clamp-2">
                              {articleTranslation?.seo_summary}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* View All Link */}
                <div className="mt-8 text-center">
                  <Link
                    href={`/${lang}/magazine/c/${translation?.slug_permalink}/`}
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All {translation?.nome_categoria} Articles
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MagazineListPage;