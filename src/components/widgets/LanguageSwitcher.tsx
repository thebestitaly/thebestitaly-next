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
        console.log('Fetching destination translations with hierarchy');
        
        // 🚀 OTTIMIZZATA: Una sola query che prende tutti i dati necessari per costruire gli URL gerarchici
        const response = await directusClient.get(`/items/destinations/${contentId.id}`, {
          params: {
            fields: [
              'type', 'region_id', 'province_id',
              'translations.slug_permalink', 'translations.languages_code',
              'region_id.translations.slug_permalink', 'region_id.translations.languages_code',
              'province_id.translations.slug_permalink', 'province_id.translations.languages_code'
            ],
            'deep[translations][_limit]': 50,
            'deep[region_id.translations][_limit]': 50,
            'deep[province_id.translations][_limit]': 50,
          },
        });
        console.log('Destination with hierarchy response:', response.data);

        const destination = response.data?.data;
        if (!destination?.translations) {
          console.warn(`No translations found for destination ${contentId.id}`);
          return {};
        }

        // Costruisci i link gerarchici corretti per ogni lingua
        const linkMap: Record<string, string> = {};
        destination.translations.forEach((translation: any) => {
          const { type } = destination;
          let link = '';
          
          if (type === 'region') {
            // Regioni: /{lang}/{region_slug}
            link = `/${translation.languages_code}/${translation.slug_permalink}`;
          } else if (type === 'province') {
            // Province: /{lang}/{region_slug}/{province_slug}  
            const regionSlug = destination.region_id?.translations?.find((t: any) => t.languages_code === translation.languages_code)?.slug_permalink;
            if (regionSlug) {
              link = `/${translation.languages_code}/${regionSlug}/${translation.slug_permalink}`;
            }
          } else if (type === 'municipality') {
            // Municipality: /{lang}/{region_slug}/{province_slug}/{municipality_slug}
            const regionSlug = destination.region_id?.translations?.find((t: any) => t.languages_code === translation.languages_code)?.slug_permalink;
            const provinceSlug = destination.province_id?.translations?.find((t: any) => t.languages_code === translation.languages_code)?.slug_permalink;
            if (regionSlug && provinceSlug) {
              link = `/${translation.languages_code}/${regionSlug}/${provinceSlug}/${translation.slug_permalink}`;
            }
          }
          
          if (link) {
            linkMap[translation.languages_code] = link;
          }
        });
        
        return linkMap;
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
          const destinationLink = translatedSlugs?.[language.code];
          if (destinationLink) {
            // Per le destinazioni, translatedSlugs ora contiene già il link completo
            newPath = destinationLink;
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
                className: 'relative w-5 h-4 flex-shrink-0 mr-3 ml-1 mb-1'
              },
              React.createElement(Image, {
                src: `/images/flags/${language.code}.svg`,
                alt: "",
                fill: true,
                className: 'rounded-sm object-cover',
                sizes: "20px",
                loading: "lazy",
                role: "presentation"
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