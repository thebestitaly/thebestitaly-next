// app/[lang]/[region]/[province]/page.tsx

import { generateMetadata as generateSEO } from "@/components/widgets/seo-utils";
import { getTranslations } from "@/lib/directus";
import DestinationLayout from "@/components/destinations/DestinationLayout";

// Genera i metadati lato server (opzionale)
export async function generateMetadata({
  params,
}: {
  params: { lang: string; province: string };
}) {
  const { lang, province } = params;

  try {
    // Esempio: recupero traduzioni dal Directus
    const provinceTranslations = await getTranslations(lang, province);

    return generateSEO({
      title: `${provinceTranslations?.seo_title || province} | TheBestItaly`,
      description: provinceTranslations?.seo_summary || "",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return generateSEO({
      title: `TheBestItaly`,
      description: "",
      type: "website",
    });
  }
}

// Pagina server component
export default async function ProvincePage({
  params,
}: {
  params: { lang: string; region: string; province: string };
}) {
  const { lang, region, province } = params;

  // Eventuale fetch SSR
  // const data = await directusClient.getDestinationBySlug(province, lang);

  return (
    <DestinationLayout
      slug={province}
      lang={lang}
      type="province"
      parentSlug={region}
    />
  );
}