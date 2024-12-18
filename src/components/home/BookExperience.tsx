"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTranslations } from "../../lib/directus";

const BookExperienceImage = "/images/book-experience.webp";

const BookExperience: React.FC = () => {
  const { lang = "en" } = useParams<{ lang: string }>();

  const { data: menuTranslations, isLoading, isError } = useQuery({
    queryKey: ["translations", lang, "menu"],
    queryFn: () => getTranslations(lang, "menu"),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading translations</div>;

  return (
    <section className="relative">
      <React.Suspense fallback={<div>Loading...</div>}>
        <img
          src={BookExperienceImage}
          alt="Book Experience"
          loading="lazy"
          className="w-full object-cover h-[500px]"
        />
      </React.Suspense>

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white z-10 px-4">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
            {menuTranslations?.experience || "Book your experience"}
          </h2>
          <p className="text-2xl mb-8 max-w-2xl mx-auto drop-shadow-lg">
            {menuTranslations?.experience_sub || "Thousands of activities designed for you"}
          </p>
          <Link
            href={lang ? `/${lang}/experience` : "/en/experience"}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg"
          >
            {menuTranslations?.search || "Search"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BookExperience;