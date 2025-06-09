"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "../../lib/directus";

interface ImageGalleryProps {
  companyName: string;
  companyId: number;
  featuredImage?: string;
}

const fetchCompanyImages = async (companyId: number) => {
  if (!companyId) return [];
  const files = await directusClient.getCompanyFiles(companyId);
  return files.map((file: { directus_files_id: string }) => file.directus_files_id);
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ companyId, featuredImage }) => {
  
  const {
    data: companyImages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companyImages", companyId],
    queryFn: () => fetchCompanyImages(companyId),
    enabled: !!companyId,
  });

  const allImages = featuredImage ? [featuredImage, ...companyImages] : companyImages;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
  }, [allImages]);

  if (isLoading) {
    console.log("Loading images...");
    return <p>Loading images...</p>;
  }

  if (error) {
    console.error("Error loading images:", error);
    return <p>Error loading images</p>;
  }

  if (allImages.length === 0) {
    console.warn("No images available to display");
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative w-full h-full">
        <Image
          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${allImages[currentIndex]}`}
          alt=""
          fill
          className="object-cover"
          priority={true}
          onClick={() => setIsLightboxOpen(true)}
        />

        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((image: string, index: number) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-white scale-125" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative w-full max-w-7xl h-[80vh] mx-4" onClick={e => e.stopPropagation()}>
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${allImages[currentIndex]}`}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            />

            {/* Bottoni di navigazione nella lightbox */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    previousImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;