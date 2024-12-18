// app/[lang]/[region]/[province]/page.tsx
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';
import { getTranslations } from '@/lib/directus';
import DestinationLayout from '@/components/destinations/DestinationLayout';

interface ProvincePageProps {
  params: {
    lang: string;
    region: string;
    province: string;
  };
}

// Funzione per generare i metadati lato server
export async function generateMetadata({ params }: { params: { lang: string; province: string } }) {
  if (!params) return {};

  const { lang, province } = params;

  try {
    const provinceTranslations = await getTranslations(lang, province);

    return generateSEO({
      title: `${provinceTranslations?.seo_title || province} | TheBestItaly`,
      description: provinceTranslations?.seo_summary || '',
      type: 'website',
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generateSEO({
      title: `TheBestItaly`,
      description: '',
      type: 'website',
    });
  }
}

// Componente principale per la pagina della provincia
export default function ProvincePage({ params }: ProvincePageProps) {
  if (!params) return <div>Loading...</div>;

  const { lang, region, province } = params;

  return (
    <DestinationLayout
      slug={province}
      lang={lang}
      type="province"
      parentSlug={region}
    />
  );
}