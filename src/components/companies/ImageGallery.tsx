"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{
    id: number;
    directus_files_id: string;
  }>;
  companyName: string;
  featuredImage?: string;
}

export default function ImageGallery({ images, companyName, featuredImage }: ImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Create array with featured image first, then additional images
  const allImages = [
    ...(featuredImage ? [{ id: 0, directus_files_id: featuredImage }] : []),
    ...images
  ];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  // Focus management for accessibility
  useEffect(() => {
    if (isLightboxOpen) {
      const lightboxElement = document.querySelector('[role="dialog"]') as HTMLElement;
      if (lightboxElement) {
        lightboxElement.focus();
      }
    }
  }, [isLightboxOpen]);

  if (allImages.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Galleria Foto</h2>
        <div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          role="grid"
          aria-label={`Galleria fotografica di ${companyName}`}
        >
          {allImages.slice(0, 8).map((image, index) => (
            <div 
              key={image.id} 
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Visualizza immagine ${index + 1} di ${companyName} in modalità schermo intero`}
              style={{
                minHeight: '200px', // Prevent CLS by setting minimum height
                width: '100%'
              }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.directus_files_id}?width=400&height=400&fit=cover`}
                alt={`${companyName} - Immagine ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn 
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  aria-hidden="true"
                />
              </div>
              
            </div>
          ))}
          
          {/* Show more indicator */}
          {allImages.length > 8 && (
            <div 
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center"
              onClick={() => openLightbox(8)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(8);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Visualizza tutte le ${allImages.length} immagini di ${companyName}`}
              style={{
                minHeight: '200px', // Prevent CLS
                width: '100%'
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">
                  +{allImages.length - 8}
                </div>
                <div className="text-sm text-gray-500">altre foto</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Visualizzazione immagine ${currentImageIndex + 1} di ${allImages.length} - ${companyName}`}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2"
            aria-label="Chiudi galleria fotografica"
            type="button"
          >
            <X className="w-8 h-8" aria-hidden="true" />
          </button>

          {/* Navigation buttons */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2"
                aria-label="Immagine precedente"
                type="button"
              >
                <ChevronLeft className="w-8 h-8" aria-hidden="true" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2"
                aria-label="Immagine successiva"
                type="button"
              >
                <ChevronRight className="w-8 h-8" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Main image */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${allImages[currentImageIndex].directus_files_id}?width=1200&height=800&fit=inside`}
                alt={`${companyName} - Immagine ${currentImageIndex + 1} di ${allImages.length}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Image counter */}
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {currentImageIndex + 1} / {allImages.length}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div 
              className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2 max-w-sm overflow-x-auto"
              role="tablist"
              aria-label="Miniature delle immagini"
            >
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-white' : 'border-white/30'
                  }`}
                  role="tab"
                  aria-selected={index === currentImageIndex}
                  aria-label={`Vai all'immagine ${index + 1}`}
                  type="button"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.directus_files_id}?width=100&height=100&fit=cover`}
                    alt=""
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}