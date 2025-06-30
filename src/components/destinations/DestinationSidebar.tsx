"use client";
import React from "react";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { DirectusItem, Destination } from "@/lib/directus";

interface DestinationSidebarProps {
  destinations: { id: string; name: string; slug: string }[];
  title: string;
  lang: string;
  currentDestinationId: string;
  regionSlug?: string;
  provinceSlug?: string;
  destinationType: "region" | "province" | "municipality";
}

// Componente per renderizzare una singola destinazione nella sidebar
const DestinationItem: React.FC<{
  destination: DirectusItem;
  link: string;
}> = ({ destination, link }) => {
  const translation = destination.translations?.[0];
  if (!translation) return null;

  return (
    <Link
      href={link}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
    >
      {destination.image && (
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={getOptimizedImageUrl(destination.image, "THUMBNAIL")}
            alt={translation.destination_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm">
          {translation.destination_name}
        </h4>
      </div>
    </Link>
  );
};

// Sezione della Sidebar (es. "Regione", "Altre Province")
const SidebarSection: React.FC<{
  title: string;
  items?: DirectusItem[];
  generateLink: (item: DirectusItem) => string;
}> = ({ title, items, generateLink }) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <DestinationItem
            key={item.id}
            destination={item}
            link={generateLink(item)}
          />
        ))}
      </div>
    </div>
  );
};

const DestinationSidebar: React.FC<DestinationSidebarProps> = ({
  destinations,
  title,
  lang,
  currentDestinationId,
  regionSlug,
  provinceSlug,
  destinationType
}) => {
  if (!destinations || destinations.length === 0) {
    return (
        <div className="p-4 rounded-lg bg-gray-50 text-center">
            <p className="text-sm text-gray-500">Nessuna destinazione correlata trovata.</p>
        </div>
    );
  }
  
  const generateLink = (dest: { slug: string }): string => {
    switch (destinationType) {
      case 'region': // Mostra province
        return `/${lang}/${regionSlug}/${dest.slug}`;
      case 'province': // Mostra comuni
        return `/${lang}/${regionSlug}/${provinceSlug}/${dest.slug}`;
      case 'municipality': // Mostra altri comuni
        return `/${lang}/${regionSlug}/${provinceSlug}/${dest.slug}`;
      default:
        return '#';
    }
  };

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <div className="space-y-2">
          {destinations.map((item) => (
             <Link
                key={item.id}
                href={generateLink(item)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {item.name}
                  </h4>
                </div>
              </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationSidebar;