import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import directusClient, { getDestinationHreflang } from '@/lib/directus';

interface RegionPageProps {
  params: Promise<{ lang: string; region: string }>;
}

// Generate metadata for region pages with CRITICAL PERFORMANCE OPTIMIZATIONS
export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { lang, region } = await params;
  
  try {
    const destination = await directusClient.getDestinationBySlug(region, lang);
    const translation = destination?.translations?.[0];
    
    // Generate proper canonical URL for this region page using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region]);
    
    // Get hreflang links
    const hreflangs = destination?.id ? await getDestinationHreflang(destination.id) : {};
    
    // Ensure we have a proper meta description
    const metaDescription = translation?.seo_summary || 
                          `Discover ${translation?.destination_name || region}, Italy. Complete travel guide to the best destinations, attractions, hotels, restaurants and authentic Italian experiences.`;
    
    // Improved schema for region
    const schema = {
      "@context": "https://schema.org",
      "@type": "AdministrativeArea",
      "name": translation?.destination_name || region,
      "description": metaDescription,
      "url": canonicalUrl,
      "containedInPlace": {
        "@type": "Country",
        "name": "Italy",
        "url": "https://thebestitaly.eu"
      },
      "geo": destination?.lat && destination?.long ? {
        "@type": "GeoCoordinates",
        "latitude": destination.lat,
        "longitude": destination.long
      } : undefined,
              "image": destination?.image ? `${process.env.NEXT_PUBLIC_APP_URL}/api/directus/assets/${destination.image}?width=400&height=180&fit=cover&quality=50` : undefined,
      "sameAs": Object.values(hreflangs)
    };
    
    return generateSEO({
      title: `${translation?.seo_title || translation?.destination_name || region} | TheBestItaly`,
      description: metaDescription,
      type: 'website',
      canonicalUrl,
      hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
      schema,
    });
  } catch (error) {
    console.error('Error generating metadata for region:', error);
    
    // Generate proper canonical URL even for fallback using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region]);
    
    return generateSEO({
      title: `${region} | TheBestItaly`,
      description: `Discover the best destinations and experiences in ${region}, Italy.`,
      type: 'website',
      canonicalUrl,
    });
  }
}

export default async function RegionPage({ params }: RegionPageProps) {
  // Assicurati di utilizzare `await` per accedere a `params`
  const { lang, region } = await params;

  // Verifica che i parametri siano definiti
  if (!lang || !region) {
    throw new Error("Missing required parameters: lang or region");
  }

  return (
    <DestinationLayout
      slug={region}
      lang={lang}
      type="region"
    />
  );
}