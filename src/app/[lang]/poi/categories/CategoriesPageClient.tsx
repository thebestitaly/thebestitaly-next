"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import CategoryCard from "@/components/companies/CategoryCard";

interface Props {
  lang: string;
}

export default function CategoriesPageClient({ lang }: Props) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["company-categories", lang],
    queryFn: () => directusClient.getCompanyCategories(lang),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category: any) => (
          <CategoryCard key={category.id} category={category} lang={lang} />
        ))}
      </div>
    </div>
  );
} 