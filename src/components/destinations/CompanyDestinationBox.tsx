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
    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {destImage && (
        <img
          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destImage}`}
          alt={destName}
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}
      <div className="font-bold mb-1">{destName}</div>
      <div className="text-sm text-gray-500 mb-2">{destSummary}</div>
      <a
        href={link}
        className="text-blue-600 hover:underline text-sm"
      >
        Vai alla destinazione
      </a>
    </div>
  );
};

export default CompanyDestinationBox; 