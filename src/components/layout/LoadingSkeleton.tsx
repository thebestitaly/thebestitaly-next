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

// Skeleton per hero image con dimensioni fisse
export const HeroImageSkeleton: React.FC = () => (
  <div className="px-4 mt-6 md:mt-12">
    <div className="container mx-auto relative mb-4 md:mb-8 overflow-hidden rounded-xl md:rounded-2xl">
      {/* Mobile: dimensioni fisse */}
      <div className="block md:hidden w-full h-[240px] bg-gray-200 animate-pulse"></div>
      {/* Desktop: aspect-ratio */}
      <div className="hidden md:block relative aspect-[21/9] lg:aspect-[5/2] bg-gray-200 animate-pulse"></div>
    </div>
  </div>
);

// Skeleton per destination sidebar con altezza fissa
export const DestinationSidebarSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

// Skeleton per articles sidebar con altezza fissa
export const ArticlesSidebarSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton per company grid con dimensioni fisse
export const CompanyGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="w-full h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
      </div>
    ))}
  </div>
);

// Skeleton per menu dropdown con dimensioni fisse
export const MenuDropdownSkeleton: React.FC = () => (
  <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-2xl border border-gray-100 min-w-[900px]">
    <div className="p-6">
      <div className="grid grid-cols-4 gap-1">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton per Google Maps con dimensioni fisse
export const GoogleMapsSkeleton: React.FC = () => (
  <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400 text-sm">Caricamento mappa...</div>
  </div>
);

// Skeleton per video embed con aspect-ratio fisso
export const VideoEmbedSkeleton: React.FC = () => (
  <div className="relative w-full aspect-video bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400 text-sm">Caricamento video...</div>
  </div>
);

// Skeleton per widget GetYourGuide con altezza fissa
export const WidgetSkeleton: React.FC = () => (
  <div className="w-full h-32 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400 text-sm">Caricamento widget...</div>
  </div>
); 