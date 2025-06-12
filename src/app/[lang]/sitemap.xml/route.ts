import { NextRequest } from 'next/server';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Cache per le sitemap - durata 24 ore
const sitemapCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore in millisecondi

// Fetch data directly from Directus API using fetch
async function fetchFromDirectus(endpoint: string, params: Record<string, any> = {}) {
  try {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-93f0.up.railway.app';
    const url = new URL(`${directusUrl}${endpoint}`);
    
    // Add auth token
    const token = process.env.DIRECTUS_TOKEN || 'aWlLBvZkP5GWVl7zl5oNDzjmus3FPKZ8';
    if (token) {
      url.searchParams.append('access_token', token);
    }
    
    // Add other params - handle filters properly
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'filter' && typeof value === 'object') {
        // Handle Directus filters properly
        Object.entries(value).forEach(([filterKey, filterValue]: [string, any]) => {
          if (typeof filterValue === 'object') {
            Object.entries(filterValue).forEach(([operator, operatorValue]) => {
              url.searchParams.append(`filter[${filterKey}][${operator}]`, String(operatorValue));
            });
          } else {
            url.searchParams.append(`filter[${filterKey}]`, String(filterValue));
          }
        });
      } else if (key === 'fields' && Array.isArray(value)) {
        url.searchParams.append('fields', value.join(','));
      } else {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache per 1 ora a livello di fetch
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}

// Funzione per generare la sitemap (cacheable)
async function generateSitemap(lang: string): Promise<string> {
  const baseUrl = 'https://thebestitaly.eu';
  const currentDate = new Date().toISOString();
  
  const entries: SitemapEntry[] = [];

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/magazine', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/poi', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/experience', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/contact', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
  ];

  staticPages.forEach(page => {
    entries.push({
      url: `${baseUrl}/${lang}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.changeFreq,
      priority: page.priority
    });
  });

  // Fetch ALL destinations (7907) - con cache
  try {
    console.log(`Fetching destinations for ${lang} sitemap...`);
    const destinations = await fetchFromDirectus('/items/destinations', {
      limit: 10000, // Get ALL destinations
      fields: [
        'id',
        'type',
        'date_updated',
        'translations.slug_permalink',
        'translations.languages_code',
        'region_id.translations.slug_permalink',
        'region_id.translations.languages_code',
        'province_id.translations.slug_permalink',
        'province_id.translations.languages_code'
      ]
    });
    console.log(`Found ${destinations.length} destinations`);

    let addedDestinations = 0;
    destinations.forEach((destination: any) => {
      const translation = destination.translations?.find((t: any) => t.languages_code === lang);
      
      // Solo se ha una traduzione e uno slug valido
      if (translation?.slug_permalink) {
        let url = '';
        
        // Costruisci URL basato sul tipo di destinazione
        if (destination.type === 'region') {
          url = `${baseUrl}/${lang}/${translation.slug_permalink}`;
        } else if (destination.type === 'province') {
          const regionTranslation = destination.region_id?.translations?.find((t: any) => t.languages_code === lang);
          if (regionTranslation?.slug_permalink) {
            url = `${baseUrl}/${lang}/${regionTranslation.slug_permalink}/${translation.slug_permalink}`;
          }
        } else if (destination.type === 'municipality') {
          const regionTranslation = destination.region_id?.translations?.find((t: any) => t.languages_code === lang);
          const provinceTranslation = destination.province_id?.translations?.find((t: any) => t.languages_code === lang);
          if (regionTranslation?.slug_permalink && provinceTranslation?.slug_permalink) {
            url = `${baseUrl}/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${translation.slug_permalink}`;
          }
        } else if (destination.type === 'state') {
          url = `${baseUrl}/${lang}/${translation.slug_permalink}`;
        }
        
        if (url) {
          entries.push({
            url,
            lastModified: destination.date_updated || currentDate,
            changeFrequency: 'monthly',
            priority: destination.type === 'region' || destination.type === 'state' ? 0.8 : 
                     destination.type === 'province' ? 0.7 : 0.6
          });
          addedDestinations++;
        }
      }
    });
    console.log(`Added ${addedDestinations} destinations to sitemap`);
  } catch (error) {
    console.error('Error fetching destinations for sitemap:', error);
  }

  // Fetch ALL articles - con cache
  try {
    console.log(`Fetching articles for ${lang} sitemap...`);
    const articles = await fetchFromDirectus('/items/articles', {
      limit: 1000, // Get all articles
      filter: {
        status: { _eq: 'published' }
      },
      fields: [
        'id',
        'date_updated',
        'translations.slug_permalink',
        'translations.languages_code'
      ]
    });
    console.log(`Found ${articles.length} articles`);

    articles.forEach((article: any) => {
      const translation = article.translations?.find((t: any) => t.languages_code === lang);
      if (translation?.slug_permalink) {
        entries.push({
          url: `${baseUrl}/${lang}/magazine/${translation.slug_permalink}`,
          lastModified: article.date_updated || currentDate,
          changeFrequency: 'monthly',
          priority: 0.7
        });
      }
    });
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
  }

  // Fetch ALL categories - con cache
  try {
    console.log(`Fetching categories for ${lang} sitemap...`);
    const categories = await fetchFromDirectus('/items/categories', {
      limit: 200,
      filter: {
        visible: { _eq: true }
      },
      fields: [
        'id',
        'date_updated',
        'translations.slug_permalink',
        'translations.languages_code'
      ]
    });
    console.log(`Found ${categories.length} categories`);

    categories.forEach((category: any) => {
      const translation = category.translations?.find((t: any) => t.languages_code === lang);
      if (translation?.slug_permalink) {
        entries.push({
          url: `${baseUrl}/${lang}/magazine/c/${translation.slug_permalink}`,
          lastModified: category.date_updated || currentDate,
          changeFrequency: 'weekly',
          priority: 0.8
        });
      }
    });
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Fetch ALL companies/POI - con cache
  try {
    console.log(`Fetching companies for ${lang} sitemap...`);
    const companies = await fetchFromDirectus('/items/companies', {
      limit: 10000, // Get ALL companies
      filter: {
        active: { _eq: true }
      },
      fields: [
        'id',
        'slug_permalink',
        'date_updated'
      ]
    });
    console.log(`Found ${companies.length} companies`);

    companies.forEach((company: any) => {
      if (company.slug_permalink) {
        entries.push({
          url: `${baseUrl}/${lang}/poi/${company.slug_permalink}`,
          lastModified: company.date_updated || currentDate,
          changeFrequency: 'monthly',
          priority: 0.7
        });
      }
    });
  } catch (error) {
    console.error('Error fetching companies for sitemap:', error);
  }

  // Genera XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const cacheKey = `sitemap-${lang}`;
  const now = Date.now();
  
  // Controlla se abbiamo una versione cached valida
  const cached = sitemapCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Serving cached sitemap for ${lang}`);
    return new Response(cached.data, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache per 24 ore
        'X-Cache-Status': 'HIT'
      },
    });
  }
  
  console.log(`Generating fresh sitemap for ${lang}...`);
  
  try {
    // Genera nuova sitemap
    const sitemap = await generateSitemap(lang);
    
    // Salva in cache
    sitemapCache.set(cacheKey, {
      data: sitemap,
      timestamp: now
    });
    
    // Pulisci cache vecchie (mantieni solo le ultime 10)
    if (sitemapCache.size > 10) {
      const entries = Array.from(sitemapCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      sitemapCache.clear();
      entries.slice(0, 10).forEach(([key, value]) => {
        sitemapCache.set(key, value);
      });
    }
    
    console.log(`Fresh sitemap generated for ${lang} with ${sitemap.split('<url>').length - 1} URLs`);
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache per 24 ore
        'X-Cache-Status': 'MISS'
      },
    });
  } catch (error) {
    console.error(`Error generating sitemap for ${lang}:`, error);
    
    // Se c'è un errore, prova a servire una versione cached anche se scaduta
    if (cached) {
      console.log(`Serving stale cached sitemap for ${lang} due to error`);
      return new Response(cached.data, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache per 1 ora in caso di errore
          'X-Cache-Status': 'STALE'
        },
      });
    }
    
    // Fallback: sitemap minimale
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thebestitaly.eu/${lang}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new Response(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache per 5 minuti in caso di errore
        'X-Cache-Status': 'ERROR'
      },
    });
  }
} 