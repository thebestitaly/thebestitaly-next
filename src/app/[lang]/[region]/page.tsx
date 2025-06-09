import DestinationLayout from "@/components/destinations/DestinationLayout";

interface RegionPageProps {
  params: { lang: string; region: string };
}

export default async function RegionPage({ params }: RegionPageProps) {
  // Assicurati di utilizzare `await` per accedere a `params`
  const { lang, region } = await Promise.resolve(params);

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