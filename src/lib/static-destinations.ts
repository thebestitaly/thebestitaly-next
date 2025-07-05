// Pre-generazione statica per destinazioni
// Dato che province/comuni sono statici, possiamo generare questi dati
// e servirli direttamente dal file system

import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import directusWebClient, { getSupportedLanguages, Destination } from './directus-web';

const STATIC_DATA_DIR = path.join(process.cwd(), '.next', 'static-destinations');
const CACHE_VERSION = '3.0-safe';

interface StaticDestinationData {
  version: string;
  timestamp: number;
  data: {
    regionProvinces: Record<string, Record<string, Destination[]>>;
    provinceMunicipalities: Record<string, Record<string, Destination[]>>;
    destinationDetails: Record<string, Record<string, Destination>>;
  };
}

// Assicurati che la directory esista
async function ensureStaticDir() {
  if (!existsSync(STATIC_DATA_DIR)) {
    await fs.mkdir(STATIC_DATA_DIR, { recursive: true });
  }
}

// Genera il nome del file cache
function getCacheFileName(type: string, lang: string): string {
  return path.join(STATIC_DATA_DIR, `${type}-${lang}.json`);
}

// Controlla se il cache è valido (max 7 giorni per dati statici)
function isCacheValid(timestamp: number): boolean {
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 giorni
  return Date.now() - timestamp < MAX_AGE;
}

