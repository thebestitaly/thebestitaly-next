import WidgetGeneratorClient from './WidgetGeneratorClient';

export default async function WidgetGeneratorPage() {
  const lang = 'it'; // Admin fixed to Italian
  
  return <WidgetGeneratorClient lang={lang} />;
} 