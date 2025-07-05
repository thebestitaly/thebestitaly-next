import { useQuery } from '@tanstack/react-query';
import directusWebClient from '../lib/directus-web';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import Image from 'next/image';

const RegionsList = () => {
  const { data: regions, isLoading, error } = useQuery({
    queryKey: ['regions', 'it'],
    queryFn: () => directusWebClient.getDestinationsByType('region', 'it')
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div>Error loading regions</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Regions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions?.map((region) => {
          const translation = region.translations[0];
          return (
            <div key={region.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {region.image && (
                <div className="relative aspect-[4/3] h-48">
                  <Image 
                    src={getOptimizedImageUrl(region.image, 'CARD')}
                    alt={translation?.destination_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    unoptimized={true}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">
                  {translation?.destination_name}
                </h3>
                {translation?.seo_summary && (
                  <p className="text-gray-600 text-sm">
                    {translation.seo_summary}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegionsList;