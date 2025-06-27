"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import directusClient from "../../lib/directus";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

interface DestinationSidebarProps {
  currentDestinationId: string;
  regionSlug: string;
  provinceSlug: string;
  currentSlug: string;
  provinceId?: string; // L'ID della provincia può essere opzionale
  regionId?: string; // Aggiungiamo anche l'ID della regione
  lang: string;
  type: "region" | "province" | "municipality";
}

const DestinationSidebar: React.FC<DestinationSidebarProps> = ({
  currentDestinationId,
  regionSlug,
  provinceSlug,
  currentSlug,
  provinceId,
  regionId,
  lang,
  type,
}) => {
  const [showAllMunicipalities, setShowAllMunicipalities] = useState(false);
  
  // Query per ottenere la regione (se siamo in provincia o comune) - React Query provides caching
  const { data: regionData } = useQuery({
    queryKey: ["region", regionId, lang],
    queryFn: () => regionId ? directusClient.getDestinationById(regionId, lang) : null,
    enabled: !!regionId && (type === "province" || type === "municipality"),
    staleTime: 1000 * 60 * 30, // 30 minuti
  });

  // Query per ottenere la provincia (se siamo in un comune) - React Query provides caching
  const { data: provinceData } = useQuery({
    queryKey: ["province", provinceId, lang],
    queryFn: () => provinceId ? directusClient.getDestinationById(provinceId, lang) : null,
    enabled: !!provinceId && type === "municipality",
    staleTime: 1000 * 60 * 30, // 30 minuti
  });

  // Query per ottenere le altre province della stessa regione (se siamo in una provincia) - React Query provides caching
  const { data: otherProvinces } = useQuery({
    queryKey: ["other-provinces", regionId, currentDestinationId, lang],
    queryFn: () => regionId ? directusClient.getDestinations({
      type: "province",
      region_id: regionId,
      exclude_id: currentDestinationId,
      lang,
    }) : [],
    enabled: !!regionId && type === "province",
    staleTime: 1000 * 60 * 60, // 1 ora
  });

  // Query per ottenere i comuni/province (limitati direttamente nella query)
  const { data: municipalities, isLoading } = useQuery({
    queryKey: ["municipalities", provinceId || currentDestinationId, showAllMunicipalities, type, lang],
    queryFn: async () => {
      const requestLimit = showAllMunicipalities ? 100 : 15; // Limita direttamente la query
      
      if (type === "region") {
        // Per le regioni, ottieni le province
        return await directusClient.getDestinations({
          type: "province",
          region_id: currentDestinationId,
          lang,
          limit: requestLimit, // Passa il limit alla query
        });
      } else {
        // Per province e comuni, ottieni i comuni
        const targetProvinceId = type === "province" ? currentDestinationId : provinceId;
        if (!targetProvinceId) return [];
        
        return await directusClient.getDestinations({
          type: "municipality",
          province_id: targetProvinceId,
          exclude_id: type === "municipality" ? currentDestinationId : undefined,
          lang,
          limit: requestLimit, // Passa il limit alla query
        });
      }
    },
    enabled: !!(currentDestinationId && (type === "region" || provinceId || (type === "province"))),
    staleTime: 1000 * 60 * 60, // 1 ora
  });

  // Query per ottenere il conteggio totale (limitato per performance)
  const { data: totalMunicipalities } = useQuery({
    queryKey: ["total-municipalities", provinceId || currentDestinationId, type, lang],
    queryFn: async () => {
      if (type === "region") {
        // Per le regioni, conta le province (max 50)
        const provinces = await directusClient.getDestinations({
          type: "province",
          region_id: currentDestinationId,
          lang,
          limit: 50, // Limite ragionevole per conteggio
        });
        return provinces.length;
      } else {
        // Per province e comuni, conta i comuni (max 200)
        const targetProvinceId = type === "province" ? currentDestinationId : provinceId;
        if (!targetProvinceId) return 0;
        
        const municipalities = await directusClient.getDestinations({
          type: "municipality",
          province_id: targetProvinceId,
          exclude_id: type === "municipality" ? currentDestinationId : undefined,
          lang,
          limit: 200, // Limite ragionevole per conteggio
        });
        
        return municipalities.length;
      }
    },
    enabled: !!(currentDestinationId && (type === "region" || provinceId || (type === "province"))),
    staleTime: 1000 * 60 * 60 * 2, // 2 ore
  });

  if (isLoading) return <div>Loading...</div>;

  // Genera i link in base al tipo di destinazione
  const generateLink = (destination: any) => {
    const translation = destination.translations?.[0];
    const destSlug = translation?.slug_permalink;

    if (!destSlug) return "#";

    switch (destination.type) {
      case "municipality":
        return `/${lang}/${regionSlug}/${provinceSlug}/${destSlug}`;
      case "province":
        return `/${lang}/${regionSlug}/${destSlug}`;
      default:
        return `/${lang}/${destSlug}`;
    }
  };

  // Componente per renderizzare una singola destinazione
  const DestinationItem = ({ destination, showType = false }: { destination: any, showType?: boolean }) => {
    const translation = destination.translations?.[0];
    
    return (
      <Link
        key={destination.id}
        href={generateLink(destination)}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        {destination.image && (
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ minWidth: '48px', minHeight: '48px' }}>
            <img
              src={getOptimizedImageUrl(destination.image, 'THUMBNAIL')}
              alt={translation?.destination_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">
            {translation?.destination_name}
          </h4>
        </div>
      </Link>
    );
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Se siamo in una provincia, mostra: Regione + Altre Province + Comuni */}
      {type === "province" && (
        <>
          {/* Regione */}
          {regionData && (
            <div>
              <h3 className="text-lg font-bold mb-4">Regione</h3>
              <DestinationItem destination={regionData} showType={true} />
            </div>
          )}

          {/* Altre Province della stessa regione */}
          {otherProvinces && otherProvinces.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Altre Province</h3>
              <div className="space-y-2">
                {otherProvinces.map((province: any) => (
                  <DestinationItem key={province.id} destination={province} />
                ))}
              </div>
            </div>
          )}

          {/* Comuni della provincia */}
          {municipalities && municipalities.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Comuni</h3>
              <div className="space-y-2">
                {municipalities.map((municipality: any) => (
                  <DestinationItem key={municipality.id} destination={municipality} />
                ))}
              </div>
              
              {/* Bottone "Carica altri" se ci sono più di 15 comuni */}
              {totalMunicipalities && totalMunicipalities > 15 && !showAllMunicipalities && (
                <button
                  onClick={() => setShowAllMunicipalities(true)}
                  className="w-full mt-4 px-4 py-2 text-blue-600 rounded-lg hover:text-green-600 transition-colors"
                >
                  Load more ({totalMunicipalities - 15})
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Se siamo in un comune, mostra: Regione + Provincia + Altri Comuni */}
      {type === "municipality" && (
        <>
          {/* Regione */}
          {regionData && (
            <div>
              <h3 className="text-lg font-bold mb-4">Regione</h3>
              <DestinationItem destination={regionData} showType={true} />
            </div>
          )}

          {/* Provincia */}
          {provinceData && (
            <div>
              <h3 className="text-lg font-bold mb-4">Provincia</h3>
              <DestinationItem destination={provinceData} showType={true} />
            </div>
          )}

          {/* Altri Comuni della stessa provincia */}
          {municipalities && municipalities.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Altri Comuni</h3>
              <div className="space-y-2">
                {municipalities.map((municipality: any) => (
                  <DestinationItem key={municipality.id} destination={municipality} />
                ))}
              </div>
              
              {/* Bottone "Carica altri" se ci sono più di 15 comuni */}
              {totalMunicipalities && totalMunicipalities > 15 && !showAllMunicipalities && (
                <button
                  onClick={() => setShowAllMunicipalities(true)}
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Carica altri ({totalMunicipalities - 15} rimanenti)
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Se siamo in una regione, mostra solo le province (comportamento originale) */}
      {type === "region" && municipalities && municipalities.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Province</h3>
          <div className="space-y-2">
            {municipalities.map((province: any) => (
              <DestinationItem key={province.id} destination={province} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationSidebar;