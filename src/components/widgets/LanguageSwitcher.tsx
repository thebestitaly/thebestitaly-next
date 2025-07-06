"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSupportedLanguages } from "@/lib/directus-web";
import { getFlagImageUrl } from "@/lib/imageUtils";
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
  const currentLang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang || 'it';

  // 🚨 Helper function to get flag URL
  const getFlagUrl = (langCode: string) => {
    return getFlagImageUrl(langCode);
  };

  const getCollectionTypeAndSlug = () => {
    if (!pathname) return null;

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;

    const langIndex = 0;
    const lang = segments[langIndex];

    if (segments[1] === 'magazine') {
      if (segments.length >= 3) {
        return {
          pageType: 'magazine',
          slug: segments[2],
          routeType: 'single'
        };
      }
    }

    return null;
  };

  const pageInfo = getCollectionTypeAndSlug();

  // Query per ottenere le lingue supportate
  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      return SUPPORTED_LANGUAGES.map(lang => ({
        code: lang.code,
        name: lang.nativeName,
        direction: lang.rtl ? 'rtl' : 'ltr'
      }));
    },
    staleTime: Infinity,
  });

  // Query per determinare il tipo di contenuto e ID
  const { data: contentId } = useQuery({
    queryKey: ["contentId", pageInfo?.slug, pageInfo?.pageType],
    queryFn: async () => {
      if (!pageInfo?.slug) return null;

      if (pageInfo.pageType === "magazine") {
        // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
        const params = new URLSearchParams();
        params.append('filter[slug_permalink][_eq]', pageInfo.slug || '');
        params.append('fields[]', 'articles_id');

        const response = await fetch(`/api/directus/items/articles_translations?${params}`);
        const result = await response.json();
        return { type: "magazine", id: result.data?.[0]?.articles_id };
      }

      if (pageInfo.pageType === "poi") {
        // For POI/companies, we use the slug directly since it's the same across languages
        return { type: "poi", slug: pageInfo.slug };
      }

      if (pageInfo.pageType === "destination") {
        const destinationId = pageInfo.slug;
        console.log('Fetching destination details for ID:', destinationId);
        
        // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
        const destinationParams = new URLSearchParams();
        destinationParams.append('fields[]', 'type');
        destinationParams.append('fields[]', 'region_id');
        destinationParams.append('fields[]', 'province_id');

        const destinationResponse = await fetch(`/api/directus/items/destinations/${destinationId}?${destinationParams}`);
        const destinationDetails = await destinationResponse.json();
        console.log('Destination details:', destinationDetails);

        return {
          type: "destination",
          id: destinationId,
          routeType: pageInfo.routeType,
          region_id: destinationDetails.data.region_id,
          province_id: destinationDetails.data.province_id
        };
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
        
        // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
        const params = new URLSearchParams();
        params.append('fields[]', 'type');
        params.append('fields[]', 'region_id');
        params.append('fields[]', 'province_id');
        params.append('fields[]', 'translations.slug_permalink');
        params.append('fields[]', 'translations.languages_code');
        params.append('fields[]', 'region_id.translations.slug_permalink');
        params.append('fields[]', 'region_id.translations.languages_code');
        params.append('fields[]', 'province_id.translations.slug_permalink');
        params.append('fields[]', 'province_id.translations.languages_code');
        params.append('deep[translations][_limit]', '50');
        params.append('deep[region_id.translations][_limit]', '50');
        params.append('deep[province_id.translations][_limit]', '50');

        const response = await fetch(`/api/directus/items/destinations/${contentId.id}?${params}`);
        const result = await response.json();
        console.log('Destination with hierarchy response:', result);

        const destination = result.data;
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
        // 🔧 CLIENT-SIDE: Always use proxy to avoid CORS issues
        const params = new URLSearchParams();
        params.append('filter[articles_id][_eq]', contentId.id?.toString() || '');
        params.append('fields[]', 'languages_code');
        params.append('fields[]', 'slug_permalink');

        const response = await fetch(`/api/directus/items/articles_translations?${params}`);
        const result = await response.json();

        const translations = result.data || [];
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
        // 🚨 TEMPORARY FIX: All language links point to homepage
        // TODO: Later implement proper slug translation from database
        let newPath = `/${language.code}`;

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
                src: getFlagUrl(language.code),
                alt: "",
                fill: true,
                className: 'rounded-sm object-cover',
                sizes: "20px",
                loading: "lazy",
                role: "presentation",
                unoptimized: true // Disabilita l'ottimizzazione Next.js per le bandiere CDN
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
                  direction: language.direction === "rtl" ? "rtl" : "ltr"
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