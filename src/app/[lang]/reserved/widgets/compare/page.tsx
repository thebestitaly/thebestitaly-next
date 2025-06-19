import WidgetCompareClient from './WidgetCompareClient';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function WidgetComparePage({ params }: PageProps) {
  const { lang } = await params;
  
  return <WidgetCompareClient lang={lang} />;
} 