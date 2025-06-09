// app/[lang]/[region]/[province]/[municipality]/page.tsx

import DestinationLayout from "@/components/destinations/DestinationLayout";
import directusClient from "@/lib/directus";

interface MunicipalityPageProps {
  params: {
    lang: string;
    region: string;
    province: string;
    municipality: string;
  };
}

// Anche questa è un server component
export default async function MunicipalityPage({ params }: MunicipalityPageProps) {
  const { lang, region, province, municipality } = params;

  // Esempio: fetch SSR per trovare il provinceId, ecc.
  let provinceId: string | null = null;

  try {
    const destination = await directusClient.getDestinationBySlug(municipality, lang);
    if (destination && destination.province_id) {
      provinceId = destination.province_id;
    }
  } catch (error) {
    console.error("Error fetching province_id:", error);
  }

  return (
    <DestinationLayout
      slug={municipality}
      lang={lang}
      provinceId={provinceId}
      type="municipality"
      parentSlug={province}
    />
  );
}