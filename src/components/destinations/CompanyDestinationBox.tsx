"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";

interface CompanyDestinationBoxProps {
  destinationId: string | number;
  lang: string;
}

const CompanyDestinationBox: React.FC<CompanyDestinationBoxProps> = ({ destinationId, lang }) => {
  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", destinationId, lang],
    queryFn: () => directusClient.getDestinationById(destinationId.toString(), lang),
    enabled: !!destinationId,
  });

  if (isLoading) return <div>Loading destination...</div>;
  if (!destination) return null;

  console.log('DESTINATION:', destination);
  console.log('REGION_ID:', destination.region_id);
  console.log('PROVINCE_ID:', destination.province_id);

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

  // Costruisci la gerarchia di destinazioni
  const hierarchy = [];
  
  // Aggiungi regione se esiste
  if (region && regionTranslation) {
    hierarchy.push({
      name: regionTranslation.destination_name || regionTranslation.description,
      image: (region as any).image, // Cast per evitare errori di tipo
      link: `/${lang}/${regionTranslation.slug_permalink}`,
      type: 'region'
    });
  }
  
  // Aggiungi provincia se esiste
  if (province && provinceTranslation && region && regionTranslation) {
    hierarchy.push({
      name: provinceTranslation.destination_name || provinceTranslation.description,
      image: (province as any).image, // Cast per evitare errori di tipo
      link: `/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}`,
      type: 'province'
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
      type: 'municipality'
    });
  }

  return (
    <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gray-50">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
        📍 Città di riferimento
      </h3>
      
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
                )}</div>
              
              {/* Nome e tipo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {item.type === 'region' ? 'Regione' : 
                     item.type === 'province' ? 'Provincia' : 'Comune'}
                  </span>
                </div>
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
  );
};

export default CompanyDestinationBox; 