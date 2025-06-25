"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import { useSectionTranslations } from "@/hooks/useTranslations";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

interface ArticleDestinationBoxProps {
  destinationId: string | number;
  lang: string;
}

const ArticleDestinationBox: React.FC<ArticleDestinationBoxProps> = ({ destinationId, lang }) => {
  const { t } = useSectionTranslations('navigation', lang);
  
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

  // Funzione per tradurre i tipi in base alla lingua corrente
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'region': return t('region') || 'Regione';
      case 'province': return t('province') || 'Provincia';
      case 'municipality': return t('city') || 'Comune';
      default: return 'Destinazione';
    }
  };

  // Costruisci la gerarchia completa delle destinazioni
  const hierarchy = [];
  
  // Logica completamente rivista per costruire la gerarchia completa
  
  // 1. Se abbiamo una regione (sempre in cima alla gerarchia)
  if (region && regionTranslation) {
    hierarchy.push({
      name: regionTranslation.destination_name || regionTranslation.description,
      image: (region as any).image,
      link: `/${lang}/${regionTranslation.slug_permalink}`,
      type: 'region',
      typeLabel: getTypeLabel('region')
    });
  }
  
  // 2. Se abbiamo una provincia (secondo livello)
  if (province && provinceTranslation) {
    hierarchy.push({
      name: provinceTranslation.destination_name || provinceTranslation.description,
      image: (province as any).image,
      link: `/${lang}/${regionTranslation?.slug_permalink}/${provinceTranslation.slug_permalink}`,
      type: 'province',
      typeLabel: getTypeLabel('province')
    });
  }
  
  // 3. Se la destinazione corrente è una municipalità (terzo livello)
  if (destination.type === 'municipality' && destName) {
    let municipalityLink = `/${lang}/${destSlug}`;
    
    // Costruisci il link completo per la municipalità
    if (provinceTranslation?.slug_permalink && regionTranslation?.slug_permalink) {
      municipalityLink = `/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${destSlug}`;
    }
    
    hierarchy.push({
      name: destName,
      image: destImage,
      link: municipalityLink,
      type: destination.type,
      typeLabel: getTypeLabel(destination.type)
    });
  }
  
  // 4. Se la destinazione corrente è una provincia e non l'abbiamo già aggiunta
  if (destination.type === 'province' && destName && !hierarchy.find(h => h.type === 'province')) {
    let provinceLink = `/${lang}/${destSlug}`;
    
    if (regionTranslation?.slug_permalink) {
      provinceLink = `/${lang}/${regionTranslation.slug_permalink}/${destSlug}`;
    }
    
    hierarchy.push({
      name: destName,
      image: destImage,
      link: provinceLink,
      type: destination.type,
      typeLabel: getTypeLabel(destination.type)
    });
  }
  
  // 5. Se la destinazione corrente è una regione e non l'abbiamo già aggiunta
  if (destination.type === 'region' && destName && !hierarchy.find(h => h.type === 'region')) {
    hierarchy.push({
      name: destName,
      image: destImage,
      link: `/${lang}/${destSlug}`,
      type: destination.type,
      typeLabel: getTypeLabel(destination.type)
    });
  }

  return (
    <div className="bg-white rounded-xl">
      
      <div className="rounded-xl bg-gray-50">
        <div className="space-y-3">
          {hierarchy.length > 0 ? hierarchy.map((item, index) => (
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
          )) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              Nessuna destinazione disponibile
            </div>
          )}
        </div>
      </div>
      
      {/* Descrizione della destinazione se disponibile */}
      {destSummary && (
        <div className="p-3 rounded-lg">
          <p className="text-sm text-gray-800 leading-relaxed">
            {destSummary}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleDestinationBox; 