import WidgetCompareClient from './WidgetCompareClient';

export default async function WidgetComparePage() {
  const lang = 'it'; // Admin fixed to Italian
  
  return <WidgetCompareClient lang={lang} />;
} 