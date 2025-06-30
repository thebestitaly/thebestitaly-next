// 🚀 ISR per tutte le regioni italiane - genera on-demand e cache
export const revalidate = 2592000; // 30 giorni (cambiano solo quando modificate dall'area riservata)

import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import { getProvincesForRegion, getDestinationDetails } from '@/lib/static-destinations';
import { generateRegionStaticParams, STATIC_GENERATION_CONFIG } from '@/lib/static-generation';
import { Destination } from '@/lib/directus';
import { notFound } from 'next/navigation';

interface RegionPageProps {
  params: {
    lang: string;
    region: string;
  };
}

// 🚀 STATIC GENERATION: Pre-genera tutte le regioni italiane
export async function generateStaticParams() {
  console.log('🏗️ Generating static params for region pages...');
  
  try {
    const params = await generateRegionStaticParams();
    console.log(`✅ Generated ${params.length} region static params`);
    
    return params.map(param => ({
      lang: param.lang,
      region: param.region,
    }));
  } catch (error) {
    console.error('❌ Error generating region static params:', error);
    // Fallback: genera almeno le lingue principali per evitare crash
    return STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES.map(lang => ({
      lang,
      region: 'lombardia',
    }));
  }
}

// Generate metadata for region pages - STATIC VERSION
export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { lang, region } = params;
  // Usa gli stessi dati statici per consistenza
  const destination = await getDestinationDetails(region, lang, 'region');
  if (!destination) return generateSEO({ title: "Not Found", description: "This page could not be found." });

  const translation = destination.translations?.[0];
  const canonicalUrl = generateCanonicalUrl(lang, [region]);
  // Per ora non generiamo hreflangs per i dati statici
  const metaDescription = translation?.seo_summary || `Discover ${translation?.destination_name || region}, Italy.`;

  return generateSEO({
    title: `${translation?.seo_title || translation?.destination_name || region} | TheBestItaly`,
    description: metaDescription,
    canonicalUrl,
    hreflangs: undefined, // Temporaneamente disabilitato per i dati mock
  });
}

export default async function RegionPage({ params: { lang, region } }: { params: { lang: string, region: string } }) {
  const regionDetails = await getDestinationDetails(region, lang, 'region') as Destination | null;

  if (!regionDetails) {
    notFound();
  }

  const provinces = await getProvincesForRegion(regionDetails.id, lang) || [];
  
  const lightProvinces = provinces.map(p => ({
    id: p.id,
    name: p.translations[0]?.destination_name || '',
    slug: p.translations[0]?.slug_permalink || '',
  }));

  const breadcrumbs = [
    { name: regionDetails.translations[0]?.destination_name || region, href: `/${lang}/${region}` },
  ];

  const regionName = regionDetails.translations[0]?.destination_name || region;

  return (
    <DestinationLayout
      lang={lang}
      destination={regionDetails}
      destinations={lightProvinces}
      title={`Scopri la regione ${regionName}`}
      description={`Esplora le province e le meraviglie della regione ${regionName}.`}
      breadcrumbs={breadcrumbs}
      destinationType="region"
      sidebarData={null}
    />
  );
}