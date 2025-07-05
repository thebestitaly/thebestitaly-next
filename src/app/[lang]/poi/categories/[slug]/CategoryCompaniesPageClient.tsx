"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusWebClient from "@/lib/directus-web";
import CompanyCard from "@/components/companies/CompanyCard";

interface Props {
  lang: string;
  slug: string;
}

export default function CategoryCompaniesPageClient({ lang, slug }: Props) {
  const { data: companiesResult, isLoading } = useQuery({
    queryKey: ["companies-by-category", lang, slug],
    queryFn: () => directusWebClient.getCompanies({
      lang,
      filters: {
        'category_id.translations.slug_permalink': { _eq: slug }
      }
    }),
  });

  // Convert result to array
  const companies = Array.isArray(companiesResult) ? companiesResult : (companiesResult ? [companiesResult] : []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{slug}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies?.map((company: any) => (
          <CompanyCard key={company.id} company={company} lang={lang} />
        ))}
      </div>
    </div>
  );
} 