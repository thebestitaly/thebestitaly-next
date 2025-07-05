// src/lib/static-generation.ts
// 🚀 SISTEMA DI GENERAZIONE STATICA per 7.900 comuni italiani

import { Destination } from './directus-web';

// 🎯 Configurazione per la generazione statica
import { SUPPORTED_LANGUAGES } from './languages';

export const STATIC_GENERATION_CONFIG = {
  // Lingue supportate per la generazione statica - TUTTE LE 50 LINGUE!
  SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES.map(lang => lang.code), // 50 lingue!
  
  // Batch size per evitare memory overflow
  BATCH_SIZE: 100,
  
  // Timeout per ogni richiesta
  REQUEST_TIMEOUT: 30000,
  
  // Retry attempts
  MAX_RETRIES: 3,
};

// 🏗️ Interfaccia per i parametri statici
export interface StaticParams {
  lang: string;
  region: string;
  province?: string;
  municipality?: string;
}

// 📊 Dati minimi per la generazione statica
export interface MinimalDestination {
  id: string;
  type: 'region' | 'province' | 'municipality';
  slug: string;
  parentSlugs: {
    region?: string;
    province?: string;
  };
}

// 🎯 MOCK DATA per la generazione statica (evita chiamate DB durante build)
const ITALIAN_REGIONS_MOCK: MinimalDestination[] = [
  { id: '1', type: 'region', slug: 'lombardia', parentSlugs: {} },
  { id: '2', type: 'region', slug: 'lazio', parentSlugs: {} },
  { id: '3', type: 'region', slug: 'campania', parentSlugs: {} },
  { id: '4', type: 'region', slug: 'veneto', parentSlugs: {} },
  { id: '5', type: 'region', slug: 'emilia-romagna', parentSlugs: {} },
  { id: '6', type: 'region', slug: 'piemonte', parentSlugs: {} },
  { id: '7', type: 'region', slug: 'puglia', parentSlugs: {} },
  { id: '8', type: 'region', slug: 'toscana', parentSlugs: {} },
  { id: '9', type: 'region', slug: 'calabria', parentSlugs: {} },
  { id: '10', type: 'region', slug: 'sicilia', parentSlugs: {} },
  { id: '11', type: 'region', slug: 'sardegna', parentSlugs: {} },
  { id: '12', type: 'region', slug: 'liguria', parentSlugs: {} },
  { id: '13', type: 'region', slug: 'marche', parentSlugs: {} },
  { id: '14', type: 'region', slug: 'abruzzo', parentSlugs: {} },
  { id: '15', type: 'region', slug: 'friuli-venezia-giulia', parentSlugs: {} },
  { id: '16', type: 'region', slug: 'umbria', parentSlugs: {} },
  { id: '17', type: 'region', slug: 'basilicata', parentSlugs: {} },
  { id: '18', type: 'region', slug: 'molise', parentSlugs: {} },
  { id: '19', type: 'region', slug: 'trentino-alto-adige', parentSlugs: {} },
  { id: '20', type: 'region', slug: 'valle-d-aosta', parentSlugs: {} },
];

// 🏛️ Province principali per ogni regione (sample per ora)
const SAMPLE_PROVINCES_MOCK: MinimalDestination[] = [
  // Lombardia
  { id: '101', type: 'province', slug: 'milano', parentSlugs: { region: 'lombardia' } },
  { id: '102', type: 'province', slug: 'bergamo', parentSlugs: { region: 'lombardia' } },
  { id: '103', type: 'province', slug: 'brescia', parentSlugs: { region: 'lombardia' } },
  
  // Lazio
  { id: '201', type: 'province', slug: 'roma', parentSlugs: { region: 'lazio' } },
  { id: '202', type: 'province', slug: 'latina', parentSlugs: { region: 'lazio' } },
  
  // Campania
  { id: '301', type: 'province', slug: 'napoli', parentSlugs: { region: 'campania' } },
  { id: '302', type: 'province', slug: 'salerno', parentSlugs: { region: 'campania' } },
];

