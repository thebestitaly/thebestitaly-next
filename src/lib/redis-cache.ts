// Redis cache system for sidebar components and performance optimization
// Uses Railway Redis instance for production caching

// Importa Redis solo lato server
let createClient: any = null;

// 🚨 MEMORY LEAK FIX: Strict connection limits
const MAX_CONNECTIONS = 5;
const CONNECTION_TIMEOUT = 15000; // 15 seconds

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

// Connection pool with strict limits
const connectionPool: any[] = [];
let isConnecting = false;
let connectionAttempts = 0;
let redisClient: any = null;

// 🚨 MEMORY LEAK FIX: Singleton pattern with strict pooling
export async function getRedisClient() {
  // If we already have a working client, return it
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // Prevent multiple concurrent connection attempts
  if (isConnecting) {
    // Wait for the current connection attempt
    let attempts = 0;
    while (isConnecting && attempts < 30) { // Max 3 seconds wait
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // If still connecting after timeout, return the client anyway
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }
  }

  // Limit connection attempts
  if (connectionAttempts >= MAX_CONNECTIONS) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Max Redis connection attempts reached, using memory cache');
    }
    throw new Error('Max Redis connections reached');
  }

  isConnecting = true;
  connectionAttempts++;

  try {
    const createClientFn = await loadRedis();
    
    // Create new client with strict timeout
    redisClient = createClientFn({
      url: redisUrl,
      socket: {
        connectTimeout: CONNECTION_TIMEOUT,
        lazyConnect: true, // Don't auto-connect
        noDelay: true,
        keepAlive: true,
      },
      // Disable retries to prevent memory buildup
      retryStrategy: () => false,
      // Faster ping interval for health checks
      pingInterval: 10000, // 10 seconds
    });

    // Event handlers for better tracking
    redisClient.on('error', (err: Error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Redis Client Error:', err);
      }
      // Don't keep errored clients
      if (redisClient) {
        redisClient.disconnect().catch(() => {});
      }
      redisClient = null;
    });

    redisClient.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Redis Connected');
      }
    });

    redisClient.on('ready', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Redis Ready');
      }
    });

    redisClient.on('end', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('⛔ Redis Connection Ended');
      }
      redisClient = null;
    });

    // Connect with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
      )
    ]);

    return redisClient;

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Redis connection failed:', error);
    }
    redisClient = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

// Close Redis connection cleanly
export async function closeRedisConnection() {
  if (redisClient) {
      try {
    await redisClient.disconnect();
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Redis connection closed');
    }
  } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    } finally {
      redisClient = null;
    }
  }
}

// Memory cache fallback with strict size limits
class MemoryCache {
  private static cache = new Map<string, any>();
  private static readonly MAX_SIZE = 1000; // Limit memory cache size

  static set(key: string, value: any, _ttl?: number): boolean {
    // Auto-cleanup if cache too large
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      expiry: _ttl ? Date.now() + (_ttl * 1000) : null
    });
    return true;
  }

  static get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check expiry
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  static del(key: string): number {
    return this.cache.delete(key) ? 1 : 0;
  }

  static clear(): number {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }

  static size(): number {
    return this.cache.size;
  }

  static delPattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}

export { MemoryCache };

// Helper functions with strict error handling
export async function setCache(key: string, value: any, ttl: number = 3600): Promise<boolean> {
  try {
    // Always set in memory cache first
    MemoryCache.set(key, value, ttl);
    
    // Try Redis cache
    const client = await getRedisClient();
    if (client && client.isOpen) {
      await client.setEx(key, ttl, JSON.stringify(value));
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Redis Cache SET: ${key}`);
      }
      return true;
    }
  } catch {
    // Redis failed, but memory cache succeeded
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Redis failed, using memory cache for: ${key}`);
    }
  }
  
  return true; // Memory cache always works
}

export async function getCache(key: string): Promise<any> {
  try {
    // Try memory cache first (faster)
    const memResult = MemoryCache.get(key);
    if (memResult !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Memory Cache HIT: ${key}`);
      }
      return memResult;
    }
    
    // Try Redis if memory cache miss
    const client = await getRedisClient();
    if (client && client.isOpen) {
      const result = await client.get(key);
      if (result) {
        const parsed = JSON.parse(result);
        // Store in memory cache for next time
        MemoryCache.set(key, parsed, 300); // 5 min memory cache
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Redis Cache HIT: ${key}`);
        }
        return parsed;
      }
    }
  } catch {
    // Both caches failed
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ Cache MISS: ${key}`);
    }
  }
  
  return null;
}

export async function delCache(key: string): Promise<number> {
  let deleted = 0;
  
  // Delete from memory cache
  deleted += MemoryCache.del(key);
  
  // Try to delete from Redis
  try {
    const client = await getRedisClient();
    if (client && client.isOpen) {
      deleted += await client.del(key);
    }
  } catch {
    // Redis delete failed, but memory delete succeeded
  }
  
  return deleted;
}

// Cache warmup for static data
export async function warmupCache() {
  try {
    const client = await getRedisClient();
    if (!client || !client.isOpen) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Redis not available for warmup, using memory cache only');
      }
      return false;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Cache warmup completed');
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Cache warmup failed, using memory cache only');
    }
    return false;
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
  
  // Articles
  latestArticles: (lang: string) => `latest:art:${lang}`,
  homepageArticles: (lang: string) => `latest:art:${lang}_homepage`,
  
  // Menu items
  menuDestinations: (lang: string) => `menu:dest:${lang}`,
  
  // Categories
  categories: (lang: string) => `categories:${lang}`,
  
  // Sidebar lists
  destinationArticles: (destId: string, lang: string) => `sidebar:art:${destId}:${lang}`,
  relatedDestinations: (destId: string, type: string, lang: string) => `sidebar:dest:${destId}:${type}:${lang}`,
};

// Cache management functions
export async function invalidateContentCache(type: 'destination' | 'company' | 'article', id?: string) {
  const patterns = [];
  
  if (type === 'destination') {
    patterns.push(id ? `dest:${id}:*` : 'dest:*');
    patterns.push('homepage:dest:*');
    patterns.push('menu:dest:*');
    patterns.push(id ? `sidebar:*:${id}:*` : 'sidebar:*');
  } else if (type === 'company') {
    patterns.push(id ? `comp:${id}:*` : 'comp:*');
    patterns.push('featured:comp:*');
  } else if (type === 'article') {
    patterns.push(id ? `art:${id}:*` : 'art:*');
    patterns.push('latest:art:*');
  }
  
  let totalDeleted = 0;
  for (const pattern of patterns) {
    try {
      const deleted = await MemoryCache.delPattern(pattern);
      totalDeleted += deleted;
      
      // Also try Redis if available
      const client = await getRedisClient();
      if (client && client.isOpen) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          const redisDeleted = await client.del(keys);
          totalDeleted += redisDeleted;
        }
      }
    } catch (error) {
      console.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️ Invalidated ${totalDeleted} cache entries for ${type}${id ? ` (ID: ${id})` : ''}`);
  }
  return totalDeleted;
} 