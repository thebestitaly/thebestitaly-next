import { Client } from 'pg';
import { getFallbackTranslation, getFallbackTranslationsForSection } from './translations-fallback';

// Cache per le traduzioni (evita query ripetute)
const translationCache = new Map<string, Map<string, string>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti
let lastCacheUpdate = 0;

// Interfacce TypeScript
export interface TranslationKey {
  id: number;
  key_name: string;
  section: string;
  description?: string;
}

export interface TranslationValue {
  id: number;
  key_id: number;
  language_code: string;
  value: string;
}

export interface Translation {
  key_name: string;
  section: string;
  values: Record<string, string>; // { 'it': 'Ciao', 'en': 'Hello' }
}

// Client database con gestione errori migliorata
function getDbClient() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.warn('⚠️ DATABASE_URL non configurato, usando fallback');
    // Fallback per sviluppo locale
    return new Client({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'password'
    });
  }
  
  return new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

/**
 * Carica tutte le traduzioni dal database e aggiorna la cache
 */
async function loadTranslationsToCache(): Promise<void> {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    // Verifica se le tabelle esistono
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'translation_keys'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.warn('⚠️ Tabelle traduzioni non esistono, usando cache vuota');
      lastCacheUpdate = Date.now();
      return;
    }
    
    const query = `
      SELECT 
        tk.key_name,
        tk.section,
        tv.language_code,
        tv.value
      FROM translation_keys tk
      JOIN translation_values tv ON tk.id = tv.key_id
      ORDER BY tk.section, tk.key_name, tv.language_code
    `;
    
    const result = await client.query(query);
    
    // Pulisci cache esistente
    translationCache.clear();
    
    // Popola cache
    for (const row of result.rows) {
      const { key_name, section, language_code, value } = row;
      const cacheKey = `${section}.${key_name}`;
      
      if (!translationCache.has(cacheKey)) {
        translationCache.set(cacheKey, new Map());
      }
      
      translationCache.get(cacheKey)!.set(language_code, value);
    }
    
    lastCacheUpdate = Date.now();
   
  } catch (error) {
    console.error('❌ Errore caricando traduzioni:', error);
    console.warn('⚠️ Usando cache vuota come fallback');
    // Non fare throw dell'errore, usa cache vuota
    lastCacheUpdate = Date.now();
  } finally {
    try {
      await client.end();
    } catch (e) {
      console.error('❌ Errore chiudendo connessione DB:', e);
    }
  }
}

/**
 * Verifica se la cache è valida
 */
function isCacheValid(): boolean {
  return Date.now() - lastCacheUpdate < CACHE_DURATION;
}

/**
 * Ottieni una traduzione specifica
 */
export async function getTranslation(
  keyName: string, 
  languageCode: string, 
  section?: string,
  fallbackLanguage: string = 'it'
): Promise<string> {
  // Aggiorna cache se necessario
  if (!isCacheValid()) {
    await loadTranslationsToCache();
  }
  
  // Cerca con sezione specifica se fornita
  if (section) {
    const cacheKey = `${section}.${keyName}`;
    const translations = translationCache.get(cacheKey);
    
    if (translations) {
      return translations.get(languageCode) || 
             translations.get(fallbackLanguage) || 
             keyName;
    }
  }
  
  // Cerca in tutte le sezioni
  for (const [cacheKey, translations] of translationCache.entries()) {
    if (cacheKey.endsWith(`.${keyName}`)) {
      return translations.get(languageCode) || 
             translations.get(fallbackLanguage) || 
             keyName;
    }
  }
  
  // Fallback: cerca nelle traduzioni di fallback
  const fallbackTranslation = getFallbackTranslation(section || 'common', keyName, languageCode, fallbackLanguage);
  if (fallbackTranslation !== keyName) {
    return fallbackTranslation;
  }
  
  // Ultimo fallback: ritorna la chiave stessa
  console.warn(`⚠️ Traduzione non trovata: ${keyName} (${languageCode})`);
  return keyName;
}

