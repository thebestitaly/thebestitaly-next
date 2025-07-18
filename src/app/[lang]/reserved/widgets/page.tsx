import WidgetGeneratorClient from './WidgetGeneratorClient';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function WidgetGeneratorPage({ params }: PageProps) {
  const { lang } = await params;
  
  return <WidgetGeneratorClient lang={lang} />;
} 