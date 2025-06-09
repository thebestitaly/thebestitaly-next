// app/[lang]/companies/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import CompanyCard from "@/components/companies/CompanyCard";
import CompanyFilter from "@/components/companies/CompanyFilter";
import Seo from "@/components/widgets/Seo";

export default function CompaniesPage() {
  const params = useParams();
  const lang = params?.lang as string;
  const [filters, setFilters] = React.useState({});

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies", lang, filters],
    queryFn: () => directusClient.getCompanies(lang, filters),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Seo 
        title="Companies"
        description="Discover our partner companies"
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Companies</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
            <CompanyFilter onFilterChange={setFilters} />
          </aside>

          <main className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies?.map((company) => (
                <CompanyCard key={company.id} company={company} lang={lang} />
              ))}
            </div>
          </main>
         
        </div>
      </div>
    </>
  );
}