// 🏘️ Comuni campione per ogni provincia
const SAMPLE_MUNICIPALITIES_MOCK: MinimalDestination[] = [
  // Milano
  { id: '1001', type: 'municipality', slug: 'milano', parentSlugs: { region: 'lombardia', province: 'milano' } },
  { id: '1002', type: 'municipality', slug: 'monza', parentSlugs: { region: 'lombardia', province: 'milano' } },
  
  // Roma
  { id: '2001', type: 'municipality', slug: 'roma', parentSlugs: { region: 'lazio', province: 'roma' } },
  { id: '2002', type: 'municipality', slug: 'tivoli', parentSlugs: { region: 'lazio', province: 'roma' } },
  
  // Napoli
  { id: '3001', type: 'municipality', slug: 'napoli', parentSlugs: { region: 'campania', province: 'napoli' } },
  { id: '3002', type: 'municipality', slug: 'pompei', parentSlugs: { region: 'campania', province: 'napoli' } },
];

// 🎯 FUNZIONI DI GENERAZIONE STATICA

/**
 * Genera tutti i parametri statici per le regioni
 */
export async function generateRegionStaticParams(): Promise<StaticParams[]> {
  console.log('🏗️ Generating static params for regions...');
  
  const params: StaticParams[] = [];
  
  for (const lang of STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES) {
    for (const region of ITALIAN_REGIONS_MOCK) {
      params.push({
        lang,
        region: region.slug,
      });
    }
  }
  
  console.log(`✅ Generated ${params.length} region static params`);
  return params;
}

/**
 * Genera tutti i parametri statici per le province
 */
export async function generateProvinceStaticParams(): Promise<StaticParams[]> {
  console.log('🏗️ Generating static params for provinces...');
  
  const params: StaticParams[] = [];
  
  for (const lang of STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES) {
    for (const province of SAMPLE_PROVINCES_MOCK) {
      params.push({
        lang,
        region: province.parentSlugs.region!,
        province: province.slug,
      });
    }
  }
  
  console.log(`✅ Generated ${params.length} province static params`);
  return params;
}

/**
 * Genera tutti i parametri statici per i comuni
 */
export async function generateMunicipalityStaticParams(): Promise<StaticParams[]> {
  console.log('🏗️ Generating static params for municipalities...');
  
  const params: StaticParams[] = [];
  
  for (const lang of STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES) {
    for (const municipality of SAMPLE_MUNICIPALITIES_MOCK) {
      params.push({
        lang,
        region: municipality.parentSlugs.region!,
        province: municipality.parentSlugs.province!,
        municipality: municipality.slug,
      });
    }
  }
  
  console.log(`✅ Generated ${params.length} municipality static params`);
  return params;
}

/**
 * 🚀 FUNZIONE PRINCIPALE: Genera tutti i parametri statici
 */
export async function generateAllStaticParams(): Promise<{
  regions: StaticParams[];
  provinces: StaticParams[];
  municipalities: StaticParams[];
}> {
  console.log('🚀 Starting static generation for all Italian destinations...');
  
  const [regions, provinces, municipalities] = await Promise.all([
    generateRegionStaticParams(),
    generateProvinceStaticParams(),
    generateMunicipalityStaticParams(),
  ]);
  
  const total = regions.length + provinces.length + municipalities.length;
  console.log(`🎉 Total static pages to generate: ${total}`);
  
  return {
    regions,
    provinces,
    municipalities,
  };
}

/**
 * 🔄 Funzione per espandere i dati quando il DB è disponibile
 */
export async function expandStaticDataFromDB(): Promise<void> {
  console.log('🔄 Future: Will expand static data from real DB when stable...');
  // TODO: Implementare quando Directus è stabile
  // - Fetch real regions/provinces/municipalities
  // - Generate complete 7.900 municipalities
  // - Save to static files for build-time usage
}

/**
 * 📊 Statistiche di generazione
 */
