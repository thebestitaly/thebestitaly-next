import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}) => (
  <div 
    className={`bg-gray-200 animate-pulse ${width} ${height} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    style={{ minHeight: '1rem' }}
  />
);

export const ImageSkeleton: React.FC<{ className?: string; aspectRatio?: string }> = ({ 
  className = '', 
  aspectRatio = 'aspect-[16/9]' 
}) => (
  <div className={`bg-gray-200 animate-pulse rounded-lg ${aspectRatio} ${className}`} />
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        width={i === lines - 1 ? 'w-3/4' : 'w-full'}
        height="h-4"
      />
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
    <ImageSkeleton aspectRatio="aspect-[16/9]" />
    <div className="space-y-2">
      <Skeleton width="w-3/4" height="h-6" />
      <TextSkeleton lines={2} />
    </div>
  </div>
);

export const HeaderSkeleton: React.FC = () => (
  <div className="sticky top-0 bg-white z-50 border-b border-gray-100">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-20">
        <Skeleton width="w-24" height="h-10" />
        <div className="hidden md:flex space-x-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="w-16" height="h-6" />
          ))}
        </div>
        <Skeleton width="w-8" height="h-8" rounded />
      </div>
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative">
    <ImageSkeleton aspectRatio="aspect-[21/9]" className="w-full" />
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center space-y-4">
      <Skeleton width="w-96" height="h-12" className="bg-white/20" />
      <Skeleton width="w-64" height="h-6" className="bg-white/20" />
    </div>
  </div>
);

export const ArticleGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const SidebarSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg p-4 space-y-4">
      <Skeleton width="w-32" height="h-6" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width="w-full" height="h-4" />
        ))}
      </div>
    </div>
    <div className="bg-white rounded-lg p-4 space-y-4">
      <Skeleton width="w-40" height="h-6" />
      <ImageSkeleton aspectRatio="aspect-square" />
    </div>
  </div>
); 