/**
 * Ottieni tutte le traduzioni per una sezione
 */
export async function getTranslationsForSection(
  section: string, 
  languageCode: string,
  fallbackLanguage: string = 'it'
): Promise<Record<string, string>> {
  // Aggiorna cache se necessario
  if (!isCacheValid()) {
    await loadTranslationsToCache();
  }
  
  const result: Record<string, string> = {};
  
  for (const [cacheKey, translations] of translationCache.entries()) {
    const [keySection, keyName] = cacheKey.split('.');
    
    if (keySection === section) {
      result[keyName] = translations.get(languageCode) || 
                       translations.get(fallbackLanguage) || 
                       keyName;
    }
  }
  
  // Se non ci sono traduzioni dal database, usa fallback
  if (Object.keys(result).length === 0) {
    return getFallbackTranslationsForSection(section, languageCode, fallbackLanguage);
  }
  
  return result;
}

/**
 * Ottieni tutte le traduzioni per una lingua
 */
export async function getAllTranslations(
  languageCode: string,
  fallbackLanguage: string = 'it'
): Promise<Record<string, Record<string, string>>> {
  // Aggiorna cache se necessario
  if (!isCacheValid()) {
    await loadTranslationsToCache();
  }
  
  const result: Record<string, Record<string, string>> = {};
  
  for (const [cacheKey, translations] of translationCache.entries()) {
    const [section, keyName] = cacheKey.split('.');
    
    if (!result[section]) {
      result[section] = {};
    }
    
    result[section][keyName] = translations.get(languageCode) || 
                               translations.get(fallbackLanguage) || 
                               keyName;
  }
  
  return result;
}

/**
 * Aggiungi o aggiorna una traduzione
 */
export async function setTranslation(
  keyName: string,
  section: string,
  translations: Record<string, string>,
  description?: string
): Promise<void> {
  const client = getDbClient();
  
  try {
    await client.connect();
    await client.query('BEGIN');
    
    // Inserisci o aggiorna la chiave
    const keyResult = await client.query(`
      INSERT INTO translation_keys (key_name, section, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key_name) 
      DO UPDATE SET section = $2, description = $3, updated_at = NOW()
      RETURNING id
    `, [keyName, section, description]);
    
    const keyId = keyResult.rows[0].id;
    
    // Inserisci o aggiorna i valori
    for (const [langCode, value] of Object.entries(translations)) {
      await client.query(`
        INSERT INTO translation_values (key_id, language_code, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (key_id, language_code)
        DO UPDATE SET value = $3, updated_at = NOW()
      `, [keyId, langCode, value]);
    }
    
    await client.query('COMMIT');
    
    // Invalida cache
    lastCacheUpdate = 0;
    
    console.log(`✅ Traduzione salvata: ${keyName}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Errore salvando traduzione:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Elimina una traduzione
 */
export async function deleteTranslation(keyName: string): Promise<void> {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const result = await client.query(`
      DELETE FROM translation_keys 
      WHERE key_name = $1
    `, [keyName]);
    
    if (result.rowCount && result.rowCount > 0) {
      // Invalida cache
      lastCacheUpdate = 0;
      console.log(`✅ Traduzione eliminata: ${keyName}`);
    } else {
      console.warn(`⚠️ Traduzione non trovata: ${keyName}`);
    }
    
  } catch (error) {
    console.error('❌ Errore eliminando traduzione:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Ottieni tutte le chiavi di traduzione per gestione admin
 */
export async function getAllTranslationKeys(): Promise<TranslationKey[]> {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT id, key_name, section, description
      FROM translation_keys
      ORDER BY section, key_name
    `);
    
    return result.rows;
    
  } catch (error) {
    console.error('❌ Errore ottenendo chiavi traduzione:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Forza il refresh della cache
 */
export async function refreshTranslationCache(): Promise<void> {
  await loadTranslationsToCache();
} 