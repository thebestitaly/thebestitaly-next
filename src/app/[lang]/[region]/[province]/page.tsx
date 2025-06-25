// app/[lang]/[region]/[province]/page.tsx

import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from "@/components/widgets/seo-utils";
import { getTranslationsForSection } from '@/lib/translations-server';
import DestinationLayout from "@/components/destinations/DestinationLayout";
import directusClient, { getDestinationHreflang } from '@/lib/directus';

// Genera i metadati lato server (opzionale)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; region: string; province: string }>;
}): Promise<Metadata> {
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
    
    // Get hreflang links
    const hreflangs = destination?.id ? await getDestinationHreflang(destination.id) : {};
    
    // Ensure we have a proper meta description
    const metaDescription = translation?.seo_summary || 
                          `Discover ${translation?.destination_name || province} in ${region}, Italy. The best destinations, attractions, hotels, restaurants and experiences to visit.`;
    
    // Improved schema for province
    const schema = {
      "@context": "https://schema.org",
      "@type": "AdministrativeArea",
      "name": translation?.destination_name || province,
      "description": metaDescription,
      "url": canonicalUrl,
      "containedInPlace": [
        {
          "@type": "AdministrativeArea",
          "name": region,
          "containedInPlace": {
            "@type": "Country",
            "name": "Italy",
            "url": "https://thebestitaly.eu"
          }
        }
      ],
      "geo": destination?.lat && destination?.long ? {
        "@type": "GeoCoordinates",
        "latitude": destination.lat,
        "longitude": destination.long
      } : undefined,
              "image": destination?.image ? `${process.env.NEXT_PUBLIC_APP_URL}/api/directus/assets/${destination.image}?width=400&height=180&fit=cover&quality=50` : undefined,
      "sameAs": Object.values(hreflangs)
    };

    return generateSEO({
      title: `${translation?.seo_title || translation?.destination_name || province} | TheBestItaly`,
      description: metaDescription,
      type: "website",
      canonicalUrl,
      hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
      schema,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Generate proper canonical URL even for fallback using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region, province]);
    
    return generateSEO({
      title: `${province} | TheBestItaly`,
      description: `Discover the best destinations and experiences in ${province}, ${region}, Italy.`,
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