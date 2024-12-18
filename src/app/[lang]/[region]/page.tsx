// app/[lang]/[region]/page.tsx
import DestinationLayout from '@/components/destinations/DestinationLayout';

export default function RegionPage({ params }: { params: { lang: string; region: string } }) {
  return <DestinationLayout slug={params.region} lang={params.lang} type="region" />;
}