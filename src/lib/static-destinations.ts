// Pre-generazione statica per destinazioni
// Dato che province/comuni sono statici, possiamo generare questi dati
// e servirli direttamente dal file system

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import directusClient from './directus';
import type { Destination } from './directus';

const STATIC_DATA_DIR = path.join(process.cwd(), '.next', 'static-destinations');
const CACHE_VERSION = '1.0'; // Incrementa per invalidare cache

interface StaticDestinationData {
  version: string;
  timestamp: number;
  data: {
    regionProvinces: Record<string, Record<string, Destination[]>>; // regionId -> lang -> provinces[]
    provinceMunicipalities: Record<string, Record<string, Destination[]>>; // provinceId -> lang -> municipalities[]
    destinationDetails: Record<string, Record<string, Destination>>; // destinationId -> lang -> destination
  };
}

// Assicurati che la directory esista
async function ensureStaticDir() {
  if (!existsSync(STATIC_DATA_DIR)) {
    await mkdir(STATIC_DATA_DIR, { recursive: true });
  }
}

// Genera il nome del file cache
function getCacheFileName(type: string, lang: string): string {
  return path.join(STATIC_DATA_DIR, `${type}-${lang}-${CACHE_VERSION}.json`);
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

// Genera tutti i dati statici delle destinazioni
export async function generateStaticDestinations(languages: string[] = ['it', 'en', 'fr', 'de', 'es']) {
  console.log('🚀 Generando dati statici delle destinazioni...');
  
  await ensureStaticDir();
  
  for (const lang of languages) {
    console.log(`📝 Generando dati per lingua: ${lang}`);
    
    const staticData: StaticDestinationData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data: {
        regionProvinces: {},
        provinceMunicipalities: {},
        destinationDetails: {}
      }
    };

    const failedProvinces: Array<{province: any, error: string}> = [];

    try {
      // 1. Ottieni tutte le regioni
      const regions = await fetchWithRetry(
        () => directusClient.getDestinationsByType('region', lang),
        `regioni per ${lang}`
      );
      console.log(`   → ${regions.length} regioni trovate`);

      // 2. Per ogni regione, ottieni le province
      for (const region of regions) {
        try {
          const provinces = await fetchWithRetry(
            () => directusClient.getDestinations({
              type: 'province',
              region_id: region.id,
              lang,
              limit: 200
            }),
            `province per regione ${region.translations[0]?.destination_name}`
          );
          
          staticData.data.regionProvinces[region.id] = staticData.data.regionProvinces[region.id] || {};
          staticData.data.regionProvinces[region.id][lang] = provinces;
          
          // Salva anche i dettagli della regione
          staticData.data.destinationDetails[region.id] = staticData.data.destinationDetails[region.id] || {};
          staticData.data.destinationDetails[region.id][lang] = region;
          
          console.log(`   → Regione ${region.translations[0]?.destination_name}: ${provinces.length} province`);

          // 3. Per ogni provincia, ottieni i comuni (CON RETRY)
          for (const province of provinces) {
            const provinceName = province.translations[0]?.destination_name || `Province ID ${province.id}`;
            
            try {
              const municipalities = await fetchWithRetry(
                () => directusClient.getDestinations({
                  type: 'municipality',
                  province_id: province.id,
                  lang,
                  limit: 500
                }),
                `comuni per provincia ${provinceName}`,
                3, // 3 retry per i comuni (più critici)
                10000 // 10 secondi di delay
              );
              
              staticData.data.provinceMunicipalities[province.id] = staticData.data.provinceMunicipalities[province.id] || {};
              staticData.data.provinceMunicipalities[province.id][lang] = municipalities;
              
              console.log(`     → Provincia ${provinceName}: ${municipalities.length} comuni`);
              
            } catch (error: any) {
              console.error(`❌ ERRORE provincia ${provinceName}:`, error.message);
              failedProvinces.push({
                province: province,
                error: error.message
              });
              
              // Salva comunque la provincia con array vuoto per evitare errori
              staticData.data.provinceMunicipalities[province.id] = staticData.data.provinceMunicipalities[province.id] || {};
              staticData.data.provinceMunicipalities[province.id][lang] = [];
            }
            
            // Salva i dettagli della provincia
            staticData.data.destinationDetails[province.id] = staticData.data.destinationDetails[province.id] || {};
            staticData.data.destinationDetails[province.id][lang] = province;
            
            // Breve pausa per non sovraccaricare Directus
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error: any) {
          console.error(`❌ ERRORE regione ${region.translations[0]?.destination_name}:`, error.message);
        }
      }

      // Salva i dati statici per questa lingua
      const fileName = getCacheFileName('destinations', lang);
      await writeFile(fileName, JSON.stringify(staticData, null, 2));
      
      console.log(`✅ Dati statici salvati per ${lang}: ${fileName}`);
      
      // Report finale
      if (failedProvinces.length > 0) {
        console.log(`\n⚠️ ${failedProvinces.length} province hanno avuto problemi:`);
        failedProvinces.forEach((item, i) => {
          const provinceName = item.province.translations[0]?.destination_name || 'Sconosciuta';
          console.log(`   ${i+1}. ${provinceName} - ${item.error}`);
        });
        console.log(`\n💡 Suggerimento: Riesegui lo script più tardi per recuperare le province mancanti`);
      }
      
    } catch (error) {
      console.error(`❌ Errore generando dati statici per ${lang}:`, error);
    }
  }
  
  console.log('🎉 Generazione dati statici completata!');
}

// 🆕 NUOVA: Funzione per recuperare solo le province mancanti
export async function fixMissingProvinces(lang: string = 'it') {
  console.log(`🔧 Recuperando province mancanti per ${lang}...`);
  
  const fileName = getCacheFileName('destinations', lang);
  if (!existsSync(fileName)) {
    console.log(`❌ File cache non trovato: ${fileName}`);
    return;
  }
  
  const data = JSON.parse(await readFile(fileName, 'utf-8'));
  const staticData: StaticDestinationData = data;
  
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
          () => directusClient.getDestinations({
            type: 'municipality',
            province_id: provinceId,
            lang,
            limit: 500
          }),
          `comuni per provincia ${provinceName}`,
          3,
          15000 // 15 secondi di delay per province problematiche
        );
        
        staticData.data.provinceMunicipalities[provinceId][lang] = newMunicipalities;
        
        // Salva anche i dettagli dei comuni
        for (const municipality of newMunicipalities) {
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
    await writeFile(fileName, JSON.stringify(staticData, null, 2));
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
    
    const data = await readFile(fileName, 'utf-8');
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

// Ottieni province di una regione (ULTRA-VELOCE)
export async function getProvincesForRegion(regionId: string, lang: string): Promise<Destination[]> {
  const staticData = await loadStaticData(lang);
  
  if (staticData?.data.regionProvinces[regionId]?.[lang]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 STATIC HIT: Province per regione ${regionId} (${lang})`);
    }
    return staticData.data.regionProvinces[regionId][lang];
  }
  
  // Fallback to regular API
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 STATIC MISS: Province per regione ${regionId} (${lang}) - usando API`);
  }
  return await directusClient.getDestinations({
    type: 'province',
    region_id: regionId,
    lang,
    limit: 200
  });
}

// Ottieni comuni di una provincia (ULTRA-VELOCE)
export async function getMunicipalitiesForProvince(provinceId: string, lang: string): Promise<Destination[]> {
  const staticData = await loadStaticData(lang);
  
  if (staticData?.data.provinceMunicipalities[provinceId]?.[lang]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 STATIC HIT: Comuni per provincia ${provinceId} (${lang})`);
    }
    return staticData.data.provinceMunicipalities[provinceId][lang];
  }
  
  // Fallback to regular API
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 STATIC MISS: Comuni per provincia ${provinceId} (${lang}) - usando API`);
  }
  return await directusClient.getDestinations({
    type: 'municipality',
    province_id: provinceId,
    lang,
    limit: 500
  });
}

// Ottieni dettagli destinazione (ULTRA-VELOCE)
export async function getDestinationDetails(destinationId: string, lang: string): Promise<Destination | null> {
  const staticData = await loadStaticData(lang);
  
  if (staticData?.data.destinationDetails[destinationId]?.[lang]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 STATIC HIT: Dettagli destinazione ${destinationId} (${lang})`);
    }
    return staticData.data.destinationDetails[destinationId][lang];
  }
  
  // Fallback to regular API
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 STATIC MISS: Dettagli destinazione ${destinationId} (${lang}) - usando API`);
  }
  return await directusClient.getDestinationById(destinationId, lang);
}

// Funzione per invalidare cache statico (da usare quando si aggiornano dati)
export async function invalidateStaticCache(lang?: string) {
  const languages = lang ? [lang] : ['it', 'en', 'fr', 'de', 'es'];
  
  for (const l of languages) {
    const fileName = getCacheFileName('destinations', l);
    if (existsSync(fileName)) {
      await writeFile(fileName, JSON.stringify({ version: 'invalidated' }));
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
        const data = await readFile(fileName, 'utf-8');
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