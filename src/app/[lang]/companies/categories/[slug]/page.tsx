// app/[lang]/companies/categories/[slug]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import CompanyCard from "@/components/companies/CompanyCard";
import Seo from "@/components/widgets/Seo";

export default function CategoryCompaniesPage() {
  const params = useParams();
  const lang = params?.lang as string;
  const slug = params?.slug as string;

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies-by-category", lang, slug],
    queryFn: () => directusClient.getCompanies(lang, {
      category_id: {
        translations: {
          slug_permalink: { _eq: slug }
        }
      }
    }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Seo 
        title={`Companies in ${slug}`}
        description={`Browse companies in ${slug} category`}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{slug}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.map((company) => (
            <CompanyCard key={company.id} company={company} lang={lang} />
          ))}
        </div>
      </div>
    </>
  );
}