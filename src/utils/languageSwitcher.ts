const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

interface Translation {
  languages_code: string;
  slug_permalink: string;
}

interface TranslationLink {
  lang: string;
  link: string;
}

// Funzione per il magazine
export async function getMagazineLinks(articleId: number): Promise<TranslationLink[]> {
  try {
    console.log(`[getMagazineLinks] Fetching for articleId: ${articleId}`);
    const response = await fetch(`${BASE_URL}/items/articles_translations?fields=slug_permalink,languages_code&filter[articles_id][_eq]=${articleId}`);
    const data = await response.json();
    console.log(`[getMagazineLinks] Response data:`, data);

    return data.data.map((translation: Translation) => ({
      lang: translation.languages_code,
      link: `/${translation.languages_code}/magazine/${translation.slug_permalink}`,
    }));
  } catch (error) {
    console.error(`[getMagazineLinks] Error fetching links:`, error);
    return [];
  }
}

// Funzione per le destinazioni - OTTIMIZZATA: 1 query invece di 2
export async function getDestinationLinks(destinationId: number): Promise<TranslationLink[]> {
  try {
    console.log(`[getDestinationLinks] Fetching for destinationId: ${destinationId}`);
    
    // 🚀 UNA SOLA QUERY invece di 2 - MA con i campi necessari per costruire gli URL
    const response = await fetch(`${BASE_URL}/items/destinations?fields=type,region_id,province_id,translations.slug_permalink,translations.languages_code,region_id.translations.slug_permalink,province_id.translations.slug_permalink&filter[id][_eq]=${destinationId}&deep[translations][_limit]=50`);
    const data = await response.json();
    console.log(`[getDestinationLinks] Optimized data:`, data);

    const destination = data.data?.[0];
    if (!destination?.translations) {
      console.warn(`[getDestinationLinks] No translations found for destination ${destinationId}`);
      return [];
    }

    return destination.translations.map((translation: Translation) => {
      const { type } = destination;
      let link = '';
      
      if (type === 'region') {
        // Regioni: /{lang}/{region_slug}
        link = `/${translation.languages_code}/${translation.slug_permalink}`;
      } else if (type === 'province') {
        // Province: /{lang}/{region_slug}/{province_slug}  
        const regionSlug = destination.region_id?.translations?.find((t: any) => t.languages_code === translation.languages_code)?.slug_permalink;
        link = `/${translation.languages_code}/${regionSlug}/${translation.slug_permalink}`;
      } else if (type === 'municipality') {
        // Municipality: /{lang}/{region_slug}/{province_slug}/{municipality_slug}
        const regionSlug = destination.region_id?.translations?.find((t: any) => t.languages_code === translation.languages_code)?.slug_permalink;
        const provinceSlug = destination.province_id?.translations?.find((t: any) => t.languages_code === translation.languages_code)?.slug_permalink;
        link = `/${translation.languages_code}/${regionSlug}/${provinceSlug}/${translation.slug_permalink}`;
      }
      
      return {
        lang: translation.languages_code,
        link: link || `/${translation.languages_code}/region/${translation.slug_permalink}`, // fallback
      };
    });
  } catch (error) {
    console.error(`[getDestinationLinks] Error fetching links:`, error);
    return [];
  }
}