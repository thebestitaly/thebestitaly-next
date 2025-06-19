// app/[lang]/companies/categories/page.tsx
import React from "react";
import { generateMetadata as generateSEO } from "@/components/widgets/seo-utils";
import CategoriesPageClient from "./CategoriesPageClient";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props) {
  return generateSEO({
    title: "Company Categories",
    description: "Browse companies by category",
  });
}

export default async function CategoriesPage({ params }: Props) {
  const { lang } = await params;
  return <CategoriesPageClient lang={lang} />;
}