// 🔧 OTTIMIZZATA: Funzione con retry per gestire timeout
async function fetchWithRetry<T>(
  fetchFunction: () => Promise<T>,
  description: string,
  maxRetries: number = 2,
  delayMs: number = 5000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fetchFunction();
      return result;
    } catch (error: any) {
      lastError = error;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log(`⏰ Timeout su ${description} (tentativo ${attempt}/${maxRetries + 1})`);
        
        if (attempt <= maxRetries) {
          console.log(`🔄 Riprovo tra ${delayMs/1000} secondi...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      
      // Se non è un timeout o abbiamo esaurito i tentativi, rilancia l'errore
      throw error;
    }
  }
  
  throw lastError;
}

// Genera tutti i dati statici delle destinazioni in modo efficiente
export async function generateStaticDestinations(langsToGenerate?: string[]) {
  console.log('--- ✅ INIZIO GENERAZIONE EFFICIENTE CACHE DESTINAZIONI ---');
  await ensureStaticDir();

  const languages = langsToGenerate || await getSupportedLanguages();
  if (!languages || languages.length === 0) {
    console.error('ERRORE FATALE: Lingue non trovate. Processo interrotto.');
    return;
  }
  console.log(`Lingue da processare: ${languages.join(', ')}`);

  // Prepara una struttura dati vuota per ogni lingua
  const staticDataPerLang: Record<string, StaticDestinationData> = {};
  for (const lang of languages) {
    staticDataPerLang[lang] = {
      version: CACHE_VERSION,
      timestamp: 0, // Verrà aggiornato alla fine
      data: {
        regionProvinces: {},
        provinceMunicipalities: {},
        destinationDetails: {},
      },
    };
  }

  try {
    // 1. Scarica TUTTE le regioni con TUTTE le loro traduzioni
    console.log('PASSO 1: Scarico tutte le regioni...');
    const allRegions = await directusWebClient.getDestinations({ type: 'region', limit: -1, lang: 'it' });
    console.log(`Trovate ${allRegions.length} regioni totali.`);

    // 2. Itera su ogni regione per scaricare le sue province
    for (const region of allRegions) {
      console.log(`  - Processo regione: ${region.id}`);
      const allProvinces = await directusWebClient.getDestinations({ type: 'province', parent_id: region.id, limit: -1, lang: 'it' });

      // 3. Itera su ogni provincia per scaricare i suoi comuni
      for (const province of allProvinces) {
        const allMunicipalities = await directusWebClient.getDestinations({ type: 'municipality', parent_id: province.id, limit: 30, lang: 'it' }); // LIMITE TEMPORANEO PER ANDARE ONLINE

        // 4. Ora distribuisci i dati raccolti (regione, province, comuni) nei secchi di ogni lingua
        for (const lang of languages) {
          const langData = staticDataPerLang[lang].data;

          const regionT = region.translations.find(t => t.languages_code === lang);
          const provinceT = province.translations.find(t => t.languages_code === lang);

          if (!regionT || !provinceT) continue; // Se la regione o la provincia non è tradotta, salta

          const regionForLang = { ...region, translations: [regionT] };
          const provinceForLang = { ...province, translations: [provinceT] };
          
          // Aggiungi dettagli
          langData.destinationDetails[region.id] = { ...langData.destinationDetails[region.id], [lang]: regionForLang };
          langData.destinationDetails[province.id] = { ...langData.destinationDetails[province.id], [lang]: provinceForLang };

          // Aggiungi provincia alla sua regione
          if (!langData.regionProvinces[region.id]) langData.regionProvinces[region.id] = {};
          if (!langData.regionProvinces[region.id][lang]) langData.regionProvinces[region.id][lang] = [];
          if (!langData.regionProvinces[region.id][lang].some(p => p.id === province.id)) {
            langData.regionProvinces[region.id][lang].push(provinceForLang);
          }

          // Prepara e aggiungi comuni alla loro provincia
          if (!langData.provinceMunicipalities[province.id]) langData.provinceMunicipalities[province.id] = {};
          
          const municipalitiesForLang = allMunicipalities
            .map(muni => {
              const muniT = muni.translations.find(t => t.languages_code === lang);
              if (!muniT) return null;
              const muniForLang = { ...muni, translations: [muniT] };
              langData.destinationDetails[muni.id] = { ...langData.destinationDetails[muni.id], [lang]: muniForLang };
              return muniForLang;
            })
            .filter((m): m is Destination => m !== null);
          
          langData.provinceMunicipalities[province.id][lang] = municipalitiesForLang;
        }
      }
       console.log(`    Completate ${allProvinces.length} province per la regione ${region.id}.`);
    }

    // 5. Scrivi un file di cache per ogni lingua
    const finalTimestamp = Date.now();
    for (const lang of languages) {
      staticDataPerLang[lang].timestamp = finalTimestamp;
      const fileName = getCacheFileName('destinations', lang);
      await fs.writeFile(fileName, JSON.stringify(staticDataPerLang[lang], null, 2));
      console.log(`✅ FILE STATICO EFFICIENTE scritto per [${lang.toUpperCase()}] -> ${fileName}`);
    }

  } catch (error) {
    console.error(`\n❌ ERRORE FATALE durante la generazione efficiente.`, error);
  }

  console.log('\n--- 🎉 Processo di generazione EFFICIENTE completato. ---');
}

// 🆕 NUOVA: Funzione per recuperare solo le province mancanti
export async function fixMissingProvinces(lang: string = 'it') {
  console.log(`🔧 Recuperando province mancanti per ${lang}...`);
  
  const fileName = getCacheFileName('destinations', lang);
  if (!existsSync(fileName)) {
    console.log(`❌ File cache non trovato: ${fileName}`);
    return;
  }
  
  const data = await fs.readFile(fileName, 'utf-8');
  const staticData: StaticDestinationData = JSON.parse(data);
  
  let fixed = 0;
  
  // Trova province con 0 comuni
  const provinces = Object.keys(staticData.data.provinceMunicipalities);
  
  for (const provinceId of provinces) {
    const municipalities = staticData.data.provinceMunicipalities[provinceId]?.[lang] || [];
    
    if (municipalities.length === 0) {
      const provinceDetail = staticData.data.destinationDetails[provinceId]?.[lang];
      const provinceName = provinceDetail?.translations[0]?.destination_name || `Province ID ${provinceId}`;
      
      console.log(`🔄 Recuperando comuni per ${provinceName}...`);
      
      try {
        const newMunicipalities = await fetchWithRetry(
          () => directusWebClient.getDestinations({
            type: 'municipality',
            parent_id: provinceId,
            lang,
            limit: 500
          }),
          `comuni per provincia ${provinceName}`,
          3,
          15000 // 15 secondi di delay per province problematiche
        );
        
        staticData.data.provinceMunicipalities[provinceId][lang] = newMunicipalities as Destination[];
        
        // Salva anche i dettagli dei comuni
        for (const municipality of newMunicipalities as Destination[]) {
          staticData.data.destinationDetails[municipality.id] = staticData.data.destinationDetails[municipality.id] || {};
          staticData.data.destinationDetails[municipality.id][lang] = municipality;
        }
        
        console.log(`✅ ${provinceName}: ${newMunicipalities.length} comuni recuperati`);
        fixed++;
        
        // Pausa più lunga per province problematiche
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error: any) {
        console.error(`❌ Impossibile recuperare ${provinceName}:`, error.message);
      }
    }
  }
  
  if (fixed > 0) {
    // Aggiorna timestamp
    staticData.timestamp = Date.now();
    
    // Salva il file aggiornato
    await fs.writeFile(fileName, JSON.stringify(staticData, null, 2));
    console.log(`✅ Aggiornato cache statico con ${fixed} province recuperate`);
  } else {
    console.log(`ℹ️ Nessuna provincia da recuperare`);
  }
}

// Carica i dati statici per una lingua specifica
async function loadStaticData(lang: string): Promise<StaticDestinationData | null> {
  try {
    const fileName = getCacheFileName('destinations', lang);
    
    if (!existsSync(fileName)) {
      return null;
    }
    
    const data = await fs.readFile(fileName, 'utf-8');
    const staticData: StaticDestinationData = JSON.parse(data);
    
    // Verifica versione e validità
    if (staticData.version !== CACHE_VERSION || !isCacheValid(staticData.timestamp)) {
      console.log(`⚠️ Cache statico scaduto o versione non valida per ${lang}`);
      return null;
    }
    
    return staticData;
  } catch (error) {
    console.error(`❌ Errore caricando dati statici per ${lang}:`, error);
    return null;
  }
}

// API OTTIMIZZATE PER DATI STATICI

// Ottieni province di una regione (ULTRA-VELOCE) - CON FALLBACK DIRECTUS
export async function getProvincesForRegion(regionId: string, lang: string): Promise<Destination[]> {
  const staticData = await loadStaticData(lang);
  
  if (staticData?.data.regionProvinces[regionId]?.[lang]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 STATIC HIT: Province per regione ${regionId} (${lang})`);
    }
    return staticData.data.regionProvinces[regionId][lang];
  }
  
  // 🔄 FALLBACK A DIRECTUS quando cache non disponibile
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 FALLBACK DIRECTUS: Carico province per regione ${regionId} (${lang}) da Directus`);
  }
  
  try {
    return await directusWebClient.getDestinations({
      type: 'province',
      parent_id: regionId,
      lang,
      fields: 'full',
      limit: 100
    });
  } catch (error) {
    console.error(`❌ Errore caricando province per regione ${regionId}:`, error);
    return [];
  }
}

// Ottieni comuni di una provincia (ULTRA-VELOCE) - CON FALLBACK DIRECTUS
export async function getMunicipalitiesForProvince(provinceId: string, lang: string): Promise<Destination[]> {
  const staticData = await loadStaticData(lang);
  
  if (staticData?.data.provinceMunicipalities[provinceId]?.[lang]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 STATIC HIT: Comuni per provincia ${provinceId} (${lang})`);
    }
    return staticData.data.provinceMunicipalities[provinceId][lang];
  }
  
  // 🔄 FALLBACK A DIRECTUS quando cache non disponibile
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 FALLBACK DIRECTUS: Carico comuni per provincia ${provinceId} (${lang}) da Directus`);
  }
  
  try {
    return await directusWebClient.getDestinations({
      type: 'municipality',
      parent_id: provinceId,
      lang,
      fields: 'full',
      limit: 50 // Limite più conservativo per i comuni
    });
  } catch (error) {
    console.error(`❌ Errore caricando comuni per provincia ${provinceId}:`, error);
    return [];
  }
}

function getSafeId(value: any): string | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'object' && value !== null && value.id) {
        return String(value.id);
    }
    return null;
}

// Ottieni dettagli destinazione (DIRECT DIRECTUS APPROACH)
export async function getDestinationDetails(slug: string, lang: string, type: 'region' | 'province' | 'municipality'): Promise<Destination | null> {
  // 🚀 ENHANCED SKIP: Avoid querying non-destination slugs
  if (slug.includes('.') || 
      slug === 'monitoring' || 
      slug.includes('chrome') || 
      slug.includes('font') || 
      slug.includes('well-known') ||
      slug === 'api' || 
      slug === 'admin' || 
      slug === 'translations' ||
      slug.includes('_next') ||
      slug.includes('favicon')) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚫 SKIPPING: Non-destination slug "${slug}"`);
    }
    return null;
  }
  
  try {
    // 🚀 DIRECT DIRECTUS APPROACH: Skip static files for now, go directly to Directus
    console.log(`📝 Direct Directus lookup for destination: ${slug} (${lang}, ${type})`);
    const destinations = await directusWebClient.getDestinations({
      slug,
      type,
      lang,
      fields: 'full',
      limit: 1
    });
    
    if (destinations && destinations.length > 0) {
      console.log(`✅ Found destination: ${destinations[0].translations[0]?.destination_name}`);
      return destinations[0];
    }
    
    console.log(`❌ No destination found for slug: ${slug}`);
    return null;

  } catch (error) {
    console.error(`❌ Error loading destination ${slug}:`, error);
    return null;
  }
}

