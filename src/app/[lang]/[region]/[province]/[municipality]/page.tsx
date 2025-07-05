// app/[lang]/[region]/[province]/[municipality]/page.tsx
// 🚀 STATIC GENERATION per tutti i comuni italiani

// 🚀 ISR per tutti i comuni italiani - genera on-demand e cache
export const revalidate = 2592000; // 30 giorni (cambiano solo quando modificati dall'area riservata)

import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import { getMunicipalitiesForProvince, getDestinationDetails } from '@/lib/static-destinations';
import { generateMunicipalityStaticParams, STATIC_GENERATION_CONFIG } from '@/lib/static-generation';
import { Destination } from '@/lib/directus-web';
import directusWebClient from '@/lib/directus-web';
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
  // Usa gli stessi dati statici per consistenza
  const destination = await getDestinationDetails(municipality, lang, 'municipality');
  if (!destination) return generateSEO({ title: "Not Found", description: "This page could not be found." });

  const translation = destination.translations?.[0];
  const canonicalUrl = generateCanonicalUrl(lang, [region, province, municipality]);
  // Per ora non generiamo hreflangs per i dati statici
  const metaDescription = translation?.seo_summary || `Discover ${translation?.destination_name || municipality}, Italy.`;

  return generateSEO({
    title: `${translation?.seo_title || translation?.destination_name || municipality} | TheBestItaly`,
    description: metaDescription,
    canonicalUrl,
    hreflangs: undefined, // Temporaneamente disabilitato per i dati mock
  });
}

export default async function MunicipalityPage({ params: { lang, region, province, municipality } }: { params: { lang: string, region: string, province: string, municipality: string } }) {
  const municipalityDetails = await getDestinationDetails(municipality, lang, 'municipality') as Destination | null;

  if (!municipalityDetails) {
    notFound();
  }
  
  // 🚀 SERVER-SIDE DATA FETCHING: Fetch companies and articles for this destination
  const [companies, articles, relatedMunicipalities] = await Promise.all([
    // Get companies for this municipality
    directusWebClient.getCompanies({
      lang,
      destination_id: municipalityDetails.id,
      fields: 'full',
      limit: 20
    }),
    // Get articles for this municipality
    directusWebClient.getArticles({
      lang,
      destination_id: municipalityDetails.id,
      fields: 'sidebar',
      limit: 10
    }),
    // Get related municipalities
    (async () => {
      const provinceId = municipalityDetails.province_id?.id;
      if (!provinceId) return [];
      
      const allMunicipalities = await getMunicipalitiesForProvince(provinceId, lang) || [];
      return allMunicipalities
        .filter(m => m.id !== municipalityDetails.id)
        .map((m: Destination) => ({
          id: m.id,
          name: m.translations[0]?.destination_name || '',
          slug: m.translations[0]?.slug_permalink || '',
        }));
    })()
  ]);

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
      sidebarData={{
        companies: Array.isArray(companies) ? companies : [],
        articles: Array.isArray(articles) ? articles : []
      }}
    />
  );
}