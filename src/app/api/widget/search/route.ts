import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';
import axios from 'axios';

// Client dedicato per widget che va direttamente a Directus
const widgetDirectusClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-93f0.up.railway.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor per aggiungere il token
widgetDirectusClient.interceptors.request.use(request => {
  const token = process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  console.log(`🌐 Widget making request to: ${request.baseURL}${request.url}`);
  return request;
});

widgetDirectusClient.interceptors.response.use(
  response => {
    console.log(`✅ Widget response: ${response.status} - ${response.data?.data?.length || 0} items`);
    return response;
  },
  error => {
    console.error('🚨 Widget Directus Error:', error.response?.status, error.response?.statusText || error.message);
    console.error('🔍 Request details:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

// Log configuration per debug
console.log('🔧 Widget API Configuration:', {
  DIRECTUS_URL: process.env.DIRECTUS_URL ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL ? 'SET' : 'NOT SET',
  DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_DIRECTUS_TOKEN: process.env.NEXT_PUBLIC_DIRECTUS_TOKEN ? 'SET' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV,
  directusClient: !!directusClient
});

interface SearchParams {
  type: 'articolo' | 'destinazione' | 'azienda';
  query: string;
  language: string;
  limit?: number;
}

interface SearchResult {
  id: string;
  uuid?: string;
  title: string;
  description: string;
  seo_summary?: string;
  seo_title?: string;
  image?: string;
  type: string;
  language: string;
  location?: string;
  category?: string;
  slug_permalink: string;
  external_url: string; // URL completo per accesso esterno
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();
    const { type, query, language, limit = 10 } = body;

    console.log('🚀 Widget Search Request:', { type, query, language, limit });
    
    // Test environment variables
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DIRECTUS_URL: process.env.DIRECTUS_URL?.substring(0, 50) + '...',
      NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL?.substring(0, 50) + '...',
      hasDirectusToken: !!(process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN)
    });

    if (!type || !query || !language) {
      console.log('❌ Missing parameters:', { type, query, language });
      return NextResponse.json(
        { error: 'Parametri mancanti: type, query, language sono obbligatori' },
        { status: 400 }
      );
    }

    console.log(`🔍 Widget Search: ${type} - "${query}" in ${language}`);

    let results: SearchResult[] = [];

    switch (type) {
      case 'articolo':
        console.log('📰 Searching articles...');
        results = await searchArticles(query, language, limit);
        break;
      case 'destinazione':
        console.log('🏛️ Searching destinations...');
        results = await searchDestinations(query, language, limit);
        break;
      case 'azienda':
        console.log('🏢 Searching companies...');
        results = await searchCompanies(query, language, limit);
        break;
      default:
        console.log('❌ Invalid type:', type);
        return NextResponse.json(
          { error: 'Tipo non valido. Usa: articolo, destinazione, azienda' },
          { status: 400 }
        );
    }

    console.log(`✅ Search completed. Found ${results.length} results`);
    console.log('📊 Results preview:', results.slice(0, 2).map(r => ({ id: r.id, title: r.title, type: r.type })));

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache 5 min
      },
    });

  } catch (error) {
    console.error('❌ Widget Search Error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

async function searchArticles(query: string, language: string, limit: number): Promise<SearchResult[]> {
  try {
    console.log('📰 Articles search params:', { query, language, limit });
    
    // Usa le funzioni esistenti che funzionano
    const allArticlesResponse = await directusClient.getArticles(language, 0, 100); // Prendi i primi 100
    const allArticles = allArticlesResponse.articles;
    
    console.log(`📊 Retrieved ${allArticles.length} articles`);
    
    // Filtra i risultati per il termine di ricerca
    const filteredArticles = allArticles.filter((article: any) => {
      const title = article.translations?.[0]?.titolo_articolo?.toLowerCase() || '';
      const description = article.translations?.[0]?.description?.toLowerCase() || '';
      const seoSummary = article.translations?.[0]?.seo_summary?.toLowerCase() || '';
      const searchTerm = query.toLowerCase();
      
      return title.includes(searchTerm) || 
             description.includes(searchTerm) || 
             seoSummary.includes(searchTerm);
    });
    
    console.log(`🎯 Filtered to ${filteredArticles.length} articles matching "${query}"`);
    
    const articles = filteredArticles.slice(0, limit);
    
    return articles.map((article: any) => {
      const translation = article.translations?.[0];
      
      return {
        id: article.id,
        uuid: article.uuid_id,
        title: translation?.titolo_articolo || 'Articolo senza titolo',
        description: translation?.description || 'Nessuna descrizione disponibile',
        seo_summary: translation?.seo_summary || translation?.description || 'Articolo interessante',
        seo_title: translation?.seo_title || translation?.seo_summary || 'Articolo interessante',
        type: 'articolo',
        language: language,
        slug_permalink: translation?.slug_permalink || '',
        external_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${language}/magazine/${translation?.slug_permalink || article.id}`
      };
    });

  } catch (error) {
    console.error('❌ Error searching articles:', error);
    console.error('📋 Articles error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

async function searchDestinations(query: string, language: string, limit: number): Promise<SearchResult[]> {
  try {
    console.log('🌍 Destinations search params:', { query, language, limit });
    
    // Usa le funzioni esistenti che funzionano
    const [regions, provinces, municipalities] = await Promise.all([
      directusClient.getDestinations({ type: 'region', lang: language }),
      directusClient.getDestinations({ type: 'province', lang: language }),
      directusClient.getDestinations({ type: 'municipality', lang: language })
    ]);
    
    const allDestinations = [...regions, ...provinces, ...municipalities];
    console.log(`📊 Retrieved ${allDestinations.length} destinations (${regions.length} regions, ${provinces.length} provinces, ${municipalities.length} municipalities)`);
    
    // Filtra i risultati per il termine di ricerca
    const filteredDestinations = allDestinations.filter((destination: any) => {
      const name = destination.translations?.[0]?.destination_name?.toLowerCase() || '';
      const description = destination.translations?.[0]?.description?.toLowerCase() || '';
      const seoSummary = destination.translations?.[0]?.seo_summary?.toLowerCase() || '';
      const searchTerm = query.toLowerCase();
      
      return name.includes(searchTerm) || 
             description.includes(searchTerm) || 
             seoSummary.includes(searchTerm);
    });
    
    console.log(`🎯 Filtered to ${filteredDestinations.length} destinations matching "${query}"`);
    
    const destinations = filteredDestinations.slice(0, limit);
    console.log(`🏛️ Found ${destinations.length} destinations from Directus`);
    
    if (destinations.length > 0) {
      console.log('🔍 First destination raw data:', JSON.stringify(destinations[0], null, 2));
    }
    
    const mappedResults = destinations.map((destination: any, index: number) => {
      const translation = destination.translations?.[0];
      
      // Debug struttura dei dati
      if (index === 0) {
        console.log('🏛️ Destination structure debug:', {
          type: destination.type,
          region_id: destination.region_id,
          province_id: destination.province_id,
          hasRegionTranslations: !!destination.region_id?.translations,
          hasProvinceTranslations: !!destination.province_id?.translations,
          translation_keys: translation ? Object.keys(translation) : []
        });
      }
      
      // Ricostruisci il percorso URL per le destinazioni
      let urlPath = '';
      
      if (destination.type === 'region') {
        urlPath = translation?.slug_permalink || destination.id.toString();
      } else if (destination.type === 'province') {
        // Per le province dobbiamo cercare la region parent
        const regionSlug = destination.region_id?.translations?.[0]?.slug_permalink || 
                          regions.find(r => r.id === destination.region_id)?.translations?.[0]?.slug_permalink || 
                          'italia';
        urlPath = `${regionSlug}/${translation?.slug_permalink || destination.id}`;
      } else if (destination.type === 'municipality') {
        // Per i comuni dobbiamo cercare sia region che province parent
        const regionSlug = destination.region_id?.translations?.[0]?.slug_permalink ||
                          regions.find(r => r.id === destination.region_id)?.translations?.[0]?.slug_permalink ||
                          'italia';
        const provinceSlug = destination.province_id?.translations?.[0]?.slug_permalink ||
                            provinces.find(p => p.id === destination.province_id)?.translations?.[0]?.slug_permalink ||
                            'provincia';
        urlPath = `${regionSlug}/${provinceSlug}/${translation?.slug_permalink || destination.id}`;
      }
      
      // Proviamo diversi campi per la description delle destinazioni - priorità a description
      const possibleDescriptions = [
        translation?.description,
        translation?.seo_summary,
        translation?.seo_title,
        'Scopri questa meravigliosa destinazione italiana.' // Fallback
      ];
      
      const finalDescription = possibleDescriptions.find(desc => desc && desc.trim().length > 0) || 'Destinazione italiana di interesse';
      
      // Debug description per il primo elemento
      if (index === 0) {
        console.log('🏛️ Description debug:', {
          translation_description: translation?.description,
          translation_seo_summary: translation?.seo_summary,
          translation_seo_title: translation?.seo_title,
          finalDescription: finalDescription
        });
      }

      const result = {
        id: destination.id,
        uuid: destination.uuid_id,
        title: translation?.destination_name || 'Destinazione senza nome',
        description: translation?.description || 'Scopri questa meravigliosa destinazione italiana.',
        seo_summary: translation?.seo_summary || translation?.seo_title || 'Destinazione italiana di interesse',
        seo_title: translation?.seo_title || translation?.seo_summary || 'Destinazione italiana',
        type: 'destinazione',
        language: language,
        slug_permalink: translation?.slug_permalink || '',
        external_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${language}/${urlPath}`
      };
      
      // Debug URL per il primo elemento
      if (index === 0) {
        console.log('🔗 URL debug:', {
          urlPath: urlPath,
          external_url: result.external_url
        });
      }
      
      return result;
    });
    
    console.log(`🎯 Final destinations results: ${mappedResults.length} items`);
    return mappedResults;

  } catch (error) {
    console.error('❌ Error searching destinations:', error);
    console.error('📋 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

async function searchCompanies(query: string, language: string, limit: number): Promise<SearchResult[]> {
  try {
    console.log('🏢 Companies search params:', { query, language, limit });
    
    // Usa la stessa funzione che funziona in /reserved
    const allCompanies = await directusClient.getCompaniesForListing(language, {});
    
    console.log(`📊 Retrieved ${allCompanies.length} companies from getCompaniesForListing`);
    
    // Filtra i risultati per il termine di ricerca
    const filteredCompanies = allCompanies.filter((company: any) => {
      const companyName = company.company_name?.toLowerCase() || '';
      const description = company.translations?.[0]?.description?.toLowerCase() || '';
      const seoSummary = company.translations?.[0]?.seo_summary?.toLowerCase() || '';
      const searchTerm = query.toLowerCase();
      
      return companyName.includes(searchTerm) || 
             description.includes(searchTerm) || 
             seoSummary.includes(searchTerm);
    });
    
    console.log(`🎯 Filtered to ${filteredCompanies.length} companies matching "${query}"`);

    // Prendi solo i primi risultati in base al limit
    const companies = filteredCompanies.slice(0, limit);
    
    // Debug: stampiamo solo se necessario
    if (companies.length > 0) {
      console.log('🔍 Companies found with translations');
    }
    
    return companies.map((company: any, index: number) => {
      const translation = company.translations?.[0];
      
      // Per le aziende, manteniamo la logica che funzionava: description completa nel campo description
      const finalDescription = translation?.description || company.description || 'Eccellenza italiana di qualità premium.';

      return {
        id: company.id,
        uuid: company.uuid_id,
        title: company.company_name || 'Azienda senza nome',
        description: finalDescription, // Manteniamo la description completa qui per le aziende
        seo_summary: translation?.seo_summary || company.seo_summary || 'Eccellenza italiana',
        seo_title: translation?.seo_title || translation?.seo_summary || 'Eccellenza italiana',
        type: 'azienda',
        language: language,
        slug_permalink: company.slug_permalink || '',
        external_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${language}/poi/${company.slug_permalink || company.id}`
      };
    });

  } catch (error) {
    console.error('❌ Error searching companies:', error);
    console.error('📋 Companies error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

function getLocationString(destination: any, regionTranslation: any, provinceTranslation: any): string {
  switch (destination.type) {
    case 'region':
      return 'Italia';
    case 'province':
      return regionTranslation?.destination_name ? `${regionTranslation.destination_name}, Italia` : 'Italia';
    case 'municipality':
      return provinceTranslation?.destination_name ? `${provinceTranslation.destination_name}, Italia` : 'Italia';
    default:
      return 'Italia';
  }
}

function getDestinationCategory(type: string): string {
  switch (type) {
    case 'region':
      return 'Regione';
    case 'province':
      return 'Provincia';
    case 'municipality':
      return 'Comune';
    default:
      return 'Destinazione';
  }
} 