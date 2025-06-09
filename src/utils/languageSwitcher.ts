const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

// Funzione per il magazine
export async function getMagazineLinks(articleId: number) {
  try {
    console.log(`[getMagazineLinks] Fetching for articleId: ${articleId}`);
    const response = await fetch(`${BASE_URL}/items/articles_translations?fields=slug_permalink,languages_code&filter[articles_id][_eq]=${articleId}`);
    const data = await response.json();
    console.log(`[getMagazineLinks] Response data:`, data);

    return data.data.map((translation: any) => ({
      lang: translation.languages_code,
      link: `/${translation.languages_code}/magazine/${translation.slug_permalink}`,
    }));
  } catch (error) {
    console.error(`[getMagazineLinks] Error fetching links:`, error);
    return [];
  }
}

// Funzione per le destinazioni
export async function getDestinationLinks(destinationId: number) {
  try {
    console.log(`[getDestinationLinks] Fetching for destinationId: ${destinationId}`);
    const destinationResponse = await fetch(`${BASE_URL}/items/destinations?fields=region_id,province_id,translations.slug_permalink&filter[id][_eq]=${destinationId}`);
    const destinationData = await destinationResponse.json();
    console.log(`[getDestinationLinks] Destination data:`, destinationData);

    const slugResponse = await fetch(`${BASE_URL}/items/destinations_translations?fields=slug_permalink,languages_code&filter[destinations_id][_eq]=${destinationId}`);
    const slugData = await slugResponse.json();
    console.log(`[getDestinationLinks] Slug data:`, slugData);

    return slugData.data.map((translation: any) => ({
      lang: translation.languages_code,
      link: `/${translation.languages_code}/region/${translation.slug_permalink}`,
    }));
  } catch (error) {
    console.error(`[getDestinationLinks] Error fetching links:`, error);
    return [];
  }
}