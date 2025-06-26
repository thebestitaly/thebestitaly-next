import { NextRequest } from 'next/server';
import directusClient from '../../../lib/directus';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Cache per le sitemap - durata 24 ore (sitemap cambiano raramente)
const sitemapCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore

// Funzione per escapare caratteri XML e validare URL
function escapeXml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') {
    return '';
  }
  
  // Rimuovi caratteri di controllo non validi in XML
  const cleaned = unsafe.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return cleaned.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function generateSitemap(lang: string): Promise<string> {
  const baseUrl = 'https://thebestitaly.eu';
  const currentDate = new Date().toISOString();
  const entries: SitemapEntry[] = [];

  console.log(`🚀 Generating sitemap for ${lang}...`);

  // 1. Pagine statiche
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/magazine', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/poi', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/experience', priority: 0.8, changeFreq: 'weekly' as const },
  ];

  staticPages.forEach(page => {
    entries.push({
      url: `${baseUrl}/${lang}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.changeFreq,
      priority: page.priority
    });
  });

  console.log(`✅ Added ${staticPages.length} static pages`);

  // 2. Articles (Magazine) - quello che già funzionava
  try {
    console.log(`📰 Fetching articles for ${lang}...`);
    
    const articlesResponse = await directusClient.get('/items/articles', {
      params: {
        filter: { status: { _eq: 'published' } },
        fields: ['date_created', 'translations.slug_permalink'],
        deep: {
          translations: {
            _filter: { languages_code: { _eq: lang } }
          }
        },
        limit: 1000,
        sort: ['-date_created']
      }
    });

    const articles = articlesResponse.data?.data || [];
    console.log(`📰 Found ${articles.length} articles`);

    articles.forEach((article: any) => {
      const translation = article.translations?.[0];
      if (translation?.slug_permalink && 
          typeof translation.slug_permalink === 'string' &&
          translation.slug_permalink.length > 0 &&
          !translation.slug_permalink.includes('<') && 
          !translation.slug_permalink.includes('>') &&
          !translation.slug_permalink.includes('&')) {
        entries.push({
          url: `${baseUrl}/${lang}/magazine/${encodeURIComponent(translation.slug_permalink)}`,
          lastModified: article.date_created || currentDate,
          changeFrequency: 'monthly',
          priority: 0.7
        });
      }
    });

  } catch (error) {
    console.error('❌ Error fetching articles:', error);
  }

  // 3. Companies (POI) - quello che già funzionava
  try {
    console.log(`🏢 Fetching companies...`);
    
    const companiesResponse = await directusClient.get('/items/companies', {
      params: {
        filter: { active: { _eq: true } },
        fields: ['slug_permalink'],
        limit: 2000
      }
    });

    const companies = companiesResponse.data?.data || [];
    console.log(`🏢 Found ${companies.length} companies`);

    companies.forEach((company: any) => {
      if (company.slug_permalink && 
          typeof company.slug_permalink === 'string' &&
          company.slug_permalink.length > 0 &&
          !company.slug_permalink.includes('<') && 
          !company.slug_permalink.includes('>') &&
          !company.slug_permalink.includes('&')) {
        entries.push({
          url: `${baseUrl}/${lang}/poi/${encodeURIComponent(company.slug_permalink)}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.7
        });
      }
    });

  } catch (error) {
    console.error('❌ Error fetching companies:', error);
  }

  // 4. Categories
  try {
    console.log(`📂 Fetching categories for ${lang}...`);
    
    const categoriesResponse = await directusClient.get('/items/categorias', {
      params: {
        filter: { visible: { _eq: true } },
        fields: ['translations.slug_permalink'],
        deep: {
          translations: {
            _filter: { languages_code: { _eq: lang } }
          }
        },
        limit: 100
      }
    });

    const categories = categoriesResponse.data?.data || [];
    console.log(`📂 Found ${categories.length} categories`);

    categories.forEach((category: any) => {
      const translation = category.translations?.[0];
      if (translation?.slug_permalink && !translation.slug_permalink.includes('<') && !translation.slug_permalink.includes('>')) {
        entries.push({
          url: `${baseUrl}/${lang}/magazine/c/${translation.slug_permalink}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8
        });
      }
    });

  } catch (error) {
    console.error('❌ Error fetching categories:', error);
  }

  // 5. Destinations - SOLO REGIONI per evitare crash memoria
  try {
    console.log(`🗺️ Fetching ONLY regions for ${lang} (memory optimization)...`);
    
    const regionsResponse = await directusClient.get('/items/destinations', {
      params: {
        fields: [
          'translations.slug_permalink'
        ],
        filter: {
          type: { _eq: 'region' },
          'translations.languages_code': { _eq: lang }
        },
        limit: 50
      }
    });

    const regions = regionsResponse.data?.data || [];
    console.log(`🗺️ Found ${regions.length} regions`);

    regions.forEach((region: any) => {
      const translation = region.translations?.[0];
      if (translation?.slug_permalink) {
        entries.push({
          url: `${baseUrl}/${lang}/${translation.slug_permalink}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.8
        });
      }
    });

    console.log(`🗺️ Added ${regions.length} regions to sitemap (provinces/municipalities skipped for memory)`);

  } catch (error) {
    console.error('❌ Error fetching regions:', error);
  }

  // Genera XML con escape dei caratteri speciali
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  console.log(`✅ Sitemap generated for ${lang}: ${entries.length} total URLs`);
  return sitemap;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const cacheKey = `sitemap-${lang}`;
  const now = Date.now();
  
  // Check for force parameter to bypass cache
  const url = new URL(request.url);
  const forceRegenerate = url.searchParams.get('force') === '1';
  const timestamp = url.searchParams.get('t'); // Timestamp per bypassare Cloudflare
  
  // Check cache (skip if force=1)
  const cached = sitemapCache.get(cacheKey);
  if (!forceRegenerate && cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`💾 Serving cached sitemap for ${lang}`);
    return new Response(cached.data, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=21600, s-maxage=21600',
        'X-Cache-Status': 'HIT'
      },
    });
  }
  
  try {
    // Generate new sitemap
    const sitemap = await generateSitemap(lang);
    
    // Save to cache
    sitemapCache.set(cacheKey, {
      data: sitemap,
      timestamp: now
    });
    
    // Clean old cache entries
    if (sitemapCache.size > 20) {
      const entries = Array.from(sitemapCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      sitemapCache.clear();
      entries.slice(0, 15).forEach(([key, value]) => {
        sitemapCache.set(key, value);
      });
    }
    
    const urlCount = sitemap.split('<url>').length - 1;
    console.log(`🎉 Fresh sitemap served for ${lang}: ${urlCount} URLs`);
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': forceRegenerate ? 'no-cache, no-store, must-revalidate' : 'public, max-age=21600, s-maxage=21600',
        'X-Cache-Status': forceRegenerate ? 'FORCE' : 'MISS'
      },
    });
  } catch (error) {
    console.error(`💥 Error generating sitemap for ${lang}:`, error);
    
    // Fallback sitemap più completo con pagine statiche
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thebestitaly.eu/${lang}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://thebestitaly.eu/${lang}/magazine</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://thebestitaly.eu/${lang}/poi</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://thebestitaly.eu/${lang}/experience</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    return new Response(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Cache-Status': 'ERROR'
      },
    });
  }
} 