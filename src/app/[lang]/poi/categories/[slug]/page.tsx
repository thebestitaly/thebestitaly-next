// app/[lang]/companies/categories/[slug]/page.tsx
import React from "react";
import { generateMetadata as generateSEO } from "@/components/widgets/seo-utils";
import CategoryCompaniesPageClient from "./CategoryCompaniesPageClient";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return generateSEO({
    title: `Companies in ${slug}`,
    description: `Browse companies in ${slug} category`,
  });
}

export default async function CategoryCompaniesPage({ params }: Props) {
  const { lang, slug } = await params;
  return <CategoryCompaniesPageClient lang={lang} slug={slug} />;
}