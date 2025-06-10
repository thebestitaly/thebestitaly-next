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

  // Ricostruisci lo slug completo in base al tipo
  let link = `/${lang}/${destSlug}`;
  if (destination.type === "province" && destination.region_id?.translations?.[0]?.slug_permalink) {
    link = `/${lang}/${destination.region_id.translations[0].slug_permalink}/${destSlug}`;
  } else if (
    destination.type === "municipality" &&
    destination.province_id?.translations?.[0]?.slug_permalink &&
    destination.region_id?.translations?.[0]?.slug_permalink
  ) {
    link = `/${lang}/${destination.region_id.translations[0].slug_permalink}/${destination.province_id.translations[0].slug_permalink}/${destSlug}`;
  }
  console.log('DEST LINK:', link);

  return (
    <a
      href={link}
      className="block rounded-2xl p-6 hover:bg-gray-50 transition-colors duration-200 group"
    >
      <div className="relative">
        {destImage && (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
            <img
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destImage}`}
              alt={destName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <h4 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
          {destName}
        </h4>
      </div>
    </a>
  );
};

export default CompanyDestinationBox; 