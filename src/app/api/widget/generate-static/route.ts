import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';
import fs from 'fs';
import path from 'path';

interface StaticWidgetData {
  id: string;
  uuid: string;
  title: string;
  description: string;
  seo_summary: string;
  image?: string;
  type: 'azienda' | 'destinazione' | 'articolo';
  language: string;
  location?: string;
  category?: string;
  slug_permalink: string;
  external_url: string;
  // Dati completi per il widget full
  full_description?: string;
  metadata?: {
    region?: string;
    province?: string;
    municipality?: string;
    category_name?: string;
    phone?: string;
    website?: string;
  };
}

interface StaticDataIndex {
  companies: StaticWidgetData[];
  destinations: StaticWidgetData[];
  articles: StaticWidgetData[];
  searchIndex: {
    [key: string]: string[]; // keyword -> array of IDs
  };
  lastUpdated: string;
  totalItems: number;
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'it';
    const regenerate = searchParams.get('regenerate') === 'true';

    console.log('🔧 Generating static widget data for language:', language);

    // Controlla se i file esistono già e sono recenti (meno di 24 ore)
    const staticDir = path.join(process.cwd(), 'public', 'widget-data');
    const indexFile = path.join(staticDir, `${language}-index.json`);
    
    if (!regenerate && fs.existsSync(indexFile)) {
      const stats = fs.statSync(indexFile);
      const age = Date.now() - stats.mtime.getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 ore
      
      if (age < maxAge) {
        console.log('📁 Static files are recent, skipping generation');
        return NextResponse.json({
          message: 'Static files are up to date',
          lastUpdated: stats.mtime.toISOString(),
          age: Math.round(age / (60 * 60 * 1000)) + ' hours'
        });
      }
    }

    // Crea la directory se non esiste
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }

    console.log('🏢 Fetching companies...');
    const companies = await generateCompaniesData(language);
    
    console.log('🏛️ Fetching destinations...');
    const destinations = await generateDestinationsData(language);
    
    console.log('📰 Fetching articles...');
    const articles = await generateArticlesData(language);

    console.log('🔍 Building search index...');
    const searchIndex = buildSearchIndex([...companies, ...destinations, ...articles]);

    const staticData: StaticDataIndex = {
      companies,
      destinations,
      articles,
      searchIndex,
      lastUpdated: new Date().toISOString(),
      totalItems: companies.length + destinations.length + articles.length
    };

    // Salva l'indice principale
    fs.writeFileSync(indexFile, JSON.stringify(staticData, null, 2));

    // Salva file separati per tipo (per caricamento lazy)
    fs.writeFileSync(
      path.join(staticDir, `${language}-companies.json`),
      JSON.stringify(companies, null, 2)
    );
    fs.writeFileSync(
      path.join(staticDir, `${language}-destinations.json`),
      JSON.stringify(destinations, null, 2)
    );
    fs.writeFileSync(
      path.join(staticDir, `${language}-articles.json`),
      JSON.stringify(articles, null, 2)
    );

    console.log(`✅ Generated static data: ${staticData.totalItems} items`);

    return NextResponse.json({
      message: 'Static widget data generated successfully',
      stats: {
        companies: companies.length,
        destinations: destinations.length,
        articles: articles.length,
        totalItems: staticData.totalItems
      },
      files: [
        `${language}-index.json`,
        `${language}-companies.json`,
        `${language}-destinations.json`,
        `${language}-articles.json`
      ],
      lastUpdated: staticData.lastUpdated
    });

  } catch (error) {
    console.error('❌ Error generating static data:', error);
    return NextResponse.json(
      { error: 'Failed to generate static data' },
      { status: 500 }
    );
  }
}

async function generateCompaniesData(language: string): Promise<StaticWidgetData[]> {
  try {
    const allCompanies = await directusClient.getCompaniesForListing(language, {});
    
    return allCompanies.map((company: any) => {
      const translation = company.translations?.[0] || {};
      const uuid = company.uuid_id || `company-${company.id}-${company.slug_permalink}`;
      
      return {
        id: company.id.toString(),
        uuid,
        title: company.company_name,
        description: translation.description || company.description || 'Eccellenza italiana di qualità premium.',
        seo_summary: translation.seo_summary || '',
        image: company.featured_image,
        type: 'azienda' as const,
        language,
        location: company.destination_name || '',
        category: company.category_name || '',
        slug_permalink: company.slug_permalink,
        external_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebestitaly.eu'}/${language}/poi/${company.slug_permalink}`,
        full_description: translation.description || company.description || 'Eccellenza italiana di qualità premium.',
        metadata: {
          category_name: company.category_name,
          phone: company.phone,
          website: company.website
        }
      };
    });
  } catch (error) {
    console.error('❌ Error generating companies data:', error);
    return [];
  }
}

