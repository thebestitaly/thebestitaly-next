"use client";
import React from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface ImageGalleryProps {
  images: any[];
  alt?: string;
  className?: string;
  companyName?: string;
  featuredImage?: any;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt, className, companyName, featuredImage }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
      {images.map((image: any, index: number) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={getOptimizedImageUrl(image.directus_files_id || image, 'CARD')}
            alt={`${alt} - ${companyName}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={true}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery; 