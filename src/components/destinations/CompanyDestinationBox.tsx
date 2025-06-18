"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient, { getSlugsAndBreadcrumbs } from "@/lib/directus";

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

  // Ottieni gli slug completi per i link corretti
  const { data: slugData } = useQuery({
    queryKey: ["destination-slugs", destinationId, lang],
    queryFn: () => getSlugsAndBreadcrumbs(destinationId.toString(), lang),
    enabled: !!destinationId && !!destination,
  });

  if (isLoading) return <div>Loading destination...</div>;
  if (!destination || !slugData) return null;

  const translation = destination.translations?.[0];
  const destName = translation?.destination_name || "";
  const destImage = destination.image;

  // Estrai informazioni su regione e provincia
  const region = destination.region_id;
  const province = destination.province_id;
  
  const regionTranslation = region?.translations?.[0];
  const provinceTranslation = province?.translations?.[0];

  // Costruisci la gerarchia di destinazioni usando gli slug completi corretti
  const hierarchy = [];
  
  // Aggiungi regione se esiste (sempre presente nella gerarchia)
  if (region && regionTranslation && slugData.regionSlug) {
    hierarchy.push({
      name: regionTranslation.destination_name,
      image: (region as any).image,
      link: `/${lang}/${slugData.regionSlug}`,
      type: 'region'
    });
  }
  
  // Aggiungi provincia se esiste (presente se destination è municipality o province)
  if (province && provinceTranslation && slugData.provinceSlug) {
    hierarchy.push({
      name: provinceTranslation.destination_name,
      image: (province as any).image,
      link: `/${lang}/${slugData.regionSlug}/${slugData.provinceSlug}`,
      type: 'province'
    });
  }
  
  // Aggiungi comune/destinazione corrente se è un municipality
  if (destination.type === "municipality" && slugData.municipalitySlug) {
    hierarchy.push({
      name: destName,
      image: destImage,
      link: `/${lang}/${slugData.regionSlug}/${slugData.provinceSlug}/${slugData.municipalitySlug}`,
      type: 'municipality'
    });
  }
  
  // Aggiorna le informazioni della destinazione corrente se è regione o provincia
  if (destination.type === "province" && slugData.provinceSlug && hierarchy.length > 0) {
    const provinceIndex = hierarchy.findIndex(item => item.type === 'province');
    if (provinceIndex !== -1) {
      hierarchy[provinceIndex] = {
        name: destName, // Usa il nome della destinazione corrente
        image: destImage,
        link: `/${lang}/${slugData.regionSlug}/${slugData.provinceSlug}`,
        type: 'province'
      };
    }
  } else if (destination.type === "region" && slugData.regionSlug && hierarchy.length > 0) {
    const regionIndex = hierarchy.findIndex(item => item.type === 'region');
    if (regionIndex !== -1) {
      hierarchy[regionIndex] = {
        name: destName, // Usa il nome della destinazione corrente
        image: destImage,
        link: `/${lang}/${slugData.regionSlug}`,
        type: 'region'
      };
    }
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