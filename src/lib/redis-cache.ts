// Redis cache system for sidebar components and performance optimization
// Uses Railway Redis instance for production caching

// Importa Redis solo lato server
let createClient: any = null;

// Configurazione Redis
const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL || 'redis://localhost:6379';

// Carica Redis dinamicamente solo lato server
async function loadRedis() {
  if (typeof window !== 'undefined') {
    throw new Error('Redis can only be used on the server side');
  }
  
  if (!createClient) {
    const redis = await import('redis');
    createClient = redis.createClient;
  }
  
  return createClient;
}

let redisClient: ReturnType<typeof createClient> | null = null;

// Inizializza Redis client
export async function getRedisClient() {
  if (!redisClient) {
    const RedisClient = await loadRedis();
    redisClient = RedisClient({
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

    redisClient.on('error', (err: any) => {
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
  
  // Sidebar components - cache aggressiva per performance
  DESTINATION_SIDEBAR: 60 * 60 * 12, // 12 ore
  ARTICLES_SIDEBAR: 60 * 60 * 6, // 6 ore
  RELATED_DESTINATIONS: 60 * 60 * 24, // 1 giorno
  
  // API responses - cache aggressiva
  SEARCH_RESULTS: 60 * 60 * 24 * 7, // 7 giorni
  WIDGET_DATA: 60 * 60 * 24 * 30, // 30 giorni
  
  // Sitemap e SEO
  SITEMAP: 60 * 60 * 24, // 1 giorno
  METADATA: 60 * 60 * 24 * 7, // 7 giorni
} as const;

// Interface per in-memory fallback
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

// In-memory fallback cache (quando Redis non è disponibile)
const memoryCache = new Map<string, CacheItem>();

// Simple in-memory cache implementation (fallback)
export class MemoryCache {
  static get<T>(key: string): T | null {
    const item = memoryCache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now > item.timestamp + (item.ttl * 1000)) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  static set(key: string, value: any, ttl: number): boolean {
    try {
      const item: CacheItem = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl
      };
      
      memoryCache.set(key, item);
      return true;
    } catch (error) {
      return false;
    }
  }

  static del(key: string): boolean {
    return memoryCache.delete(key);
  }

  static delPattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  static clear(): number {
    const size = memoryCache.size;
    memoryCache.clear();
    return size;
  }
}

// Funzioni di cache con Redis e fallback in-memory
export class RedisCache {
  private static async getClient() {
    try {
      return await getRedisClient();
    } catch (error) {
      console.warn('⚠️ Redis not available, using memory cache fallback');
      return null;
    }
  }

  // GET con fallback
  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      
      if (!client) {
        // Fallback to memory cache
        const data = MemoryCache.get<T>(key);
        if (data) {
          console.log(`✅ Memory Cache HIT: ${key}`);
        } else {
          console.log(`📭 Memory Cache MISS: ${key}`);
        }
        return data;
      }
      
      const data = await client.get(key);
      
      if (!data) {
        console.log(`📭 Redis Cache MISS: ${key}`);
        return null;
      }
      
      console.log(`✅ Redis Cache HIT: ${key}`);
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`❌ Redis GET error for key ${key}:`, error);
      // Fallback to memory cache
      return MemoryCache.get<T>(key);
    }
  }

  // SET con TTL
  static async set(key: string, value: any, ttl: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      
      if (!client) {
        // Fallback to memory cache
        const success = MemoryCache.set(key, value, ttl);
        if (success) {
          console.log(`💾 Memory Cache SET: ${key} (TTL: ${ttl}s)`);
        }
        return success;
      }
      
      const serialized = JSON.stringify(value);
      await client.setEx(key, ttl, serialized);
      console.log(`💾 Redis Cache SET: ${key} (TTL: ${ttl}s = ${Math.round(ttl/3600)}h)`);
      
      // Also set in memory cache as backup
      MemoryCache.set(key, value, ttl);
      
      return true;
    } catch (error) {
      console.error(`❌ Redis SET error for key ${key}:`, error);
      // Fallback to memory cache
      return MemoryCache.set(key, value, ttl);
    }
  }

  // DELETE
  static async del(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      
      if (!client) {
        const deleted = MemoryCache.del(key);
        console.log(`🗑️ Memory Cache DELETE: ${key} (deleted: ${deleted})`);
        return deleted;
      }
      
      const result = await client.del(key);
      console.log(`🗑️ Redis Cache DELETE: ${key} (deleted: ${result})`);
      
      // Also delete from memory cache
      MemoryCache.del(key);
      
      return result > 0;
    } catch (error) {
      console.error(`❌ Redis DELETE error for key ${key}:`, error);
      return MemoryCache.del(key);
    }
  }

  // DELETE con pattern (per invalidare gruppi)
  static async delPattern(pattern: string): Promise<number> {
    try {
      const client = await this.getClient();
      
      if (!client) {
        const deleted = MemoryCache.delPattern(pattern);
        console.log(`🗑️ Memory Cache DELETE PATTERN: ${pattern} (${deleted} keys deleted)`);
        return deleted;
      }
      
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        console.log(`🔍 No Redis keys found for pattern: ${pattern}`);
        return MemoryCache.delPattern(pattern);
      }
      
      const result = await client.del(keys);
      console.log(`🗑️ Redis Cache DELETE PATTERN: ${pattern} (${result} keys deleted)`);
      
      // Also delete from memory cache
      MemoryCache.delPattern(pattern);
      
      return result;
    } catch (error) {
      console.error(`❌ Redis DELETE PATTERN error for ${pattern}:`, error);
      return MemoryCache.delPattern(pattern);
    }
  }

  // Verifica connessione
  static async ping(): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) return false;
      
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
      
      if (!client) {
        return {
          connected: false,
          fallback: 'memory',
          memoryCache: {
            size: memoryCache.size
          }
        };
      }
      
      const info = await client.info('stats');
      const memory = await client.info('memory');
      
      return {
        connected: client.isOpen,
        stats: info,
        memory: memory,
        memoryCache: {
          size: memoryCache.size
        }
      };
    } catch (error) {
      console.error('❌ Redis STATS error:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        memoryCache: {
          size: memoryCache.size
        }
      };
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
  
  // Sidebar components - chiavi specifiche per sidebar
  destinationSidebar: (currentId: string, type: string, lang: string) => `sidebar:dest:${currentId}:${type}:${lang}`,
  destinationArticles: (destinationId: string, lang: string) => `sidebar:articles:${destinationId}:${lang}`,
  otherProvinces: (regionId: string, excludeId: string, lang: string) => `sidebar:provinces:${regionId}:ex${excludeId}:${lang}`,
  municipalities: (provinceId: string, excludeId: string, showAll: boolean, lang: string) => `sidebar:municipalities:${provinceId}:ex${excludeId}:${showAll}:${lang}`,
  relatedArticles: (destinationId: string, lang: string) => `sidebar:related:${destinationId}:${lang}`,
  
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
  try {
    // Solo lato server per Redis
    if (typeof window !== 'undefined') {
      console.log(`🔄 Client-side: Fetching data directly for: ${key}`);
      return await fetchFunction();
    }

    // Prova cache prima
    const cachedData = await RedisCache.get<T>(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch dai dati
    console.log(`🔄 Fetching fresh data for: ${key}`);
    const freshData = await fetchFunction();
    
    // Salva in cache (non bloccante)
    RedisCache.set(key, freshData, ttl).catch(err => {
      console.warn(`⚠️ Failed to cache data for ${key}:`, err instanceof Error ? err.message : 'Unknown error');
    });
    
    return freshData;
  } catch (error) {
    // Fallback se cache non è disponibile
    console.warn(`⚠️ Cache error for ${key}, falling back to direct fetch:`, error instanceof Error ? error.message : 'Unknown error');
    return await fetchFunction();
  }
}

// Funzione per invalidare cache quando aggiorni contenuti
export async function invalidateContentCache(type: 'destination' | 'company' | 'article', id?: string) {
  console.log(`🔄 Invalidating cache for ${type}${id ? ` ID: ${id}` : ''}`);
  
  if (id) {
    // Invalida contenuto specifico in tutte le lingue
    await RedisCache.delPattern(`${type.substring(0,4)}:${id}:*`);
    // Invalida anche sidebar correlate
    await RedisCache.delPattern(`sidebar:*${id}*`);
  } else {
    // Invalida tutto il tipo
    await RedisCache.delPattern(`${type.substring(0,4)}:*`);
    await RedisCache.delPattern(`sidebar:*`);
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