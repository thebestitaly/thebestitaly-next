import { useQuery } from '@tanstack/react-query';
import directusClient from '../lib/directus';

const RegionsList = () => {
  const { data: regions, isLoading, error } = useQuery({
    queryKey: ['regions', 'it'],
    queryFn: () => directusClient.getDestinationsByType('region', 'it')
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
                  <img 
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${region.image}?width=400&height=300&fit=cover&quality=85`}
                    alt={translation?.destination_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="400"
                    height="300"
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