async function generateDestinationsData(language: string): Promise<StaticWidgetData[]> {
  try {
    const [regions, provinces, municipalities] = await Promise.all([
      directusClient.getDestinations({ type: 'region', lang: language }),
      directusClient.getDestinations({ type: 'province', lang: language }),
      directusClient.getDestinations({ type: 'municipality', lang: language })
    ]);

    const allDestinations = [...regions, ...provinces, ...municipalities];
    
    return allDestinations.map((destination: any) => {
      const translation = destination.translations?.[0] || {};
      const uuid = destination.uuid_id || `destination-${destination.type}-${destination.id}-${translation.slug_permalink}`;
      
      // Costruisci URL path
      let urlPath = '';
      if (destination.type === 'region') {
        urlPath = translation.slug_permalink;
      } else if (destination.type === 'province') {
        urlPath = `${destination.region_slug || 'regione'}/${translation.slug_permalink}`;
      } else {
        urlPath = `${destination.region_slug || 'regione'}/${destination.province_slug || 'provincia'}/${translation.slug_permalink}`;
      }

      return {
        id: destination.id.toString(),
        uuid,
        title: translation.destination_name || 'Destinazione Italia',
        description: translation.description || translation.seo_summary || 'Scopri questa meravigliosa destinazione italiana.',
        seo_summary: translation.seo_summary || '',
        image: destination.image,
        type: 'destinazione' as const,
        language,
        location: getDestinationLocation(destination),
        category: getDestinationCategory(destination.type),
        slug_permalink: translation.slug_permalink,
        external_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebestitaly.eu'}/${language}/${urlPath}`,
        full_description: translation.description || translation.seo_summary || 'Scopri questa meravigliosa destinazione italiana.',
        metadata: {
          region: destination.region_name,
          province: destination.province_name,
          municipality: destination.type === 'municipality' ? translation.destination_name : undefined
        }
      };
    });
  } catch (error) {
    console.error('❌ Error generating destinations data:', error);
    return [];
  }
}

async function generateArticlesData(language: string): Promise<StaticWidgetData[]> {
  try {
    const response = await directusClient.get('/items/articles', {
      params: {
        'filter[status][_eq]': 'published',
        'fields[]': [
          'id',
          'uuid_id',
          'featured_image',
          'translations.title',
          'translations.description',
          'translations.seo_summary',
          'translations.slug_permalink',
          'translations.languages_code'
        ],
        'deep[translations][_filter][languages_code][_eq]': language,
        limit: 1000
      }
    });

    const articles = response.data?.data || [];
    
    return articles.map((article: any) => {
      const translation = article.translations?.[0] || {};
      const uuid = article.uuid_id || `article-${article.id}-${translation.slug_permalink}`;
      
      return {
        id: article.id.toString(),
        uuid,
        title: translation.title || 'Articolo',
        description: translation.description || translation.seo_summary || 'Leggi il nostro ultimo articolo sulla cultura italiana.',
        seo_summary: translation.seo_summary || '',
        image: article.featured_image,
        type: 'articolo' as const,
        language,
        slug_permalink: translation.slug_permalink,
        external_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebestitaly.eu'}/${language}/magazine/${translation.slug_permalink}`,
        full_description: translation.description || translation.seo_summary || 'Leggi il nostro ultimo articolo sulla cultura italiana.'
      };
    });
  } catch (error) {
    console.error('❌ Error generating articles data:', error);
    return [];
  }
}

function buildSearchIndex(items: StaticWidgetData[]): { [key: string]: string[] } {
  const index: { [key: string]: string[] } = {};
  
  items.forEach(item => {
    // Indicizza per titolo
    const titleWords = item.title.toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.length > 2) {
        if (!index[word]) index[word] = [];
        if (!index[word].includes(item.uuid)) {
          index[word].push(item.uuid);
        }
      }
    });
    
    // Indicizza per slug
    const slugWords = item.slug_permalink.split('-');
    slugWords.forEach(word => {
      if (word.length > 2) {
        if (!index[word]) index[word] = [];
        if (!index[word].includes(item.uuid)) {
          index[word].push(item.uuid);
        }
      }
    });
    
    // Indicizza per location
    if (item.location) {
      const locationWords = item.location.toLowerCase().split(/\s+/);
      locationWords.forEach(word => {
        if (word.length > 2) {
          if (!index[word]) index[word] = [];
          if (!index[word].includes(item.uuid)) {
            index[word].push(item.uuid);
          }
        }
      });
    }
  });
  
  return index;
}

function getDestinationLocation(destination: any): string {
  const parts = [];
  if (destination.region_name) parts.push(destination.region_name);
  if (destination.province_name) parts.push(destination.province_name);
  return parts.join(', ');
}

function getDestinationCategory(type: string): string {
  switch (type) {
    case 'region': return 'Regione';
    case 'province': return 'Provincia';
    case 'municipality': return 'Comune';
    default: return 'Destinazione';
  }
} 