import { NextRequest } from 'next/server';
import directusClient from '../../../lib/directus';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Cache per le sitemap - durata ridotta per testing
const sitemapCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti per testing

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

  // 5. Destinations - sistema questo con approccio a batch per gestire 7900 destinations
  try {
    console.log(`🗺️ Fetching destinations for ${lang}...`);
    
    let allDestinations: any[] = [];
    let offset = 0;
    const batchSize = 500;
    let hasMore = true;

    while (hasMore && offset < 8000) { // Limite sicurezza per evitare loop infiniti
      try {
        console.log(`📍 Fetching destinations batch: ${offset}-${offset + batchSize}`);
        
        const destinationsResponse = await directusClient.get('/items/destinations', {
          params: {
            fields: [
              'type', 
              'region_id.translations.slug_permalink',
              'region_id.translations.languages_code',
              'province_id.translations.slug_permalink', 
              'province_id.translations.languages_code',
              'translations.slug_permalink',
              'translations.languages_code'
            ],
            limit: batchSize,
            offset: offset
          }
        });

        const batch = destinationsResponse.data?.data || [];
        console.log(`📍 Batch ${offset / batchSize + 1}: got ${batch.length} destinations`);
        
        if (batch.length === 0) {
          hasMore = false;
        } else {
          allDestinations = allDestinations.concat(batch);
          offset += batchSize;
        }

        // Se il batch è più piccolo del batchSize, siamo alla fine
        if (batch.length < batchSize) {
          hasMore = false;
        }

      } catch (batchError) {
        console.error(`❌ Error in destinations batch ${offset}:`, batchError);
        hasMore = false; // Stop su errore per evitare loop infiniti
      }
    }

    console.log(`🗺️ Total destinations fetched: ${allDestinations.length}`);

    // Processa tutte le destinations
    let regionsCount = 0;
    let provincesCount = 0;
    let municipalitiesCount = 0;

    allDestinations.forEach((destination: any) => {
      // Trova la traduzione per la lingua corrente
      const translation = destination.translations?.find((t: any) => t.languages_code === lang);
      
      if (translation?.slug_permalink && destination.type) {
        let url = '';
        
        if (destination.type === 'region') {
          // Regioni: /{lang}/{slug}
          url = `${baseUrl}/${lang}/${translation.slug_permalink}`;
          regionsCount++;
          
        } else if (destination.type === 'province') {
          // Province: /{lang}/{region_slug}/{province_slug}
          const regionTranslation = destination.region_id?.translations?.find((t: any) => t.languages_code === lang);
          if (regionTranslation?.slug_permalink) {
            url = `${baseUrl}/${lang}/${regionTranslation.slug_permalink}/${translation.slug_permalink}`;
            provincesCount++;
          }
          
        } else if (destination.type === 'municipality') {
          // Municipality: /{lang}/{region_slug}/{province_slug}/{municipality_slug}
          const regionTranslation = destination.region_id?.translations?.find((t: any) => t.languages_code === lang);
          const provinceTranslation = destination.province_id?.translations?.find((t: any) => t.languages_code === lang);
          
          if (regionTranslation?.slug_permalink && provinceTranslation?.slug_permalink) {
            url = `${baseUrl}/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${translation.slug_permalink}`;
            municipalitiesCount++;
          }
        }

        // Validazione URL più robusta
        if (url && 
            url.length < 2000 && 
            url.startsWith('https://thebestitaly.eu/') &&
            !url.includes('<') && 
            !url.includes('>') &&
            !url.includes('&') &&
            !url.includes('"') &&
            !url.includes("'")) {
          entries.push({
            url,
            lastModified: currentDate,
            changeFrequency: destination.type === 'region' ? 'monthly' : 'yearly',
            priority: destination.type === 'region' ? 0.8 : destination.type === 'province' ? 0.7 : 0.6
          });
        }
      }
    });

    console.log(`🗺️ Destinations processed: ${regionsCount} regions, ${provincesCount} provinces, ${municipalitiesCount} municipalities`);

  } catch (error) {
    console.error('❌ Error fetching destinations:', error);
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
  
  // Check cache
  const cached = sitemapCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
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
        'Cache-Control': 'public, max-age=21600, s-maxage=21600',
        'X-Cache-Status': 'MISS'
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