import TestTranslationsClient from './TestTranslationsClient';

export default async function TestTranslationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return <TestTranslationsClient lang={lang} />;
} 