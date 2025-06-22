"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import directusClient from "../../lib/directus";
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "@/lib/languages";

interface Language {
  code: string;
  name: string;
  direction: string;
}
interface LanguageSwitcherProps {
  isDestination?: boolean;
  type?: 'region' | 'province' | 'municipality' | null;
}
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  isDestination = false,
  type = null
}) => {
  const params = useParams();
  const pathname = usePathname();
  const currentLang = (params?.lang as string) || "it";

  const getCollectionTypeAndSlug = () => {
    if (!pathname) return null;
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;
    const [, pageType, ...restSegments] = pathParts;

    if (isDestination) {
      console.log('Destination route detected:', { type, pathParts });
      return { 
        pageType: 'destinations',
        routeType: type,
        slug: restSegments[restSegments.length - 1],
        isDestination: true 
      };
    }

    return { 
      pageType, 
      slug: restSegments[0],
      isDestination: false 
    };
  };

  const pageInfo = getCollectionTypeAndSlug();
  
  // Usa le lingue unificate - ESATTAMENTE 50 lingue!
  const languages = SUPPORTED_LANGUAGES.map(lang => ({
    code: lang.code,
    name: lang.nativeName, // USA IL NOME NATIVO
    direction: lang.rtl ? 'rtl' : 'ltr'
  }));

  // Query per ottenere l'ID del contenuto
  const { data: contentId } = useQuery({
    queryKey: ["contentId", pathname, currentLang],
    queryFn: async () => {
      if (!pageInfo?.slug) return null;

      if (pageInfo.isDestination) {
        console.log('Fetching destination ID for slug:', pageInfo.slug);
        // Prima troviamo l'ID della destinazione dallo slug
        const response = await directusClient.get("/items/destinations_translations", {
          params: {
            filter: { slug_permalink: { _eq: pageInfo.slug } },
            fields: ["destinations_id"],
          },
        });
        console.log('Destination translation response:', response.data);

        const destinationId = response.data?.data?.[0]?.destinations_id;
        if (!destinationId) return null;

        // Poi prendiamo i dettagli della destinazione
        const destinationDetails = await directusClient.get(`/items/destinations/${destinationId}`, {
          params: {
            fields: ["id", "region_id", "province_id"],
          },
        });
        console.log('Destination details:', destinationDetails.data);

        return {
          type: "destination",
          id: destinationId,
          routeType: pageInfo.routeType,
          region_id: destinationDetails.data.data.region_id,
          province_id: destinationDetails.data.data.province_id
        };
      }

      if (pageInfo.pageType === "magazine") {
        const response = await directusClient.get("/items/articles_translations", {
          params: {
            filter: { slug_permalink: { _eq: pageInfo.slug } },
            fields: ["articles_id"],
          },
        });
        return { type: "magazine", id: response.data?.data?.[0]?.articles_id };
      }

      if (pageInfo.pageType === "poi") {
        // For POI/companies, we use the slug directly since it's the same across languages
        return { type: "poi", slug: pageInfo.slug };
      }

      return null;
    },
    enabled: !!pageInfo?.slug,
  });

  // Query per ottenere le traduzioni
  const { data: translatedSlugs } = useQuery({
    queryKey: ["translatedSlugs", contentId],
    queryFn: async () => {
      if (!contentId) return {};

      if (contentId.type === "destination") {
        console.log('Fetching destination translations');
        // Seleziona l'ID appropriato in base al tipo di route
        const targetId = contentId.routeType === 'region' ? contentId.region_id :
                        contentId.routeType === 'province' ? contentId.province_id :
                        contentId.id;

        console.log('Using target ID for translations:', targetId);
        const response = await directusClient.get("/items/destinations_translations", {
          params: {
            filter: { destinations_id: { _eq: targetId } },
            fields: ["languages_code", "slug_permalink"],
          },
        });
        console.log('Destination translations response:', response.data);

        const translations = response.data?.data || [];
        const slugMap: Record<string, string> = {};
        translations.forEach((translation: any) => {
          slugMap[translation.languages_code] = translation.slug_permalink;
        });
        return slugMap;
      }

      if (contentId.type === "magazine") {
        const response = await directusClient.get("/items/articles_translations", {
          params: {
            filter: { articles_id: { _eq: contentId.id } },
            fields: ["languages_code", "slug_permalink"],
          },
        });

        const translations = response.data?.data || [];
        const slugMap: Record<string, string> = {};
        translations.forEach((translation: any) => {
          slugMap[translation.languages_code] = translation.slug_permalink;
        });
        return slugMap;
      }

      if (contentId.type === "poi" && contentId.slug) {
        // For POI/companies, the slug is the same across all languages
        // We just return the same slug for all languages
        const slugMap: Record<string, string> = {};
        const supportedLangs = ['it', 'en', 'fr', 'de', 'es', 'pt', 'nl', 'ro', 'sv', 'pl'];
        supportedLangs.forEach(lang => {
          slugMap[lang] = contentId.slug;
        });
        return slugMap;
      }

      return {};
    },
    enabled: !!contentId,
  });

  if (!languages) return null;

  return React.createElement(
    'div',
    { 
      className: 'max-w-7xl mx-auto py-8',
      id: 'languages'
    },
    React.createElement(
      'div',
      { className: 'flex flex-wrap gap-2' },
      languages.map((language) => {
        let newPath;
        
        if (!pageInfo || !pageInfo.pageType) {
          newPath = `/${language.code}`;
        } else if (pageInfo.isDestination) {
          const slug = translatedSlugs?.[language.code];
          if (slug) {
            newPath = `/${language.code}/${pageInfo.routeType}/${slug}`;
          } else {
            newPath = pathname ? `/${language.code}${pathname.substring(currentLang.length + 1)}` : `/${language.code}`;
          }
        } else if (pageInfo.pageType === 'magazine' && translatedSlugs) {
          const slug = translatedSlugs[language.code];
          if (slug) {
            newPath = `/${language.code}/magazine/${slug}`;
          } else {
            newPath = `/${language.code}/magazine/${pageInfo.slug}`;
          }
        } else if (pageInfo.pageType === 'poi' && translatedSlugs) {
          const slug = translatedSlugs[language.code];
          if (slug) {
            newPath = `/${language.code}/poi/${slug}`;
          } else {
            newPath = `/${language.code}/poi/${pageInfo.slug}`;
          }
        } else {
          newPath = pathname ? `/${language.code}${pathname.substring(currentLang.length + 1)}` : `/${language.code}`;
        }

        const isCurrentLang = currentLang === language.code;

        return React.createElement(
          'a',
          {
            key: language.code,
            href: newPath,
            className: `flex items-center hover:bg-gray-100 rounded-md px-2 py-1 transition-colors duration-200 ${
              isCurrentLang ? "bg-gray-100 pointer-events-none text-black" : "hover:bg-blue-50 text-black"
            }`
          },
          [
            React.createElement(
              'div',
              {
                key: 'flag',
                className: 'relative w-4 h-4 flex-shrink-0 mr-3 ml-1 mb-1'
              },
              React.createElement(Image, {
                src: `/images/flags/${language.code}.svg`,
                alt: "",
                fill: true,
                className: 'rounded-sm object-cover',
                sizes: "14px"
              })
            ),
            React.createElement(
              'span',
              {
                key: 'text',
                className: `text-xs whitespace-nowrap hover:text-gray-900 ${
                  isCurrentLang ? "text-gray-900" : "text-white"
                }`,
                style: {
                  direction: language.direction === "RTL" ? "rtl" : "ltr"
                }
              },
              language.name
            )
          ]
        );
      })
    )
  );
};

export default LanguageSwitcher;