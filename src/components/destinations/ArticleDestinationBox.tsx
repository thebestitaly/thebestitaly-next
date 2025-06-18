"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";

interface ArticleDestinationBoxProps {
  destinationId: string | number;
  lang: string;
}

const ArticleDestinationBox: React.FC<ArticleDestinationBoxProps> = ({ destinationId, lang }) => {
  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", destinationId, lang],
    queryFn: async () => {
      // Usa la nostra API invece di Directus direttamente
      const response = await fetch(`/api/destinations/${destinationId}?lang=${lang}`);
      if (!response.ok) {
        throw new Error('Failed to fetch destination');
      }
      return response.json();
    },
    enabled: !!destinationId,
  });

  if (isLoading) return <div>Loading destination...</div>;
  if (!destination) return null;

  const translation = destination.translations?.[0];
  const destName = translation?.destination_name || "";
  const destSummary = translation?.seo_summary || "";
  const destSlug = translation?.slug_permalink || "";
  const destImage = destination.image;

  // Estrai informazioni su regione e provincia
  const region = destination.region_id;
  const province = destination.province_id;
  
  const regionTranslation = region?.translations?.[0];
  const provinceTranslation = province?.translations?.[0];

  // Funzione per tradurre i tipi in italiano
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'region': return 'Regione';
      case 'province': return 'Provincia';
      case 'municipality': return 'Comune';
      default: return 'Destinazione';
    }
  };

  // Costruisci la gerarchia di destinazioni
  const hierarchy = [];
  
  // Aggiungi regione se esiste
  if (region && regionTranslation) {
    hierarchy.push({
      name: regionTranslation.destination_name || regionTranslation.description,
      image: (region as any).image, // Cast per evitare errori di tipo
      link: `/${lang}/${regionTranslation.slug_permalink}`,
      type: 'region',
      typeLabel: getTypeLabel('region')
    });
  }
  
  // Aggiungi provincia se esiste
  if (province && provinceTranslation && region && regionTranslation) {
    hierarchy.push({
      name: provinceTranslation.destination_name || provinceTranslation.description,
      image: (province as any).image, // Cast per evitare errori di tipo
      link: `/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}`,
      type: 'province',
      typeLabel: getTypeLabel('province')
    });
  }
  
  // Aggiungi comune/destinazione corrente se è un municipality
  if (destination.type === "municipality") {
    let link = `/${lang}/${destSlug}`;
    if (provinceTranslation?.slug_permalink && regionTranslation?.slug_permalink) {
      link = `/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${destSlug}`;
    }
    
    hierarchy.push({
      name: destName,
      image: destImage,
      link: link,
      type: 'municipality',
      typeLabel: getTypeLabel('municipality')
    });
  }

  return (
    <div className="bg-white rounded-xl">
      
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="space-y-3">
          {hierarchy.map((item, index) => (
            <a
              key={`${item.type}-${index}`}
              href={item.link}
              className="block hover:bg-white rounded-lg transition-colors duration-200 group p-3"
            >
              <div className="flex items-center space-x-3">
                {/* Foto della destinazione con fallback */}
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback alla bandiera italiana se l'immagine non carica
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/flags/it.svg';
                        target.className = 'w-8 h-6 object-contain';
                      }}
                    />
                  ) : (
                    // Fallback diretto alla bandiera italiana
                    <img
                      src="/images/flags/it.svg"
                      alt={item.name}
                      className="w-8 h-6 object-contain"
                    />
                  )}
                </div>
                
                {/* Nome e tipo */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {item.typeLabel}
                  </p>
                  <h4 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mt-1 truncate">
                    {item.name}
                  </h4>
                </div>
                
                {/* Freccia */}
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      {/* Descrizione della destinazione se disponibile */}
      {destSummary && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 leading-relaxed">
            {destSummary}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleDestinationBox; 