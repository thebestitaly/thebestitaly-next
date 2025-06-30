// app/[lang]/[region]/[province]/[municipality]/page.tsx

import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import directusClient, { getDestinationHreflang } from '@/lib/directus';
import { getMunicipalitiesForProvince, getDestinationDetails } from '@/lib/static-destinations';
import { Destination } from '@/lib/directus';
import { notFound } from 'next/navigation';

interface MunicipalityPageProps {
  params: {
    lang: string;
    region: string;
    province: string;
    municipality: string;
  };
}

// Generate metadata for municipality pages
export async function generateMetadata({ params }: MunicipalityPageProps): Promise<Metadata> {
  const { lang, region, province, municipality } = params;
  const destination = await directusClient.getDestinationBySlug(municipality, lang);
  if (!destination) return generateSEO({ title: "Not Found", description: "This page could not be found." });

  const translation = destination.translations?.[0];
  const canonicalUrl = generateCanonicalUrl(lang, [region, province, municipality]);
  const hreflangs = destination?.id ? await getDestinationHreflang(destination.id) : {};
  const metaDescription = translation?.seo_summary || `Discover ${translation?.destination_name || municipality}, Italy.`;

  return generateSEO({
    title: `${translation?.seo_title || translation?.destination_name || municipality} | TheBestItaly`,
    description: metaDescription,
    canonicalUrl,
    hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
  });
}

export default async function MunicipalityPage({ params: { lang, region, province, municipality } }: { params: { lang: string, region: string, province: string, municipality: string } }) {
  const municipalityDetails = await getDestinationDetails(municipality, lang, 'municipality') as Destination | null;

  if (!municipalityDetails) {
    notFound();
  }
  
  // Per i comuni, carichiamo gli altri comuni della stessa provincia per la sidebar
  const provinceId = municipalityDetails.province_id?.id;
  let relatedMunicipalities: { id: string; name: string; slug: string; }[] = [];
  if (provinceId) {
      const allMunicipalities = await getMunicipalitiesForProvince(provinceId, lang) || [];
      // Escludiamo il comune corrente dalla lista
      relatedMunicipalities = allMunicipalities
        .filter(m => m.id !== municipalityDetails.id)
        .map((m: Destination) => ({
            id: m.id,
            name: m.translations[0]?.destination_name || '',
            slug: m.translations[0]?.slug_permalink || '',
        }));
  }

  const breadcrumbs = [
    { name: region, href: `/${lang}/${region}` },
    { name: province, href: `/${lang}/${region}/${province}` },
    { name: municipalityDetails.translations[0]?.destination_name || municipality, href: `/${lang}/${region}/${province}/${municipality}` },
  ];
  
  const municipalityName = municipalityDetails.translations[0]?.destination_name || municipality;

  return (
    <DestinationLayout
      lang={lang}
      destination={municipalityDetails}
      destinations={relatedMunicipalities}
      title={`Scopri ${municipalityName}`}
      description={`Esplora le meraviglie e le attrazioni di ${municipalityName}.`}
      breadcrumbs={breadcrumbs}
      destinationType="municipality"
      sidebarData={null}
    />
  );
}