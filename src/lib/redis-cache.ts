import { createClient } from 'redis';

// Configurazione Redis
const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

// Inizializza Redis client
export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 60000,
        lazyConnect: true,
      },
      // Configurazioni per Railway
      ...(process.env.NODE_ENV === 'production' && {
        socket: {
          tls: redisUrl.includes('rediss://'),
          rejectUnauthorized: false
        }
      })
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis Ready');
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis Connection Ended');
    });
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

// Cache durations ottimizzate per contenuti statici
export const CACHE_DURATIONS = {
  // Contenuti principali - cache molto lunga
  DESTINATIONS: 60 * 60 * 24 * 30, // 30 giorni
  COMPANIES: 60 * 60 * 24 * 30, // 30 giorni  
  ARTICLES: 60 * 60 * 24 * 7, // 7 giorni (più dinamici)
  
  // Dati di supporto - cache lunghissima
  TRANSLATIONS: 60 * 60 * 24 * 90, // 90 giorni
  LANGUAGES: 60 * 60 * 24 * 365, // 1 anno
  CATEGORIES: 60 * 60 * 24 * 180, // 6 mesi
  
  // Homepage e liste - cache media
  HOMEPAGE_DESTINATIONS: 60 * 60 * 24, // 1 giorno
  FEATURED_COMPANIES: 60 * 60 * 24, // 1 giorno
  LATEST_ARTICLES: 60 * 60 * 6, // 6 ore
  
  // API responses - cache aggressiva
  SEARCH_RESULTS: 60 * 60 * 24 * 7, // 7 giorni
  WIDGET_DATA: 60 * 60 * 24 * 30, // 30 giorni
  
  // Sitemap e SEO
  SITEMAP: 60 * 60 * 24, // 1 giorno
  METADATA: 60 * 60 * 24 * 7, // 7 giorni
} as const;

// Funzioni di cache generiche
export class RedisCache {
  private static async getClient() {
    return await getRedisClient();
  }

  // GET con fallback
  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const data = await client.get(key);
      
      if (!data) {
        console.log(`📭 Cache MISS: ${key}`);
        return null;
      }
      
      console.log(`✅ Cache HIT: ${key}`);
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`❌ Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  // SET con TTL
  static async set(key: string, value: any, ttl: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      const serialized = JSON.stringify(value);
      
      await client.setEx(key, ttl, serialized);
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s = ${Math.round(ttl/3600)}h)`);
      return true;
    } catch (error) {
      console.error(`❌ Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  // DELETE
  static async del(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      const result = await client.del(key);
      console.log(`🗑️ Cache DELETE: ${key} (deleted: ${result})`);
      return result > 0;
    } catch (error) {
      console.error(`❌ Redis DELETE error for key ${key}:`, error);
      return false;
    }
  }

  // DELETE con pattern (per invalidare gruppi)
  static async delPattern(pattern: string): Promise<number> {
    try {
      const client = await this.getClient();
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        console.log(`🔍 No keys found for pattern: ${pattern}`);
        return 0;
      }
      
      const result = await client.del(keys);
      console.log(`🗑️ Cache DELETE PATTERN: ${pattern} (${result} keys deleted)`);
      return result;
    } catch (error) {
      console.error(`❌ Redis DELETE PATTERN error for ${pattern}:`, error);
      return 0;
    }
  }

  // Verifica connessione
  static async ping(): Promise<boolean> {
    try {
      const client = await this.getClient();
      const response = await client.ping();
      return response === 'PONG';
    } catch (error) {
      console.error('❌ Redis PING error:', error);
      return false;
    }
  }

  // Statistiche cache
  static async getStats(): Promise<any> {
    try {
      const client = await this.getClient();
      const info = await client.info('stats');
      const memory = await client.info('memory');
      
      return {
        connected: client.isOpen,
        stats: info,
        memory: memory
      };
    } catch (error) {
      console.error('❌ Redis STATS error:', error);
      return null;
    }
  }
}

// Helper per generare chiavi cache consistenti
export const CacheKeys = {
  // Contenuti principali
  destination: (id: string, lang: string) => `dest:${id}:${lang}`,
  company: (id: string, lang: string) => `comp:${id}:${lang}`,
  article: (id: string, lang: string) => `art:${id}:${lang}`,
  
  // Collezioni
  homepageDestinations: (lang: string) => `homepage:dest:${lang}`,
  featuredCompanies: (lang: string) => `featured:comp:${lang}`,
  latestArticles: (lang: string) => `latest:art:${lang}`,
  
  // Ricerche
  search: (type: string, query: string, lang: string) => `search:${type}:${Buffer.from(query).toString('base64')}:${lang}`,
  
  // Widget
  widgetData: (widgetId: string) => `widget:${widgetId}`,
  
  // Traduzioni
  translations: (section: string, lang: string) => `trans:${section}:${lang}`,
  
  // Metadata
  metadata: (type: string, id: string, lang: string) => `meta:${type}:${id}:${lang}`,
  
  // Sitemap
  sitemap: (lang: string) => `sitemap:${lang}`,
  
  // Utility
  languages: () => 'languages:supported',
  categories: (lang: string) => `categories:${lang}`,
} as const;

// Wrapper per funzioni con cache automatica
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFunction: () => Promise<T>
): Promise<T> {
  // Prova cache prima
  const cachedData = await RedisCache.get<T>(key);
  if (cachedData !== null) {
    return cachedData;
  }

  // Fetch dai dati
  console.log(`🔄 Fetching fresh data for: ${key}`);
  const freshData = await fetchFunction();
  
  // Salva in cache
  await RedisCache.set(key, freshData, ttl);
  
  return freshData;
}

// Funzione per invalidare cache quando aggiorni contenuti
export async function invalidateContentCache(type: 'destination' | 'company' | 'article', id?: string) {
  console.log(`🔄 Invalidating cache for ${type}${id ? ` ID: ${id}` : ''}`);
  
  if (id) {
    // Invalida contenuto specifico in tutte le lingue
    await RedisCache.delPattern(`${type.substring(0,4)}:${id}:*`);
  } else {
    // Invalida tutto il tipo
    await RedisCache.delPattern(`${type.substring(0,4)}:*`);
  }
  
  // Invalida anche cache correlate
  await RedisCache.delPattern('homepage:*');
  await RedisCache.delPattern('featured:*');
  await RedisCache.delPattern('latest:*');
  await RedisCache.delPattern('search:*');
  await RedisCache.delPattern('sitemap:*');
  
  console.log(`✅ Cache invalidation completed for ${type}`);
}

export default RedisCache; 