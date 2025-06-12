export async function GET() {
  const languages = [
    'it', 'en', 'fr', 'es', 'pt', 'de', 'tr', 'nl', 'ro', 'sv', 'pl', 'vi', 'id', 'el', 'uk', 'ru',
    'bn', 'zh', 'hi', 'ar', 'fa', 'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk',
    'sl', 'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk', 'az', 'ka', 'hy', 'is', 'sw', 'zh-tw'
  ];
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${languages.map(lang => `  <sitemap>
    <loc>https://thebestitaly.eu/${lang}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 