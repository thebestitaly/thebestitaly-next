"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSectionTranslations } from '@/hooks/useTranslations';

const backgroundImages = [
  '/images/hero/hero-img-1.webp',
  '/images/hero/hero-img-2.webp',
  '/images/hero/hero-img-3.webp',
];

const HeroSection: React.FC = () => {
  const params = useParams();
  const lang = (params?.lang as string) || 'it';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { translations: homeTranslations } = useSectionTranslations('homepage', lang);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Background Images with fixed dimensions to prevent CLS */}
      {backgroundImages.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={img}
            alt={`Italy scenic view ${index + 1}`}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Decorative elements */}
      <div className="absolute top-20 right-1/4 text-white/50 z-10">
        <div className="absolute top-8 right-0 w-20 h-20 border-dashed border-t-2 border-r-2 border-white/50 rounded-tr-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 h-full text-left">
        <div className="flex flex-col items-start justify-center h-[600px] max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            {homeTranslations?.title || 'EXPERIENCE DESTINATIONS'}
          </h1>
          <p className="text-white/90 mb-8 text-lg max-w-lg">
            {homeTranslations?.seo_summary || 'Explore the most beautiful places in Italy'}
          </p>

          {/* Fixed Link to Search Page with language parameter */}
          <Link 
            href={`/${lang}/search`} 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold"
          >
            {homeTranslations?.search_button || 'Search Destinations'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;