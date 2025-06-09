// app/[lang]/companies/layout.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const lang = params?.lang as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb lang={lang} />
      {children}
    </div>
  );
}