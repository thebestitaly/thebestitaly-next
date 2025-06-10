"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import directusClient from "../../lib/directus";

interface DestinationSidebarProps {
  currentDestinationId: string;
  regionSlug: string;
  provinceSlug: string;
  currentSlug: string;
  provinceId?: string; // L'ID della provincia può essere opzionale
  lang: string;
  type: "region" | "province" | "municipality";
}

const DestinationSidebar: React.FC<DestinationSidebarProps> = ({
  currentDestinationId,
  regionSlug,
  provinceSlug,
  currentSlug,
  provinceId,
  lang,
  type,
}) => {
  
  // Funzione per ottenere le destinazioni correlate in base al tipo
  const fetchDestinations = async () => {
    try {
      
      switch (type) {
        case "region":
          return await directusClient.getDestinations({
            type: "province",
            region_id: currentDestinationId,
            lang,
          });

        case "province":
          return await directusClient.getDestinations({
            type: "municipality",
            province_id: currentDestinationId,
            lang,
          });

        case "municipality":
          return await directusClient.getDestinations({
            type: "municipality",
            province_id: provinceId,
            exclude_id: currentDestinationId,
            lang,
          });
        
        default:
          console.warn("Unknown type:", type);
          return [];
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return [];
    }
  };

  // Query per ottenere le destinazioni correlate
  const { data: relatedDestinations, isLoading } = useQuery({
    queryKey: ["related-destinations", currentDestinationId, type, lang],
    queryFn: fetchDestinations,
    enabled: !!currentDestinationId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!relatedDestinations?.length) {
    return null;
  }

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

  return (
    <div >
      <h3 className="text-lg font-bold mb-4">
        {type === "region" ? "Province" : type === "province" ? "Comuni" : "Altri Comuni"}
      </h3>

      <div className="space-y-3">
        {relatedDestinations.map((destination: any) => {
          const translation = destination.translations?.[0];
          
          return (
            <Link
              key={destination.id}
              href={generateLink(destination)}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {destination.image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`}
                    alt={translation?.destination_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  {translation?.destination_name}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DestinationSidebar;