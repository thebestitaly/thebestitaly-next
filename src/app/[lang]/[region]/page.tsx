import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import directusClient, { getDestinationHreflang } from '@/lib/directus';
import { getProvincesForRegion, getDestinationDetails } from '@/lib/static-destinations';
import { Destination } from '@/lib/directus';
import { notFound } from 'next/navigation';

interface RegionPageProps {
  params: {
    lang: string;
    region: string;
  };
}

// Generate metadata for region pages with CRITICAL PERFORMANCE OPTIMIZATIONS
export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { lang, region } = params;
  const destination = await directusClient.getDestinationBySlug(region, lang);
  if (!destination) return generateSEO({ title: "Not Found", description: "This page could not be found." });

  const translation = destination.translations?.[0];
  const canonicalUrl = generateCanonicalUrl(lang, [region]);
  const hreflangs = destination?.id ? await getDestinationHreflang(destination.id) : {};
  const metaDescription = translation?.seo_summary || `Discover ${translation?.destination_name || region}, Italy.`;

  return generateSEO({
    title: `${translation?.seo_title || translation?.destination_name || region} | TheBestItaly`,
    description: metaDescription,
    canonicalUrl,
    hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
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