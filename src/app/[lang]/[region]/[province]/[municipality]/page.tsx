// app/[lang]/[region]/[province]/[municipality]/page.tsx

import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from "@/components/widgets/seo-utils";
import DestinationLayout from "@/components/destinations/DestinationLayout";
import directusClient, { getDestinationHreflang } from '@/lib/directus';

interface MunicipalityPageProps {
  params: Promise<{
    lang: string;
    region: string;
    province: string;
    municipality: string;
  }>;
}

// Generate metadata for municipality pages
export async function generateMetadata({ params }: MunicipalityPageProps): Promise<Metadata> {
  const { lang, region, province, municipality } = await params;
  
  try {
    // Try to get municipality data from Directus
    let destination;
    try {
      destination = await directusClient.getDestinationBySlug(municipality, lang);
    } catch (error) {
      console.log('Could not fetch destination, using fallback metadata');
    }
    
    const translation = destination?.translations?.[0];
    
    // Generate proper canonical URL for this municipality page using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region, province, municipality]);
    
    // Get hreflang links
    const hreflangs = destination?.id ? await getDestinationHreflang(destination.id) : {};
    
    // Ensure we have a proper meta description
    const metaDescription = translation?.seo_summary || 
                          `Discover ${translation?.destination_name || municipality} in ${province}, ${region}, Italy. Complete guide to the best attractions, hotels, restaurants and local experiences.`;
    
    // Improved schema for municipality/city
    const schema = {
      "@context": "https://schema.org",
      "@type": "City",
      "name": translation?.destination_name || municipality,
      "description": metaDescription,
      "url": canonicalUrl,
      "containedInPlace": [
        {
          "@type": "AdministrativeArea",
          "name": province,
          "containedInPlace": {
            "@type": "AdministrativeArea", 
            "name": region,
            "containedInPlace": {
              "@type": "Country",
              "name": "Italy",
              "url": "https://thebestitaly.eu"
            }
          }
        }
      ],
      "geo": destination?.lat && destination?.long ? {
        "@type": "GeoCoordinates",
        "latitude": destination.lat,
        "longitude": destination.long
      } : undefined,
      "image": destination?.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}` : undefined,
      "sameAs": Object.values(hreflangs)
    };

    return generateSEO({
      title: `${translation?.seo_title || translation?.destination_name || municipality} | TheBestItaly`,
      description: metaDescription,
      type: "website",
      canonicalUrl,
      hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
      schema,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Generate proper canonical URL even for fallback using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region, province, municipality]);
    
    return generateSEO({
      title: `${municipality} | TheBestItaly`,
      description: `Discover the best destinations and experiences in ${municipality}, ${province}, ${region}, Italy.`,
      type: "website",
      canonicalUrl,
    });
  }
}

// Anche questa è un server component
export default async function MunicipalityPage({ params }: MunicipalityPageProps) {
  const { lang, province, municipality } = await params;

  return (
    <DestinationLayout
      slug={municipality}
      lang={lang}
      type="municipality"
      parentSlug={province}
    />
  );
}