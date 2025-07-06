export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# 🚨 EMERGENCY: Block all bots from expensive image routes
Disallow: /api/directus/assets/
Disallow: /_next/image?*
Disallow: /images/
Disallow: *.jpg
Disallow: *.jpeg
Disallow: *.png
Disallow: *.webp
Disallow: *.gif

# Block expensive API routes
Disallow: /api/directus/
Disallow: /api/widget/

# Allow only essential pages for SEO
Allow: /it/
Allow: /en/
Allow: /fr/
Allow: /de/
Allow: /es/
Allow: /pt/
Allow: /tr/
Allow: /nl/
Allow: /ro/
Allow: /sv/
Allow: /pl/
Allow: /vi/
Allow: /id/
Allow: /el/
Allow: /uk/
Allow: /ru/
Allow: /bn/
Allow: /zh/
Allow: /hi/
Allow: /ar/
Allow: /fa/
Allow: /ur/
Allow: /ja/
Allow: /ko/
Allow: /am/
Allow: /cs/
Allow: /da/
Allow: /fi/
Allow: /af/
Allow: /hr/
Allow: /bg/
Allow: /sk/
Allow: /sl/
Allow: /sr/
Allow: /th/
Allow: /ms/
Allow: /tl/
Allow: /he/
Allow: /ca/
Allow: /et/
Allow: /lv/
Allow: /lt/
Allow: /mk/
Allow: /az/
Allow: /ka/
Allow: /hy/
Allow: /is/
Allow: /sw/
Allow: /zh-tw/
Allow: /tk/
Allow: /hu/
Allow: /no/

# Aggressive bot blocking for cost control
User-agent: Googlebot
Disallow: /api/directus/assets/
Disallow: /_next/image?*

User-agent: Bingbot  
Disallow: /api/directus/assets/
Disallow: /_next/image?*

User-agent: facebookexternalhit
Disallow: /api/directus/assets/
Disallow: /_next/image?*

User-agent: Twitterbot
Disallow: /api/directus/assets/
Disallow: /_next/image?*

User-agent: LinkedInBot
Disallow: /api/directus/assets/
Disallow: /_next/image?*

User-agent: WhatsApp
Disallow: /api/directus/assets/
Disallow: /_next/image?*

User-agent: TelegramBot
Disallow: /api/directus/assets/
Disallow: /_next/image?*

# Sitemaps per lingua
Sitemap: https://thebestitaly.eu/sitemap.xml
Sitemap: https://thebestitaly.eu/it/sitemap.xml
Sitemap: https://thebestitaly.eu/en/sitemap.xml
Sitemap: https://thebestitaly.eu/fr/sitemap.xml
Sitemap: https://thebestitaly.eu/es/sitemap.xml
Sitemap: https://thebestitaly.eu/pt/sitemap.xml
Sitemap: https://thebestitaly.eu/de/sitemap.xml
Sitemap: https://thebestitaly.eu/tk/sitemap.xml
Sitemap: https://thebestitaly.eu/nl/sitemap.xml
Sitemap: https://thebestitaly.eu/ro/sitemap.xml
Sitemap: https://thebestitaly.eu/sv/sitemap.xml
Sitemap: https://thebestitaly.eu/pl/sitemap.xml
Sitemap: https://thebestitaly.eu/vi/sitemap.xml
Sitemap: https://thebestitaly.eu/id/sitemap.xml
Sitemap: https://thebestitaly.eu/el/sitemap.xml
Sitemap: https://thebestitaly.eu/uk/sitemap.xml
Sitemap: https://thebestitaly.eu/ru/sitemap.xml
Sitemap: https://thebestitaly.eu/bn/sitemap.xml
Sitemap: https://thebestitaly.eu/zh/sitemap.xml
Sitemap: https://thebestitaly.eu/hi/sitemap.xml
Sitemap: https://thebestitaly.eu/ar/sitemap.xml
Sitemap: https://thebestitaly.eu/fa/sitemap.xml
Sitemap: https://thebestitaly.eu/ur/sitemap.xml
Sitemap: https://thebestitaly.eu/ja/sitemap.xml
Sitemap: https://thebestitaly.eu/ko/sitemap.xml
Sitemap: https://thebestitaly.eu/am/sitemap.xml
Sitemap: https://thebestitaly.eu/cs/sitemap.xml
Sitemap: https://thebestitaly.eu/da/sitemap.xml
Sitemap: https://thebestitaly.eu/fi/sitemap.xml
Sitemap: https://thebestitaly.eu/af/sitemap.xml
Sitemap: https://thebestitaly.eu/hr/sitemap.xml
Sitemap: https://thebestitaly.eu/bg/sitemap.xml
Sitemap: https://thebestitaly.eu/sk/sitemap.xml
Sitemap: https://thebestitaly.eu/sl/sitemap.xml
Sitemap: https://thebestitaly.eu/sr/sitemap.xml
Sitemap: https://thebestitaly.eu/th/sitemap.xml
Sitemap: https://thebestitaly.eu/ms/sitemap.xml
Sitemap: https://thebestitaly.eu/tl/sitemap.xml
Sitemap: https://thebestitaly.eu/he/sitemap.xml
Sitemap: https://thebestitaly.eu/ca/sitemap.xml
Sitemap: https://thebestitaly.eu/et/sitemap.xml
Sitemap: https://thebestitaly.eu/lv/sitemap.xml
Sitemap: https://thebestitaly.eu/lt/sitemap.xml
Sitemap: https://thebestitaly.eu/mk/sitemap.xml
Sitemap: https://thebestitaly.eu/az/sitemap.xml
Sitemap: https://thebestitaly.eu/ka/sitemap.xml
Sitemap: https://thebestitaly.eu/hy/sitemap.xml
Sitemap: https://thebestitaly.eu/is/sitemap.xml
Sitemap: https://thebestitaly.eu/sw/sitemap.xml
Sitemap: https://thebestitaly.eu/zh-tw/sitemap.xml
Sitemap: https://thebestitaly.eu/hu/sitemap.xml
Sitemap: https://thebestitaly.eu/no/sitemap.xml

# Crawl delay for cost control
Crawl-delay: 2`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 