export function getStaticGenerationStats() {
  const totalRegions = ITALIAN_REGIONS_MOCK.length;
  const totalProvinces = SAMPLE_PROVINCES_MOCK.length;
  const totalMunicipalities = SAMPLE_MUNICIPALITIES_MOCK.length;
  const totalLanguages = STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES.length;
  
  return {
    regions: totalRegions * totalLanguages,
    provinces: totalProvinces * totalLanguages,
    municipalities: totalMunicipalities * totalLanguages,
    total: (totalRegions + totalProvinces + totalMunicipalities) * totalLanguages,
    languages: totalLanguages,
  };
}

/**
 * 🎯 PIANO COMPLETO per le 39.500 pagine
 */
export function getCompleteGenerationPlan() {
  const ITALIAN_REAL_DATA = {
    regions: 20,        // Tutte le regioni italiane
    provinces: 110,     // Tutte le province italiane
    municipalities: 7900, // Tutti i comuni italiani
  };
  
  const languages = STATIC_GENERATION_CONFIG.SUPPORTED_LANGUAGES.length; // 50 LINGUE!
  
  const COMPLETE_PLAN = {
    // 🏛️ FASE 1 - ATTUALE (COMPLETATA)
    current: {
      regions: ITALIAN_REGIONS_MOCK.length * languages,     // 20 × 50 = 1.000
      provinces: SAMPLE_PROVINCES_MOCK.length * languages,  // 7 × 50 = 350  
      municipalities: SAMPLE_MUNICIPALITIES_MOCK.length * languages, // 6 × 50 = 300
      other_pages: 33, // Homepage, debug, reserved, etc.
      total: (20 + 7 + 6) * languages + 33 // 1.683 pagine attuali
    },
    
    // 🚀 FASE 2 - OBIETTIVO FINALE
    target: {
      regions: ITALIAN_REAL_DATA.regions * languages,           // 20 × 50 = 1.000
      provinces: ITALIAN_REAL_DATA.provinces * languages,       // 110 × 50 = 5.500
      municipalities: ITALIAN_REAL_DATA.municipalities * languages, // 7.900 × 50 = 395.000
      other_pages: 33,
      total: (20 + 110 + 7900) * languages + 33 // 401.533 pagine totali!!!
    },
    
    // 📈 INCREMENTO NECESSARIO
    missing: {
      provinces: (ITALIAN_REAL_DATA.provinces - SAMPLE_PROVINCES_MOCK.length) * languages, // 103 × 50 = 5.150
      municipalities: (ITALIAN_REAL_DATA.municipalities - SAMPLE_MUNICIPALITIES_MOCK.length) * languages, // 7.894 × 50 = 394.700
      total: ((ITALIAN_REAL_DATA.provinces - SAMPLE_PROVINCES_MOCK.length) + 
               (ITALIAN_REAL_DATA.municipalities - SAMPLE_MUNICIPALITIES_MOCK.length)) * languages // 399.850 pagine!!!
    }
  };
  
  return COMPLETE_PLAN;
}

/**
 * 🔄 STRATEGIA DI IMPLEMENTAZIONE per le 39.500 pagine
 */
export function getImplementationStrategy() {
  return {
    // 🎯 FASE 1: COMPLETATA ✅
    phase1: {
      name: "Proof of Concept",
      status: "✅ COMPLETATA",
      pages: 198,
      description: "Architettura SSR + Static Generation funzionante con dati campione"
    },
    
    // 🚀 FASE 2: PROSSIMA
    phase2: {
      name: "Province Complete", 
      status: "🔄 PROSSIMA",
      pages: 5500, // tutte le 110 province × 50 lingue
      description: "Espandere da 7 a 110 province italiane",
      action: "Fetch province reali da Directus quando stabile"
    },
    
    // 🎯 FASE 3: FINALE
    phase3: {
      name: "Comuni Completi",
      status: "🎯 OBIETTIVO FINALE", 
      pages: 395000, // tutti i 7.900 comuni × 50 lingue!!!
      description: "Generazione di tutti i comuni italiani",
      challenges: [
        "Directus server stability",
        "Build time optimization (attualmente ~60s timeout)",
        "Memory management per 395.000 pagine",
        "Incremental generation strategy",
        "CRISTO SANTO sono 395.000 pagine non 39.500!"
      ]
    }
  };
} 