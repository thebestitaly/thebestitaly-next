// 🚨 EMERGENCY SINGLETON CACHE - Load data ONCE and share across all components

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
  error: Error | null;
}

interface SingletonCacheConfig {
  ttl: number; // Time To Live in milliseconds
  maxRetries: number;
  retryDelay: number;
}

class SingletonCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private config: SingletonCacheConfig = {
    ttl: 1800000, // 30 minutes
    maxRetries: 3,
    retryDelay: 1000
  };

  // 🚨 EMERGENCY - Get data with singleton pattern
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    const now = Date.now();
    const entry = this.cache.get(key);
    const ttl = customTtl || this.config.ttl;

    // 🎯 Return cached data if fresh
    if (entry && !entry.loading && !entry.error && (now - entry.timestamp) < ttl) {
      console.log(`🎯 [SINGLETON CACHE HIT] ${key}`);
      return entry.data;
    }

    // 🔄 Return existing promise if already loading
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 [SINGLETON CACHE PENDING] ${key}`);
      return this.pendingRequests.get(key)!;
    }

    // 🚀 Start new request
    console.log(`🚀 [SINGLETON CACHE MISS] ${key}`);
    
    const promise = this.fetchWithRetry(key, fetcher, ttl);
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async fetchWithRetry<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    attempt = 1
  ): Promise<T> {
    try {
      // Set loading state
      this.cache.set(key, {
        data: null,
        timestamp: Date.now(),
        loading: true,
        error: null
      });

      const data = await fetcher();

      // Set success state
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        loading: false,
        error: null
      });

      console.log(`✅ [SINGLETON CACHE SET] ${key}`);
      return data;

    } catch (error) {
      const err = error as Error;
      
      // Retry logic
      if (attempt < this.config.maxRetries) {
        console.log(`🔄 [SINGLETON CACHE RETRY] ${key} (${attempt}/${this.config.maxRetries})`);
        await this.delay(this.config.retryDelay * attempt);
        return this.fetchWithRetry(key, fetcher, ttl, attempt + 1);
      }

      // Set error state
      this.cache.set(key, {
        data: null,
        timestamp: Date.now(),
        loading: false,
        error: err
      });

      console.error(`❌ [SINGLETON CACHE ERROR] ${key}:`, err);
      throw err;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🗑️ Clear cache entry
  clear(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
    console.log(`🗑️ [SINGLETON CACHE CLEAR] ${key}`);
  }

  // 🗑️ Clear all cache
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log(`🗑️ [SINGLETON CACHE CLEAR ALL]`);
  }

  // 📊 Get cache stats
  getStats(): { size: number; pending: number; entries: string[] } {
    return {
      size: this.cache.size,
      pending: this.pendingRequests.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// 🚨 EMERGENCY SINGLETON INSTANCE
export const singletonCache = new SingletonCache();

// 🚨 EMERGENCY CACHE KEYS
export const CACHE_KEYS = {
  ARTICLES_SIDEBAR: (lang: string, categoryId?: string, currentArticleId?: string) => 
    `articles-sidebar:${lang}:${categoryId || 'all'}:${currentArticleId || 'none'}`,
  
  CATEGORY_ARTICLES: (category: string, lang: string) => 
    `category-articles:${category}:${lang}`,
  
  CATEGORY_INFO: (category: string, lang: string) => 
    `category-info:${category}:${lang}`,
  
  FEATURED_ARTICLES: (lang: string) => 
    `featured-articles:${lang}`,
  
  LATEST_ARTICLES: (lang: string, limit: number = 8) => 
    `latest-articles:${lang}:${limit}`,
} as const;

// 🚨 EMERGENCY CACHE TTL
export const CACHE_TTL = {
  ARTICLES: 1800000, // 30 minutes
  CATEGORIES: 3600000, // 1 hour
  FEATURED: 3600000, // 1 hour
  SIDEBAR: 7200000, // 2 hours - longer because it changes rarely
} as const; 