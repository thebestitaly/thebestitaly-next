// app/[lang]/[region]/[province]/page.tsx
// 🚀 STATIC GENERATION per tutte le province italiane

// 🚀 ISR per tutte le province italiane - genera on-demand e cache
export const revalidate = 2592000; // 30 giorni (cambiano solo quando modificate dall'area riservata)

import DestinationLayout from "@/components/destinations/DestinationLayout";
import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import { getMunicipalitiesForProvince, getDestinationDetails } from '@/lib/static-destinations';
import { generateProvinceStaticParams, STATIC_GENERATION_CONFIG } from '@/lib/static-generation';
import { Destination } from '@/lib/directus';
import { notFound } from 'next/navigation';

interface ProvincePageProps {
  params: {
    lang: string;
    region: string;
    province: string;
  };
}

// 🚀 STATIC GENERATION: Pre-genera tutte le province italiane
// export async function generateStaticParams() {
//   console.log('🏗️ Generating static params for province pages...');
  
//   try {
//     const params = await generateProvinceStaticParams();
//     console.log(`✅ Generated ${params.length} province static params`);
    
//     return params.map(param => ({
//       lang: param.lang,
//       region: param.region,
//       province: param.province!,
//     }));
//   } catch (error) {
//     console.error('❌ Error generating province static params:', error);
//     // Fallback: genera almeno le lingue principali per evitare crash
//     return STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES.map(lang => ({
//       lang,
//       region: 'lombardia',
//       province: 'milano',
//     }));
//   }
// }

export async function generateMetadata({ params }: ProvincePageProps): Promise<Metadata> {
  const { lang, region, province } = params;
  // Usa gli stessi dati statici per consistenza
  const destination = await getDestinationDetails(province, lang, 'province');
  if (!destination) return generateSEO({ title: "Not Found", description: "This page could not be found." });

  const translation = destination.translations?.[0];
  const canonicalUrl = generateCanonicalUrl(lang, [region, province]);
  // Per ora non generiamo hreflangs per i dati statici
  const metaDescription = translation?.seo_summary || `Discover ${translation?.destination_name || province}, Italy.`;

  return generateSEO({
    title: `${translation?.seo_title || translation?.destination_name || province} | TheBestItaly`,
    description: metaDescription,
    canonicalUrl,
    hreflangs: undefined, // Temporaneamente disabilitato per i dati mock
  });
}

export default async function ProvincePage({ params: { lang, region, province } }: { params: { lang: string, region: string, province: string } }) {
  const provinceDetails = await getDestinationDetails(province, lang, 'province') as Destination | null;

  if (!provinceDetails) {
    console.warn(`Dettagli non trovati per la provincia: ${province} (${lang})`);
    notFound();
  }
  
  const municipalities = await getMunicipalitiesForProvince(provinceDetails.id, lang) || [];
  
  const lightMunicipalities = municipalities.map(m => ({
    id: m.id,
    name: m.translations[0]?.destination_name || '',
    slug: m.translations[0]?.slug_permalink || '',
  }));

  const breadcrumbs = [
    { name: region, href: `/${lang}/${region}` },
    { name: provinceDetails.translations[0]?.destination_name || province, href: `/${lang}/${region}/${province}` },
  ];
  
  const provinceName = provinceDetails.translations[0]?.destination_name || province;

  return (
    <DestinationLayout
      lang={lang}
      destination={provinceDetails}
      destinations={lightMunicipalities}
      title={`Scopri la provincia di ${provinceName}`}
      description={`Esplora i comuni e le meraviglie della provincia di ${provinceName}.`}
      breadcrumbs={breadcrumbs}
      destinationType="province"
      sidebarData={null}
    />
  );
}