// Funzione per invalidare cache statico (da usare quando si aggiornano dati)
export async function invalidateStaticCache(lang?: string) {
  const languages = lang ? [lang] : [
    'af', 'am', 'ar', 'az', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 
  'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 
  'hu', 'hy', 'id', 'is', 'it', 'ja', 'ka', 'ko', 'lt', 'lv', 
  'mk', 'ms', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 
  'sv', 'sw', 'th', 'tl', 'tk', 'uk', 'ur', 'vi', 'zh', 'zh-tw'
  ];
  
  for (const l of languages) {
    const fileName = getCacheFileName('destinations', l);
    if (existsSync(fileName)) {
      await fs.writeFile(fileName, JSON.stringify({ version: 'invalidated' }));
      console.log(`🗑️ Cache statico invalidato per ${l}`);
    }
  }
}

// Funzione per verificare lo stato del cache
export async function getStaticCacheStatus(): Promise<Record<string, { exists: boolean; valid: boolean; timestamp?: number }>> {
  const languages = ['it', 'en', 'fr', 'de', 'es'];
  const status: Record<string, { exists: boolean; valid: boolean; timestamp?: number }> = {};
  
  for (const lang of languages) {
    const fileName = getCacheFileName('destinations', lang);
    const exists = existsSync(fileName);
    
    if (exists) {
      try {
        const data = await fs.readFile(fileName, 'utf-8');
        const staticData: StaticDestinationData = JSON.parse(data);
        
        status[lang] = {
          exists: true,
          valid: staticData.version === CACHE_VERSION && isCacheValid(staticData.timestamp),
          timestamp: staticData.timestamp
        };
      } catch {
        status[lang] = { exists: true, valid: false };
      }
    } else {
      status[lang] = { exists: false, valid: false };
    }
  }
  
  return status;
} 