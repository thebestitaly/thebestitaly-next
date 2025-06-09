import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/lib/directus';
import EccellenzeList from '../../../components/companies/EccellenzeList';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  return generateSEO({
    title: `Eccellenze Italiane | TheBestItaly`,
    description: 'Scopri le migliori eccellenze italiane: hotel di lusso, ristoranti stellati, esperienze uniche e attività imperdibili in Italia.',
    type: 'website',
  });
}

export default async function EccellenzePage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Caricamento eccellenze...</p>
          </div>
        </div>
      }>
        <EccellenzeList lang={lang} />
      </Suspense>
    </div>
  );
} 