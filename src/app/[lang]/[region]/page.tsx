import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import directusClient from '@/lib/directus';

interface RegionPageProps {
  params: Promise<{ lang: string; region: string }>;
}

// Generate metadata for region pages
export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { lang, region } = await params;
  
  try {
    const destination = await directusClient.getDestinationBySlug(region, lang);
    const translation = destination?.translations?.[0];
    
    // Generate proper canonical URL for this region page using helper
    const canonicalUrl = generateCanonicalUrl(lang, [region]);
    
    return generateSEO({
      title: `${translation?.seo_title || translation?.destination_name || region} | TheBestItaly`,
      description: translation?.seo_summary || `Discover ${translation?.destination_name || region} - the best destinations and experiences in Italy.`,
      type: 'website',
      canonicalUrl,
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