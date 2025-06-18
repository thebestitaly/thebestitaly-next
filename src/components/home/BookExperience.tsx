"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSectionTranslations } from '@/hooks/useTranslations';

const BookExperienceImage = "/images/book-experience.webp";

const BookExperience: React.FC = () => {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || "en";

  const { translations: menuTranslations, loading } = useSectionTranslations('menu', lang);

  if (loading) return <div>Loading...</div>;

  return (
    <section className="relative h-[500px]">
      <Image
        src={BookExperienceImage}
        alt="Book Experience - Italian scenic landscape"
        fill
        sizes="100vw"
        className="object-cover"
        quality={85}
      />

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