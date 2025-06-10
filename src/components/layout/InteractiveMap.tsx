import React from 'react';
import Link from 'next/link';

interface RegionPath {
  id: string;
  name: string;
  slug: string;
  path: string;
}

interface InteractiveMapProps {
  lang: string;
  destinations: any[];
  hoveredRegion?: string | null;
  onRegionHover?: (regionSlug: string | null) => void;
  onRegionClick?: (regionSlug: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  lang, 
  destinations, 
  hoveredRegion, 
  onRegionHover, 
  onRegionClick 
}) => {
  // Regioni italiane semplificate ma realistiche con path corretti
  const regionPaths: RegionPath[] = [
    {
      id: 'piemonte',
      name: 'Piemonte',
      slug: 'piemonte',
      path: 'M60,80 L100,75 L110,100 L120,120 L100,140 L80,130 L50,110 Z'
    },
    {
      id: 'lombardia',
      name: 'Lombardia',
      slug: 'lombardia', 
      path: 'M100,75 L140,70 L150,90 L145,110 L120,120 L110,100 Z'
    },
    {
      id: 'veneto',
      name: 'Veneto',
      slug: 'veneto',
      path: 'M150,90 L180,85 L185,105 L175,125 L150,120 L145,110 Z'
    },
    {
      id: 'liguria',
      name: 'Liguria',
      slug: 'liguria',
      path: 'M80,130 L120,120 L125,140 L85,145 Z'
    },
    {
      id: 'emilia-romagna',
      name: 'Emilia-Romagna',
      slug: 'emilia-romagna',
      path: 'M120,120 L175,125 L170,145 L125,140 Z'
    },
    {
      id: 'toscana',
      name: 'Toscana',
      slug: 'toscana',
      path: 'M85,145 L125,140 L130,170 L120,190 L90,185 Z'
    },
    {
      id: 'umbria',
      name: 'Umbria',
      slug: 'umbria',
      path: 'M125,140 L150,135 L155,160 L130,170 Z'
    },
    {
      id: 'marche',
      name: 'Marche',
      slug: 'marche',
      path: 'M150,135 L175,130 L180,155 L155,160 Z'
    },
    {
      id: 'lazio',
      name: 'Lazio',
      slug: 'lazio',
      path: 'M120,190 L155,160 L160,190 L140,210 L110,205 Z'
    },
    {
      id: 'abruzzo',
      name: 'Abruzzo',
      slug: 'abruzzo',
      path: 'M155,160 L180,155 L185,180 L160,190 Z'
    },
    {
      id: 'campania',
      name: 'Campania',
      slug: 'campania',
      path: 'M140,210 L160,190 L165,220 L145,235 L125,230 Z'
    },
    {
      id: 'puglia',
      name: 'Puglia',
      slug: 'puglia',
      path: 'M160,190 L185,180 L195,220 L180,240 L165,220 Z'
    },
    {
      id: 'basilicata',
      name: 'Basilicata',
      slug: 'basilicata',
      path: 'M145,235 L165,220 L175,245 L155,255 Z'
    },
    {
      id: 'calabria',
      name: 'Calabria',
      slug: 'calabria',
      path: 'M155,255 L175,245 L170,285 L150,280 Z'
    },
    {
      id: 'sicilia',
      name: 'Sicilia',
      slug: 'sicilia',
      path: 'M130,290 L190,285 L185,315 L125,320 Z'
    },
    {
      id: 'sardegna',
      name: 'Sardegna',
      slug: 'sardegna',
      path: 'M40,180 L65,175 L70,240 L45,245 Z'
    }
  ];

  const getDestinationBySlug = (slug: string) => {
    return destinations.find(dest => 
      dest.translations?.[0]?.slug_permalink === slug
    );
  };

  return (
    <div className="w-full h-full">
      <svg
        viewBox="0 0 220 340"
        className="w-full h-full"
        style={{ maxHeight: '250px' }}
      >
        {/* Sfondo mare */}
        <rect width="220" height="340" fill="#f0f8ff" />
        
        {/* Regioni italiane */}
        {regionPaths.map((region) => {
          const destination = getDestinationBySlug(region.slug);
          const isAvailable = !!destination;
          const isHovered = hoveredRegion === region.slug;
          
          if (!isAvailable) {
            return (
              <path
                key={region.id}
                d={region.path}
                fill="#e5e7eb"
                stroke="#d1d5db"
                strokeWidth="1"
                className="cursor-not-allowed opacity-60"
              />
            );
          }

          return (
            <Link key={region.id} href={`/${lang}/${region.slug}/`}>
              <path
                d={region.path}
                fill={isHovered ? "#1d4ed8" : "#93c5fd"}
                stroke="#2563eb"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:fill-blue-700"
                onMouseEnter={() => onRegionHover?.(region.slug)}
                onMouseLeave={() => onRegionHover?.(null)}
              />
            </Link>
          );
        })}
      </svg>
    </div>
  );
};

export default InteractiveMap;