"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import directusClient from "../../lib/directus";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { 
  getProvincesForRegion, 
  getMunicipalitiesForProvince, 
  getDestinationDetails 
} from "@/lib/static-destinations";

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
  

  
  // Query per ottenere la regione - OTTIMIZZATA con dati statici
  const { data: regionData } = useQuery({
    queryKey: ["region-static", regionId, lang],
    queryFn: () => regionId ? getDestinationDetails(regionId, lang) : null,
    enabled: !!regionId && (type === "province" || type === "municipality"),
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 giorni - dati statici
    gcTime: 1000 * 60 * 60 * 24 * 60, // 60 giorni in cache
  });

  // Query per ottenere la provincia - OTTIMIZZATA con dati statici
  const { data: provinceData } = useQuery({
    queryKey: ["province-static", provinceId, lang],
    queryFn: () => provinceId ? getDestinationDetails(provinceId, lang) : null,
    enabled: !!provinceId && type === "municipality",
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 giorni - dati statici
    gcTime: 1000 * 60 * 60 * 24 * 60, // 60 giorni in cache
  });

  // Query per ottenere le altre province - ULTRA-OTTIMIZZATA con dati statici
  const { data: otherProvinces } = useQuery({
    queryKey: ["provinces-static", regionId, currentDestinationId, lang],
    queryFn: async () => {
      if (!regionId) return [];
      
      // Usa dati statici per ottenere tutte le province della regione
      const allProvinces = await getProvincesForRegion(regionId, lang);
      
      // Filtra quella corrente
      return allProvinces.filter(province => province.id !== currentDestinationId);
    },
    enabled: !!regionId && type === "province",
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 giorni - dati completamente statici
    gcTime: 1000 * 60 * 60 * 24 * 60, // 60 giorni in cache
  });

  // Query per ottenere i comuni/province - ULTRA-OTTIMIZZATA con dati statici
  const { data: municipalities, isLoading } = useQuery({
    queryKey: ["municipalities-static", provinceId || currentDestinationId, showAllMunicipalities, type, lang],
    queryFn: async () => {
      const requestLimit = showAllMunicipalities ? 500 : 15; // Limite più alto per i dati statici
      
      if (type === "region") {
        // Per le regioni, ottieni le province (ULTRA-VELOCE)
        const provinces = await getProvincesForRegion(currentDestinationId, lang);
        return provinces.slice(0, requestLimit);
      } else {
        // Per province e comuni, ottieni i comuni (ULTRA-VELOCE)
        const targetProvinceId = type === "province" ? currentDestinationId : provinceId;
        if (!targetProvinceId) return [];
        
        const municipalities = await getMunicipalitiesForProvince(targetProvinceId, lang);
        
        // Filtra quello corrente se siamo in un comune
        const filtered = type === "municipality" 
          ? municipalities.filter(m => m.id !== currentDestinationId)
          : municipalities;
        
        return filtered.slice(0, requestLimit);
      }
    },
    enabled: !!(currentDestinationId && (type === "region" || provinceId || (type === "province") || (type === "municipality" && provinceId))),
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 giorni - dati completamente statici
    gcTime: 1000 * 60 * 60 * 24 * 60, // 60 giorni in cache
  });

  // 🚀 OTTIMIZZAZIONE: Calcola il totale dalla query esistente invece di fare una query separata
  const totalMunicipalities = useMemo(() => {
    if (!municipalities) return 0;
    
    // Se abbiamo caricato meno del limite, il totale è quello che vediamo
    const currentLimit = showAllMunicipalities ? 100 : 15;
    if (municipalities.length < currentLimit) {
      return municipalities.length;
    }
    
    // Altrimenti, stimiamo che ce ne siano di più (per mostrare il bottone "Carica altri")
    return municipalities.length + 1; // +1 per indicare che ce ne sono altri
  }, [municipalities, showAllMunicipalities]);

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
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
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
              
              {/* Bottone "Carica altri" se abbiamo raggiunto il limite */}
              {municipalities && municipalities.length >= 15 && !showAllMunicipalities && (
                <button
                  onClick={() => setShowAllMunicipalities(true)}
                  className="w-full mt-4 px-4 py-2 text-blue-600 rounded-lg hover:text-green-600 transition-colors"
                >
                  Carica altri comuni
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
              
              {/* Bottone "Carica altri" se abbiamo raggiunto il limite */}
              {municipalities && municipalities.length >= 15 && !showAllMunicipalities && (
                <button
                  onClick={() => setShowAllMunicipalities(true)}
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Carica altri comuni
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