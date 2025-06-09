// app/[lang]/[region]/[province]/[municipality]/page.tsx

import DestinationLayout from "@/components/destinations/DestinationLayout";

interface MunicipalityPageProps {
  params: Promise<{
    lang: string;
    region: string;
    province: string;
    municipality: string;
  }>;
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