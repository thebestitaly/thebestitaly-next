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
    <div className="p-2">
      <h3 className="text-lg font-bold mb-4">
        {type === "region" ? "Province" : type === "province" ? "Comuni" : "Altri Comuni"}
      </h3>

      {relatedDestinations.map((destination: any) => {
        const translation = destination.translations?.[0];
        
        return (
          <Link
            key={destination.id}
            href={generateLink(destination)}
            className="block border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 mb-4"
          >
            <div>
              {destination.image && (
                <img
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}`}
                  alt={translation?.destination_name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              )}
              <div className="content p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {translation?.destination_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {translation?.seo_summary || "Explore this destination"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default DestinationSidebar;