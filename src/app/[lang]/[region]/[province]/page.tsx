// app/[lang]/[region]/[province]/page.tsx

import { generateMetadata as generateSEO, generateCanonicalUrl } from "@/components/widgets/seo-utils";
import { getTranslations } from "@/lib/directus";
import DestinationLayout from "@/components/destinations/DestinationLayout";
import directusClient from '@/lib/directus';

// Genera i metadati lato server (opzionale)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; region: string; province: string }>;
}) {
  const { lang, region, province } = await params;

  try {
    // Try to get province data from Directus
    let destination;
    try {
      destination = await directusClient.getDestinationBySlug(province, lang);
    } catch (error) {
      console.log('Could not fetch destination, using fallback metadata');
    }
    
    const translation = destination?.translations?.[0];
    
    // Generate proper canonical URL for this province page using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region, province]);

    return generateSEO({
      title: `${translation?.seo_title || translation?.destination_name || province} | TheBestItaly`,
      description: translation?.seo_summary || `Discover ${translation?.destination_name || province} - the best destinations and experiences in Italy.`,
      type: "website",
      canonicalUrl,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Generate proper canonical URL even for fallback using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region, province]);
    
    return generateSEO({
      title: `${province} | TheBestItaly`,
      description: `Discover the best destinations and experiences in ${province}, Italy.`,
      type: "website",
      canonicalUrl,
    });
  }
}

// Pagina server component
export default async function ProvincePage({
  params,
}: {
  params: Promise<{ lang: string; region: string; province: string }>;
}) {
  const { lang, region, province } = await params;

  // Eventuale fetch SSR
  // const data = await directusClient.getDestinationBySlug(province, lang);

  return (
    <DestinationLayout
      slug={province}
      lang={lang}
      type="province"
      parentSlug={region}
    />
  );
}