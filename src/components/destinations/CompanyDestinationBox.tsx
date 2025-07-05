"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusWebClient from "@/lib/directus-web";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { useFlags } from "@/hooks/useFlags";

interface CompanyDestinationBoxProps {
  destinationId: string | number;
  lang: string;
}

const CompanyDestinationBox: React.FC<CompanyDestinationBoxProps> = ({ destinationId, lang }) => {
  const { getFlagUrl } = useFlags();
  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", destinationId, lang],
    queryFn: () => directusWebClient.getDestinationByUUID(destinationId.toString(), lang),
    enabled: !!destinationId,
  });

  if (isLoading) return <div>Loading destination...</div>;
  if (!destination) return null;

  const translation = destination.translations?.[0];
  const destName = translation?.destination_name || "";
  const destImage = destination.image;

  // Estrai informazioni su regione e provincia
  const region = destination.region_id;
  const province = destination.province_id;
  
  const regionTranslation = region?.translations?.[0];
  const provinceTranslation = province?.translations?.[0];

  // Costruisci la gerarchia di destinazioni con URL semplificati
  const hierarchy = [];
  
  // Aggiungi regione se esiste
  if (region && regionTranslation) {
    hierarchy.push({
      name: regionTranslation.destination_name,
      image: (region as any).image,
      link: `/${lang}/${regionTranslation.slug_permalink || 'region'}`,
      type: 'region'
    });
  }
  
  // Aggiungi provincia se esiste
  if (province && provinceTranslation) {
    const regionSlug = regionTranslation?.slug_permalink || 'region';
    hierarchy.push({
      name: provinceTranslation.destination_name,
      image: (province as any).image,
      link: `/${lang}/${regionSlug}/${provinceTranslation.slug_permalink || 'province'}`,
      type: 'province'
    });
  }
  
  // Aggiungi destinazione corrente se è un municipality
  if (destination.type === "municipality" && translation?.slug_permalink) {
    const regionSlug = regionTranslation?.slug_permalink || 'region';
    const provinceSlug = provinceTranslation?.slug_permalink || 'province';
    hierarchy.push({
      name: destName,
      image: destImage,
      link: `/${lang}/${regionSlug}/${provinceSlug}/${translation.slug_permalink}`,
      type: 'municipality'
    });
  }

  return (
    <div className="rounded-xl md:rounded-2xl bg-gray-50">
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
                    src={getOptimizedImageUrl(item.image, 'THUMBNAIL')}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback alla bandiera italiana se l'immagine non carica
                      const target = e.target as HTMLImageElement;
                      target.src = getFlagUrl('it');
                      target.className = 'w-8 h-6 object-contain';
                    }}
                  />
                ) : (
                  // Fallback diretto alla bandiera italiana
                  <img
                    src={getFlagUrl('it')}
                    alt={item.name}
                    className="w-8 h-6 object-contain"
                  />
                )}</div>
              
              {/* Nome e tipo */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
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
  );
};

export default CompanyDestinationBox; 