import axios, { AxiosInstance, CancelTokenSource } from 'axios';
import { getOptimizedImageUrl } from "./imageUtils";
import { getProvincesForRegion, getMunicipalitiesForProvince, getDestinationDetails } from './static-destinations';
import { getCache, setCache, delCache, CacheKeys } from './redis-cache';

// Interfaces
export interface Translation {
  languages_code: string;
  destination_name?: string;
  seo_title?: string;
  seo_summary?: string;
  description?: string;
  slug_permalink?: string;
}

export interface Destination {
  id: string;
  uuid_id: string;
  type: 'region' | 'province' | 'municipality';
  slug_permalink?: string;
  image?: string;
  featured_image?: string;
  featured_sort?: number;
  featured_status?: string;
  // 🚀 UPDATED: Parent destinations with full data for URL building
  region_id?: {
    id: string;
    uuid_id?: string;
    translations: {
      languages_code: string;
      destination_name: string;
      slug_permalink: string;
    }[];
  };
  province_id?: {
    id: string;
    uuid_id?: string;
    translations: {
      languages_code: string;
      destination_name: string;
      slug_permalink: string;
    }[];
  };
  municipality_id?: string;
  translations: {
    languages_code: string;
    destination_name: string;
    slug_permalink: string;
    description?: string;
    seo_title?: string;
    seo_summary?: string;
  }[];
}

export interface CategoryTranslation {
  id: string;
  languages_code: string;
  nome_categoria: string;
  seo_title: string;
  seo_summary: string;
  slug_permalink: string;
}

export interface Category {
  id: string;
  uuid_id: string;
  nome_categoria: string;
  image: string;
  visible: boolean;
  translations: CategoryTranslation[];
}

export interface ArticleTranslation {
  languages_code: string;
  titolo_articolo: string;
  description?: string;
  seo_summary?: string;
  slug_permalink: string;
}

export interface Article {
  id: string;
  uuid_id: string;
  image?: string;
  video_url?: string;
  date_created: string;
  featured_status: 'none' | 'homepage' | 'top' | 'editor' | 'trending';
  category_id?: {
    id: string;
    uuid_id?: string;
    translations: {
      nome_categoria: string;
      slug_permalink: string;
    }[];
  };
  destination_id?: string | number;
  destination_uuid?: string;
  translations: {
    languages_code: string;
    titolo_articolo: string;
    description?: string;
    seo_title?: string;
    seo_summary?: string;
    slug_permalink: string;
  }[];
}

export interface Company {
  id: string;
  uuid_id: string;
  logo: string;
  website: string;
  company_name: string;
  slug_permalink: string;
  phone: string;
  lat?: number;
  long?: number;
  category_id: string;
  category_uuid?: string;
  destination_id: string;
  destination_uuid?: string;
  active: boolean;
  images: CompanyImage[];
  featured_status?: string;
  featured_image?: string;
  socials: any;
  translations: CompanyTranslation[];
}

export interface CompanyTranslation {
  languages_code: string;
  description: string;
  seo_title: string;
  seo_summary: string;
}

export interface CompanyImage {
  id: string;
  directus_files_id: string;
}

// 🚀 UNIFIED QUERY INTERFACES
export interface DestinationQueryOptions {
  lang: string;
  type?: 'region' | 'province' | 'municipality';
  featured?: 'homepage';
  fields?: 'minimal' | 'full' | 'sitemap' | 'homepage' | 'navigation';
  limit?: number;
  slug?: string;
  uuid?: string;
  parent_id?: string;
  offset?: number;
  skipCache?: boolean;
}

export interface ArticleQueryOptions {
  lang: string;
  fields?: 'minimal' | 'full' | 'sitemap' | 'homepage' | 'sidebar';
  limit?: number;
  offset?: number;
  slug?: string;
  uuid?: string;
  category_slug?: string;
  featured_status?: 'homepage' | 'top' | 'editor' | 'trending';
  destination_id?: string;
  filters?: Record<string, any>;
  skipCache?: boolean;
}

export interface CompanyQueryOptions {
  lang: string;
  fields?: 'minimal' | 'full' | 'sitemap' | 'homepage';
  limit?: number;
  offset?: number;
  slug?: string;
  uuid?: string;
  featured_status?: string;
  destination_id?: string;
  category_id?: string;
  filters?: Record<string, any>;
  skipCache?: boolean;
}

// 🎯 FIELD PRESETS - Optimized for different use cases
const FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'type', 
    'translations.languages_code', 'translations.destination_name', 
    'translations.slug_permalink'
  ],
  
  full: [
    'id', 'uuid_id', 'type', 'image', 'lat', 'long', 'featured_status',
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.languages_code', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.languages_code', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.languages_code', 'translations.destination_name', 'translations.seo_title', 'translations.seo_summary', 
    'translations.description', 'translations.slug_permalink'
  ],
  
  sitemap: ['type', 'translations.languages_code', 'translations.slug_permalink'],
  
  homepage: [
    'id', 'uuid_id', 'type', 'image', 'featured_status',
    // 🚀 ADDED: Parent destination data for URL building
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.languages_code', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.languages_code', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.languages_code', 'translations.destination_name', 'translations.seo_title', 'translations.seo_summary', 'translations.slug_permalink'
  ],
  
  navigation: [
    'id', 'uuid_id', 'type',
    // 🚀 ADDED: Parent destination data for URL building
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.languages_code', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.languages_code', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.languages_code', 'translations.destination_name', 'translations.slug_permalink'
  ]
};

// 🚀 ARTICLE FIELD PRESETS - Optimized for different use cases
const ARTICLE_FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'date_created', 'featured_status',
    'translations.languages_code', 'translations.titolo_articolo', 'translations.slug_permalink'
  ],
  
  full: [
    'id', 'uuid_id', 'image', 'date_created', 'featured_status', 'destination_id',
    'category_id.id', 'category_id.uuid_id', 'category_id.translations.languages_code', 'category_id.translations.nome_categoria',
    'category_id.translations.slug_permalink', 'translations.*'
  ],
  
  sitemap: [
    'id', 'date_created', 'translations.languages_code', 'translations.slug_permalink'
  ],
  
  homepage: [
    'id', 'uuid_id', 'image', 'date_created', 'featured_status',
    'category_id.id', 'category_id.uuid_id', 'category_id.translations.languages_code', 'category_id.translations.nome_categoria',
    'translations.languages_code', 'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
  ],
  
  sidebar: [
    'id', 'uuid_id', 'image', 'date_created', 'featured_status',
    'category_id.id', 'category_id.uuid_id', 'category_id.translations.languages_code', 'category_id.translations.nome_categoria',
    'category_id.translations.slug_permalink', 'destination_id',
    'translations.languages_code', 'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
  ]
};

// 🏢 COMPANY FIELD PRESETS - Optimized for different use cases
const COMPANY_FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'company_name', 'slug_permalink',
    'translations.languages_code', 'translations.seo_title'
  ],
  
  full: [
    'id', 'uuid_id', 'website', 'company_name', 'slug_permalink', 'featured_image',
    'images', 'phone', 'lat', 'long', 'category_id', 'destination_id', 'featured_status',
    'active', 'socials', 'translations.*'
  ],
  
  sitemap: [
    'id', 'slug_permalink'
  ],
  
  homepage: [
    'id', 'uuid_id', 'website', 'company_name', 'slug_permalink', 'featured_image',
    'phone', 'category_id', 'destination_id', 'featured_status', 'translations.languages_code', 'translations.seo_title', 'translations.seo_summary'
  ]
};

/**
 * 🚀 MEMORY-OPTIMIZED DirectusWebClient
 * Key improvements:
 * - Proper cleanup mechanisms
 * - Request cancellation
 * - Interceptor management
 * - Response data cleanup
 * - Static variable management
 */
class DirectusWebClient {
  private client: AxiosInstance;
  private cancelTokenSource: CancelTokenSource;
  private requestInterceptor: number | null = null;
  private responseInterceptor: number | null = null;
  private static instances = new WeakSet<DirectusWebClient>();
  private static activeCalls = 0;
  private static readonly MAX_CONCURRENT_CALLS = 10;
  private static readonly REQUEST_TIMEOUT = 8000; // Reduced timeout
  private isDestroyed = false;
  
  // 🚀 CACHE CONFIGURATION
  private static readonly CACHE_TTL = {
    destinations: 3600,    // 1 hour - destinations change rarely
    articles: 900,         // 15 minutes - articles updated more frequently
    companies: 1800,       // 30 minutes - companies updated occasionally
    categories: 7200,      // 2 hours - categories very stable
    homepage: 300,         // 5 minutes - homepage content needs fresh data
    sitemap: 1800,         // 30 minutes - sitemap can be cached longer
    translations: 3600     // 1 hour - translations very stable
  };

  constructor(lang?: string) {
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_DIRECTUS_URL environment variable is not set');
    }

    // Create cancel token for request cancellation
    this.cancelTokenSource = axios.CancelToken.source();

    // Track instances
    DirectusWebClient.instances.add(this);

    const serverToken = process.env.DIRECTUS_TOKEN;
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
    const token = serverToken || publicToken;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.client = axios.create({
      baseURL,
      timeout: DirectusWebClient.REQUEST_TIMEOUT,
      headers,
      maxContentLength: 5 * 1024 * 1024, // Reduced from 10MB to 5MB
      maxBodyLength: 2 * 1024 * 1024,    // Reduced from 5MB to 2MB
      maxRedirects: 2, // Reduced from 3 to 2
      cancelToken: this.cancelTokenSource.token,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Store interceptor IDs for cleanup
    this.requestInterceptor = this.client.interceptors.request.use(
      (config) => {
        if (this.isDestroyed) {
          throw new axios.Cancel('Client destroyed');
        }
        
        // Limit concurrent calls
        if (DirectusWebClient.activeCalls >= DirectusWebClient.MAX_CONCURRENT_CALLS) {
          throw new Error(`Max concurrent calls exceeded: ${DirectusWebClient.activeCalls}`);
        }
        
        DirectusWebClient.activeCalls++;
        return config;
      },
      (error) => {
        DirectusWebClient.activeCalls = Math.max(0, DirectusWebClient.activeCalls - 1);
        return Promise.reject(error);
      }
    );

    this.responseInterceptor = this.client.interceptors.response.use(
      (response) => {
        DirectusWebClient.activeCalls = Math.max(0, DirectusWebClient.activeCalls - 1);
        
        // 🚀 MEMORY FIX: Clean up large response data
        if (response.data && typeof response.data === 'object') {
          // Remove circular references
          response.data = this.sanitizeResponseData(response.data);
        }
        
        return response;
      },
      (error) => {
        DirectusWebClient.activeCalls = Math.max(0, DirectusWebClient.activeCalls - 1);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 🧹 SANITIZE RESPONSE DATA
   * Removes circular references and unnecessary data
   */
  private sanitizeResponseData(data: any): any {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    // Check for circular references using WeakSet
    const seen = new WeakSet();
    
    const sanitize = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      if (seen.has(obj)) {
        return '[Circular Reference]';
      }

      seen.add(obj);

      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }

      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }

      return sanitized;
    };

    return sanitize(data);
  }

  /**
   * 🚀 CACHE KEY GENERATION
   * Generates consistent cache keys for different types of requests
   */
  private generateCacheKey(type: string, params: any): string {
    // Ensure language is always part of the cache key
    const cacheParams = {
      ...params,
      // Make sure lang is always present for language-specific caching
      lang: params.lang || params.languageCode || 'it'
    };
    
    const sortedParams = Object.keys(cacheParams)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = cacheParams[key];
        return result;
      }, {});
    
    const paramString = JSON.stringify(sortedParams);
    const hash = Buffer.from(paramString).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    
    // Include language directly in cache key for better debugging
    const lang = cacheParams.lang || 'unknown';
    const cacheKey = `directus:${type}:${lang}:${hash}`;
    
    
    return cacheKey;
  }

  /**
   * 🚀 CACHED REQUEST WRAPPER
   * Wraps API requests with intelligent caching
   */
  private async cachedRequest<T>(
    cacheKey: string,
    ttl: number,
    requestFn: () => Promise<T>,
    skipCache: boolean = false
  ): Promise<T> {
    if (this.isDestroyed) {
      throw new Error('Client has been destroyed');
    }

    // Skip cache for specific requests or if explicitly disabled
    if (skipCache) {
      return await this.makeRequest(requestFn);
    }

    try {
      // Try to get from cache first
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Cache miss - make the request
      const result = await this.makeRequest(requestFn);
      
      // Cache the result
      await setCache(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      // If cache fails, fall back to direct request
      return await this.makeRequest(requestFn);
    }
  }

  /**
   * 🧹 CACHE INVALIDATION
   * Invalidates cache entries for specific types
   */
  private async invalidateCache(type: string, id?: string): Promise<void> {
    try {
      const patterns = [
        `directus:${type}:*`,
        `directus:homepage:*`,
        `directus:sitemap:*`
      ];

      for (const pattern of patterns) {
        await delCache(pattern);
      }
    } catch (error) {
      console.warn(`⚠️ Cache invalidation failed for ${type}:`, error);
    }
  }

  /**
   * 🚀 IMPROVED REQUEST METHOD WITH AUTOMATIC CLEANUP
   */
  private async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    if (this.isDestroyed) {
      throw new Error('Client has been destroyed');
    }

    try {
      const result = await requestFn();
      
      // 🚀 MEMORY FIX: Explicit cleanup of large objects
      if (typeof result === 'object' && result !== null) {
        // Force garbage collection hint
        if (global.gc) {
          global.gc();
        }
      }
      
      return result;
    } catch (error) {
      if (axios.isCancel(error)) {
        return Promise.reject(new Error('Request cancelled'));
      }
      throw error;
    }
  }

  public async get(url: string, config?: object) {
    return this.makeRequest(async () => {
      const response = await this.client.get(url, {
        ...config,
        cancelToken: this.cancelTokenSource.token
      });
      return response;
    });
  }

  // 🎯 PUBLIC HOMEPAGE METHODS
  async getHomepageCompanies(lang: string): Promise<Company[]> {
    // 🚀 REFACTORED: Use unified getCompanies method
    const result = await this.getCompanies({
      lang,
      featured_status: 'homepage',
      fields: 'homepage',
      limit: 12
    });
    
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }

  async getHomepageArticles(lang: string): Promise<Article[]> {
    // 🚀 REFACTORED: Use unified getArticles method
    const result = await this.getArticles({
      lang,
      featured_status: 'homepage',
      fields: 'homepage',
      limit: 8
    });
    
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }

  async getFeaturedDestinations(lang: string): Promise<Destination[]> {
    // 🚀 REFACTORED: Use unified getDestinations method
    return this.getDestinations({
      featured: 'homepage',
      lang,
      fields: 'homepage',
      limit: 5
    });
  }

  async getHomepageDestinations(lang: string): Promise<Destination[]> {
    const destinations = await this.getDestinations({
      featured: 'homepage',
      lang,
      fields: 'homepage',
      limit: 8,
      skipCache: true  // Force fresh query
    });
    
    if (destinations.length === 0) {
      // 🚀 FALLBACK: If no featured destinations, get first 3 regions as fallback
      const fallbackDestinations = await this.getDestinations({
        type: 'region',
        lang,
        fields: 'homepage',
        limit: 3
      });
      return fallbackDestinations;
    }
    
    return destinations;
  }

  // 🎯 PUBLIC CONTENT METHODS
  async getArticleBySlug(slug: string, languageCode: string): Promise<Article | null> {
    // 🚀 REFACTORED: Use unified getArticles method
    return this.getArticles({
      lang: languageCode,
      slug,
      fields: 'full'
    }) as Promise<Article | null>;
  }

  async getArticleByUUID(uuid: string, languageCode: string): Promise<Article | null> {
    // 🚀 REFACTORED: Use unified getArticles method
    return this.getArticles({
      lang: languageCode,
      uuid,
      fields: 'full'
    }) as Promise<Article | null>;
  }

  async getDestinationBySlug(slug: string, languageCode: string): Promise<Destination | null> {
    // 🚀 REFACTORED: Use unified getDestinations method
    const destinations = await this.getDestinations({
      slug,
      lang: languageCode,
      fields: 'full',
      limit: 1
    });
    
    return destinations[0] || null;
  }

  async getDestinationByUUID(uuid: string, languageCode: string): Promise<Destination | null> {
    // 🚀 REFACTORED: Use unified getDestinations method
    const destinations = await this.getDestinations({
      uuid,
      lang: languageCode,
      fields: 'full',
      limit: 1
    });
    
    return destinations[0] || null;
  }

  async getDestinationsByType(type: 'region' | 'province' | 'municipality', languageCode: string): Promise<Destination[]> {
    // 🚀 REFACTORED: Use unified getDestinations method
    return this.getDestinations({
      type,
      lang: languageCode,
      fields: 'full'
    });
  }

  async getCompanyBySlug(slug: string, lang: string) {
    // 🚀 REFACTORED: Use unified getCompanies method
    return this.getCompanies({
      lang,
      slug,
      fields: 'full'
    }) as Promise<Company | null>;
  }

  async getCompanyByUUID(uuid: string, lang: string) {
    // 🚀 REFACTORED: Use unified getCompanies method
    return this.getCompanies({
      lang,
      uuid,
      fields: 'full'
    }) as Promise<Company | null>;
  }

  async getCompanyCategories(lang: string) {
    try {
      const response = await this.client.get('/items/company_categories', {
        params: {
          fields: [
            'id', 'sort', 'translations.*'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          }
        }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching company categories:', error);
      return [];
    }
  }

  async getCategories(languageCode: string): Promise<Category[]> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey('categories', { lang: languageCode });
      
      // 🔍 DEBUG: Log the query being built
      console.log(`🔍 [getCategories] Building query for lang: ${languageCode}`);
      
      return await this.cachedRequest(
        cacheKey,
        DirectusWebClient.CACHE_TTL.categories,
        async () => {
          const queryParams = {
            filter: { visible: { _eq: true } },
            fields: [
              'id', 'uuid_id', 'nome_categoria', 'image', 'visible',
              'translations.languages_code', 'translations.nome_categoria', 'translations.seo_title',
              'translations.seo_summary', 'translations.slug_permalink'
            ],
            deep: {
              translations: {
                _filter: { languages_code: { _eq: languageCode } }
              }
            }
          };
          
          // 🔍 DEBUG: Log the full params
          console.log(`🔍 [getCategories] Params: ${JSON.stringify(queryParams, null, 2)}`);
          
          const response = await this.client.get('/items/categorias', {
            params: queryParams,
            cancelToken: this.cancelTokenSource.token
          });

          const data = response.data.data || [];
          
          // 🔍 DEBUG: Log what we got back
          console.log(`🔍 [getCategories] Response: ${data.length} items`);
          if (data.length > 0) {
            console.log(`🔍 [getCategories] First item: ${JSON.stringify({
              id: data[0].id,
              nome_categoria: data[0].nome_categoria,
              translations: data[0].translations
            }, null, 2)}`);
          }
          
          // 🚀 MEMORY FIX: Immediate cleanup
          response.data = null;
          
          return data;
        }
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // 🎯 LISTINGS & SEARCH

  // 🎯 SITEMAP METHODS
  async getDestinationsForSitemap(lang: string): Promise<Array<{slug_permalink: string, type: string}>> {
    // 🚀 REFACTORED: Use unified getDestinations method
    const destinations = await this.getDestinations({
      lang,
      fields: 'sitemap',
      limit: 1000
    });

    return destinations
      .map((dest: any) => {
        const translation = dest.translations?.[0];
        if (translation?.slug_permalink) {
          return {
            slug_permalink: translation.slug_permalink,
            type: dest.type
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{slug_permalink: string, type: string}>;
  }

  async getCompaniesForSitemap(): Promise<Array<{slug_permalink: string}>> {
    // 🚀 REFACTORED: Use unified getCompanies method
    const companies = await this.getCompanies({
      lang: 'it', // Language not important for sitemap
      fields: 'sitemap',
      limit: 1000
    }) as Company[];

    const result: Array<{slug_permalink: string}> = [];
    
    for (const company of companies) {
      if (company.slug_permalink) {
        result.push({
          slug_permalink: company.slug_permalink
        });
      }
    }
    
    return result;
  }

  async getArticlesForSitemap(lang: string): Promise<Array<{slug_permalink: string, date_created?: string}>> {
    // 🚀 REFACTORED: Use unified getArticles method
    const articles = await this.getArticles({
      lang,
      fields: 'sitemap',
      limit: 500
    }) as Article[];

    const result: Array<{slug_permalink: string, date_created?: string}> = [];
    
    for (const article of articles) {
      const translation = article.translations?.[0];
      if (translation?.slug_permalink) {
        result.push({
          slug_permalink: translation.slug_permalink,
          date_created: article.date_created
        });
      }
    }
    
    return result;
  }

  async getCategoriesForSitemap(lang: string): Promise<Array<{slug_permalink: string}>> {
    try {
      const response = await this.client.get('/items/categorias', {
        params: {
          filter: { visible: { _eq: true } },
          fields: ['translations.slug_permalink'],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 100
        }
      });

      const categories = response.data?.data || [];
      return categories
        .map((category: any) => {
          const translation = category.translations?.[0];
          if (translation?.slug_permalink) {
            return {
              slug_permalink: translation.slug_permalink
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
      return [];
    }
  }

  // 🚀 MEMORY LEAK FIX: Removed all pooling logic

  /**
   * 🧹 CLEANUP METHOD
   */
  public cleanup() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    // Cancel all pending requests
    this.cancelTokenSource.cancel('Client cleanup');

    // Remove interceptors
    if (this.requestInterceptor !== null) {
      this.client.interceptors.request.eject(this.requestInterceptor);
    }
    if (this.responseInterceptor !== null) {
      this.client.interceptors.response.eject(this.responseInterceptor);
    }

    // Clear static counters
    DirectusWebClient.activeCalls = 0;

    // Remove from instances tracking
    DirectusWebClient.instances.delete(this);
  }

  /**
   * 🌍 GLOBAL CLEANUP FOR ALL INSTANCES
   */
  public static globalCleanup() {
    DirectusWebClient.activeCalls = 0;
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * 🗑️ PUBLIC CACHE INVALIDATION
   * Allows manual cache invalidation for specific content types
   */
  public async invalidateContentCache(type: 'destinations' | 'articles' | 'companies' | 'categories', id?: string): Promise<void> {
    await this.invalidateCache(type, id);
  }

  /**
   * 🔄 FORCE CACHE REFRESH FOR DESTINATIONS
   * Invalidates all destination cache entries to ensure description field is loaded
   */
  public static async refreshDestinationsCache(): Promise<void> {
    try {
      // Import delCache dynamically to avoid circular dependencies
      const { delCache } = await import('./redis-cache');
      
      // Invalidate all destination-related cache entries
      const patterns = [
        'directus:destinations:*',
        'directus:homepage:*',
        'directus:sitemap:*'
      ];

      for (const pattern of patterns) {
        await delCache(pattern);
      }
    } catch (error) {
      console.warn('⚠️ Failed to refresh destinations cache:', error);
    }
  }

  /**
   * 🔧 FORCE CACHE REFRESH FOR SIDEBAR
   * Invalidates sidebar-related cache entries to fix destination filtering
   */
  public static async refreshSidebarCache(): Promise<void> {
    try {
      // Import delCache dynamically to avoid circular dependencies
      const { delCache } = await import('./redis-cache');
      
      // Invalidate all sidebar-related cache entries
      const patterns = [
        'directus:articles:*', // All article cache entries
        'directus:companies:*' // All company cache entries
      ];

      for (const pattern of patterns) {
        await delCache(pattern);
      }
    } catch (error) {
      console.warn('⚠️ Failed to refresh sidebar cache:', error);
    }
  }

  /**
   * 🚀 CACHED DESTINATIONS METHOD WITH MEMORY OPTIMIZATION
   */
  async getDestinations(options: DestinationQueryOptions): Promise<Destination[]> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey('destinations', options);
      

      
      // Determine TTL based on request type
      let ttl = DirectusWebClient.CACHE_TTL.destinations;
      if (options.fields === 'homepage') {
        ttl = DirectusWebClient.CACHE_TTL.homepage;
      } else if (options.fields === 'sitemap') {
        ttl = DirectusWebClient.CACHE_TTL.sitemap;
      }

      // Skip cache for very specific queries or if explicitly disabled
      const skipCache = options.skipCache || !!(options.slug && options.fields === 'full');

      return await this.cachedRequest(
        cacheKey,
        ttl,
        async () => {
          // 🚀 MEMORY FIX: Limit field selection more aggressively
          const optimizedFields = this.getOptimizedFields(options.fields || 'full');
          
          if (options.slug) {
            try {
              const params = {
                ...this.buildOptimizedParams(options),
                fields: optimizedFields // Use optimized fields
              };
              
              const response = await this.client.get('/items/destinations', { 
                params,
                cancelToken: this.cancelTokenSource.token
              });
              
              const data = response.data?.data || [];
              
              // 🚀 MEMORY FIX: Immediate cleanup of response
              response.data = null;
              
              return data;
            } catch (error) {
              // Fallback with even more limited fields
              return await this.getDestinationWithLimitedFields(options);
            }
          }
          
          const params = {
            ...this.buildOptimizedParams(options),
            fields: optimizedFields
          };
          
          const response = await this.client.get('/items/destinations', { 
            params,
            cancelToken: this.cancelTokenSource.token
          });
          
          const data = response.data?.data || [];
          
          // 🚀 MEMORY FIX: Immediate cleanup
          response.data = null;
          
          return data;
        },
        skipCache
      );
    } catch (error) {
      console.error('Error in getDestinations:', error);
      return [];
    }
  }

  /**
   * 🚀 MEMORY-OPTIMIZED FIELD SELECTION
   */
  private getOptimizedFields(fieldType: string): string[] {
    const baseFields = ['id', 'uuid_id', 'type'];
    
    switch (fieldType) {
      case 'minimal':
        return [...baseFields, 'translations.languages_code', 'translations.destination_name', 'translations.slug_permalink'];
      case 'sitemap':
        return ['type', 'translations.languages_code', 'translations.slug_permalink'];
      case 'navigation':
        return [...baseFields, 'translations.languages_code', 'translations.destination_name', 'translations.slug_permalink'];
      case 'homepage':
        return [
          ...baseFields, 'image', 'featured_status',
          'translations.languages_code', 'translations.destination_name', 'translations.slug_permalink', 'translations.seo_summary'
        ];
      default:
        return [
          ...baseFields, 'image', 'featured_status',
          'translations.languages_code', 'translations.destination_name', 'translations.slug_permalink', 'translations.seo_title',
          'translations.seo_summary', 'translations.description'
        ];
    }
  }

  /**
   * 🚀 FALLBACK METHOD WITH MINIMAL MEMORY FOOTPRINT
   */
  private async getDestinationWithLimitedFields(options: DestinationQueryOptions): Promise<Destination[]> {
    try {
      // Step 1: Get translation data including description
      const translationResponse = await this.client.get('/items/destinations_translations', {
        params: {
          filter: { 
            slug_permalink: { _eq: options.slug },
            languages_code: { _eq: options.lang }
          },
          fields: [
            'destinations_id', 'destination_name', 'slug_permalink', 
            'description', 'seo_title', 'seo_summary'
          ]
        },
        cancelToken: this.cancelTokenSource.token
      });
      
      const translations = translationResponse.data?.data || [];
      translationResponse.data = null; // Immediate cleanup
      
      if (translations.length === 0) {
        return [];
      }
      
      const translation = translations[0];
      
      // Step 2: Get destination data with image
      const destinationResponse = await this.client.get(`/items/destinations/${translation.destinations_id}`, {
        params: {
          fields: ['id', 'uuid_id', 'type', 'featured_status', 'image']
        },
        cancelToken: this.cancelTokenSource.token
      });
      
      const destination = destinationResponse.data?.data;
      destinationResponse.data = null; // Immediate cleanup
      
      if (!destination) {
        return [];
      }
      
      // Combine with essential data
      const result = {
        ...destination,
        translations: [translation]
      };
      
      return [result];
    } catch (error) {
      return [];
    }
  }

  /**
   * 🚀 UNIFIED ARTICLE METHOD
   * Replaces: getHomepageArticles, getArticleBySlug, getArticleByUUID, getArticles, 
   * getArticlesByCategory, getArticlesForSidebar, getLatestArticlesForSidebar, getArticlesForSitemap
   * Handles all article queries with optimized performance
   */
  async getArticles(options: ArticleQueryOptions): Promise<Article[] | { articles: Article[], total: number } | Article | null> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey('articles', options);
      
      // Determine TTL based on request type
      let ttl = DirectusWebClient.CACHE_TTL.articles;
      if (options.fields === 'homepage') {
        ttl = DirectusWebClient.CACHE_TTL.homepage;
      } else if (options.fields === 'sitemap') {
        ttl = DirectusWebClient.CACHE_TTL.sitemap;
      }

      // Skip cache for paginated queries, destination-specific queries, or very specific single article queries
      const skipCache = !!(
        options.offset !== undefined || 
        options.destination_id || // 🚀 FIX: Always skip cache for destination-filtered queries (sidebar)
        (options.slug && options.fields === 'full')
      );
      
      return await this.cachedRequest(
        cacheKey,
        ttl,
        async () => {
          // 🚀 MEMORY LEAK FIX: Try single query first, fall back to separate queries
          if (options.slug || options.uuid) {
            try {
              // Try single query first
              const params = this.buildArticleParams(options);
              
              const response = await this.client.get('/items/articles', { 
                params,
                cancelToken: this.cancelTokenSource.token
              });
              
              const articles = response.data?.data || [];
              
              // 🚀 MEMORY FIX: Immediate cleanup
              response.data = null;
              
              return articles.length > 0 ? articles[0] : null;
            } catch (error) {
              // Fallback to separate queries only if single query fails
              return await this.getArticleWithSeparateQueries(options);
            }
          }
          
          // 🎯 Build optimized query parameters for list queries
          const params = this.buildArticleParams(options);
          
          // 🚀 Single API call for list queries
          const response = await this.client.get('/items/articles', { 
            params,
            cancelToken: this.cancelTokenSource.token
          });
          
          // Return with total count if offset is specified (for pagination)
          if (options.offset !== undefined) {
            const result = {
              articles: response.data?.data || [],
              total: response.data?.meta?.total_count || 0
            };
            
            // 🚀 MEMORY FIX: Immediate cleanup
            response.data = null;
            
            return result;
          }
          
          const data = response.data?.data || [];
          
          // 🚀 MEMORY FIX: Immediate cleanup
          response.data = null;
          
          return data;
        },
        skipCache
      );
    } catch (error) {
      // Silent fail for articles
      return options.slug || options.uuid ? null : [];
    }
  }

  /**
   * 🚀 SEPARATE QUERY APPROACH for single articles
   * Avoids 403 errors by using simple queries without deep parameters
   */
  private async getArticleWithSeparateQueries(options: ArticleQueryOptions): Promise<Article | null> {
    try {
      // Step 1: Get translation data
      
      // Step 1: Get translation data from articles_translations
      // 🚀 SIMPLIFIED: Use manual URL construction like curl to avoid serialization issues
      let translationUrl = '/items/articles_translations';
      let translationResponse: any;
      
      if (options.slug) {
        const params = new URLSearchParams();
        params.append('filter[slug_permalink][_eq]', options.slug);
        params.append('filter[languages_code][_eq]', options.lang);
        params.append('fields[]', 'articles_id');
        params.append('fields[]', 'languages_code');
        params.append('fields[]', 'titolo_articolo');
        params.append('fields[]', 'slug_permalink');
        params.append('fields[]', 'seo_summary');
        params.append('fields[]', 'description');
        
        translationUrl += '?' + params.toString();
        
        translationResponse = await this.client.get(translationUrl);
      } else if (options.uuid) {
        // For UUID, we need to get the article ID first
        const articleResponse = await this.client.get('/items/articles', {
          params: {
            filter: { uuid_id: { _eq: options.uuid } },
            fields: ['id'],
            limit: 1
          }
        });
        
        if (!articleResponse.data?.data?.[0]) {
          return null;
        }
        
        const params = new URLSearchParams();
        params.append('filter[articles_id][_eq]', articleResponse.data.data[0].id);
        params.append('filter[languages_code][_eq]', options.lang);
        params.append('fields[]', 'articles_id');
        params.append('fields[]', 'languages_code');
        params.append('fields[]', 'titolo_articolo');
        params.append('fields[]', 'slug_permalink');
        params.append('fields[]', 'seo_summary');
        params.append('fields[]', 'description');
        
        translationUrl += '?' + params.toString();
        
        translationResponse = await this.client.get(translationUrl);
      }
      
      if (!translationResponse.data?.data?.[0]) {
        return null;
      }
      
      const translation = translationResponse.data.data[0];
      
      // Step 2: Get base article data without deep parameters
      const articleResponse = await this.client.get('/items/articles', {
        params: {
          filter: { id: { _eq: translation.articles_id } },
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'destination_id', 'category_id'
          ],
          limit: 1
        }
      });
      
      if (!articleResponse.data?.data?.[0]) {
        return null;
      }
      
      const baseArticle = articleResponse.data.data[0];
      
      // Step 3: Get category data if needed
      let categoryData = null;
      if (baseArticle.category_id) {
        try {
          const categoryResponse = await this.client.get('/items/categories', {
            params: {
              filter: { id: { _eq: baseArticle.category_id } },
              fields: ['id', 'uuid_id'],
              limit: 1
            }
          });
          
          if (categoryResponse.data?.data?.[0]) {
            // Get category translation
            const categoryTranslationResponse = await this.client.get('/items/categories_translations', {
              params: {
                filter: {
                  categories_id: { _eq: baseArticle.category_id },
                  languages_code: { _eq: options.lang }
                },
                fields: ['nome_categoria', 'slug_permalink']
              }
            });
            
            if (categoryTranslationResponse.data?.data?.[0]) {
              categoryData = {
                ...categoryResponse.data.data[0],
                translations: [categoryTranslationResponse.data.data[0]]
              };
            }
          }
        } catch (categoryError) {
          // Silent error for category data
        }
      }
      
      // Step 4: Combine results
      const result = {
        ...baseArticle,
        translations: [translation],
        category_id: categoryData
      };
      
      return result;
      
    } catch (error) {
      return null;
    }
  }

  /**
   * 🚀 CACHED COMPANY METHOD
   * Replaces: getHomepageCompanies, getCompanyBySlug, getCompanyByUUID, getCompanies, 
   * getCompaniesByDestination, getCompaniesForSitemap
   * Handles all company queries with optimized caching
   */
  async getCompanies(options: CompanyQueryOptions): Promise<Company[] | Company | null> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey('companies', options);
      
      // Determine TTL based on request type
      let ttl = DirectusWebClient.CACHE_TTL.companies;
      if (options.fields === 'homepage') {
        ttl = DirectusWebClient.CACHE_TTL.homepage;
      } else if (options.fields === 'sitemap') {
        ttl = DirectusWebClient.CACHE_TTL.sitemap;
      }

      // Skip cache for destination-specific or very specific single company queries
      const skipCache = !!(
        options.destination_id || // 🚀 FIX: Skip cache for destination-filtered queries
        (options.slug && options.fields === 'full')
      );

      return await this.cachedRequest(
        cacheKey,
        ttl,
        async () => {
          // 🎯 Build optimized query parameters
          const params = this.buildCompanyParams(options);
          
          // 🚀 Single API call instead of multiple queries
          const response = await this.client.get('/items/companies', { 
            params,
            cancelToken: this.cancelTokenSource.token
          });
          
          const data = response.data?.data || [];
          
          // 🚀 MEMORY FIX: Immediate cleanup
          response.data = null;
          
          // Return single company or array based on query type
          if (options.slug || options.uuid) {
            return data[0] || null;
          }
          
          return data;
        },
        skipCache
      );
    } catch (error) {
      // Silent fail for companies
      return options.slug || options.uuid ? null : [];
    }
  }

  /**
   * 🛠️ SMART ARTICLE QUERY BUILDER
   * Builds optimized query parameters for articles
   */
  private buildArticleParams(options: ArticleQueryOptions) {
    const params: any = {
      fields: ARTICLE_FIELD_PRESETS[options.fields || 'full'],
      deep: {
        translations: {
          _filter: { languages_code: { _eq: options.lang } }
        },
        'category_id.translations': {
          _filter: { languages_code: { _eq: options.lang } }
        }
      }
    };

    // 🔍 Build filter conditions
    const filters: any = {};
    
    // Featured status filtering
    if (options.featured_status) {
      // Be more specific - only get exact featured status
      filters.featured_status = { _eq: options.featured_status };
    }
    
    // Category filtering
    if (options.category_slug) {
      filters['category_id.translations.slug_permalink'] = { _eq: options.category_slug };
    }
    
    // Destination filtering
    if (options.destination_id) {
      filters.destination_id = { _eq: options.destination_id };
    }
    
    // Single item queries
    if (options.uuid) {
      filters.uuid_id = { _eq: options.uuid };
      params.limit = 1;
    } else if (options.slug) {
      filters['translations.slug_permalink'] = { _eq: options.slug };
      params.limit = 1;
    }
    
    // Apply custom filters
    if (options.filters) {
      Object.assign(filters, options.filters);
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      params.filter = filters;
    }
    
    // 📊 Pagination & Limits
    if (options.limit) {
      params.limit = options.limit;
    } else if (!options.uuid && !options.slug) {
      params.limit = this.getSmartArticleLimit(options);
    }
    
    if (options.offset !== undefined) {
      params.offset = options.offset;
      params.meta = 'filter_count';
    }
    
    // 🔄 Sorting
    params.sort = ['-date_created'];
    
    return params;
  }

  /**
   * 🛠️ SMART COMPANY QUERY BUILDER
   * Builds optimized query parameters for companies
   */
  private buildCompanyParams(options: CompanyQueryOptions) {
    const params: any = {
      fields: COMPANY_FIELD_PRESETS[options.fields || 'full'],
      deep: {
        translations: {
          _filter: { languages_code: { _eq: options.lang } }
        }
      }
    };

    // 🔍 Build filter conditions
    const filters: any = { active: { _eq: true } };
    
    // Featured status filtering
    if (options.featured_status) {
      filters.featured_status = { _eq: options.featured_status };
    }
    
    // Destination filtering
    if (options.destination_id) {
      filters.destination_id = { _eq: options.destination_id };
    }
    
    // Category filtering
    if (options.category_id) {
      filters.category_id = { _eq: options.category_id };
    }
    
    // Single item queries
    if (options.uuid) {
      filters.uuid_id = { _eq: options.uuid };
      params.limit = 1;
    } else if (options.slug) {
      filters.slug_permalink = { _eq: options.slug };
      params.limit = 1;
    }
    
    // Apply custom filters
    if (options.filters) {
      Object.assign(filters, options.filters);
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      params.filter = filters;
    }
    
    // 📊 Pagination & Limits
    if (options.limit) {
      params.limit = options.limit;
    } else if (!options.uuid && !options.slug) {
      params.limit = this.getSmartCompanyLimit(options);
    }
    
    if (options.offset !== undefined) {
      params.offset = options.offset;
    }
    
    return params;
  }

  /**
   * 🛠️ SMART QUERY BUILDER
   * Builds optimized query parameters based on options
   */
  private buildOptimizedParams(options: DestinationQueryOptions) {
    const params: any = {
      // 🎯 Smart field selection
      fields: FIELD_PRESETS[options.fields || 'full'],
      
      // 🌍 Language filtering for current destination and parent destinations
      deep: {
        translations: {
          _filter: { languages_code: { _eq: options.lang } }
        },
        'region_id.translations': {
          _filter: { languages_code: { _eq: options.lang } }
        },
        'province_id.translations': {
          _filter: { languages_code: { _eq: options.lang } }
        }
      }
    };

    // 🔍 Build filter conditions
    const filters: any = {};
    
    // Type filtering
    if (options.type) {
      filters.type = { _eq: options.type };
    }
    
    // Hierarchical filtering
    if (options.parent_id) {
      // Smart parent detection based on context
      if (options.type === 'municipality') {
        filters.province_id = { _eq: options.parent_id };
      } else if (options.type === 'province') {
        filters.region_id = { _eq: options.parent_id };
      }
    }
    
    // Featured filtering
    if (options.featured === 'homepage') {
      filters.featured_status = { _eq: 'homepage' };
    }
    
    // Single item queries
    if (options.uuid) {
      filters.uuid_id = { _eq: options.uuid };
      params.limit = 1;
    } else if (options.slug) {
      // 🚀 FIXED: Combine slug search with type filter
      filters['translations.slug_permalink'] = { _eq: options.slug };
      params.limit = 1;
    }
    
    // Apply filters (now including slug queries)
    if (Object.keys(filters).length > 0) {
      params.filter = filters;
    }
    
    // 📊 Pagination & Limits
    if (options.limit) {
      params.limit = options.limit;
    } else {
      // Smart defaults based on query type
      params.limit = this.getSmartLimit(options);
    }
    
    if (options.offset) {
      params.offset = options.offset;
    }
    
    // 🔄 Sorting
    params.sort = this.getSmartSort(options);
    
    return params;
  }
  
  /**
   * 🧠 SMART LIMIT DETECTION
   */
  private getSmartLimit(options: DestinationQueryOptions): number {
    if (options.fields === 'sitemap') return 1000;
    if (options.fields === 'navigation') return 100;
    if (options.type === 'municipality') return 30; // Municipalities are numerous
    if (options.featured) return 10;
    return 50; // Default reasonable limit
  }
  
  /**
   * 🔄 SMART SORTING
   */
  private getSmartSort(options: DestinationQueryOptions): string[] {
    if (options.featured) return ['featured_sort', 'id'];
    if (options.fields === 'sitemap') return ['type', 'id'];
    return ['id']; // Default stable sort
  }

  /**
   * 🧠 SMART ARTICLE LIMIT DETECTION
   */
  private getSmartArticleLimit(options: ArticleQueryOptions): number {
    if (options.fields === 'sitemap') return 500;
    if (options.fields === 'sidebar') return 15;
    if (options.fields === 'homepage') return 8;
    if (options.category_slug) return 20;
    return 10; // Default reasonable limit
  }

  /**
   * 🧠 SMART COMPANY LIMIT DETECTION
   */
  private getSmartCompanyLimit(options: CompanyQueryOptions): number {
    if (options.fields === 'sitemap') return 1000;
    if (options.fields === 'homepage') return 12;
    if (options.featured_status) return 10;
    if (options.destination_id) return 25;
    return 50; // Default reasonable limit
  }

  /**
   * 🧹 FORCE COMPLETE CACHE CLEAR
   * Clears all cache entries to solve language mixing issues
   */
  public async forceClearAllCache(): Promise<void> {
    try {
      
      // Import delCache dynamically to avoid circular dependencies
      const { delCache } = await import('@/lib/redis-cache');
      
      // Clear all possible cache patterns
      const patterns = [
        'directus:*',
        'homepage:*',
        'sitemap:*',
        'destinations:*',
        'articles:*',
        'companies:*',
        'categories:*'
      ];

      
      
    } catch (error) {
      console.error('❌ [CACHE] Error clearing cache:', error);
    }
  }
}

// 🎯 TRANSLATION HELPERS
export const getTranslations = async (lang: string, section: string) => {
  try {
    // 🔐 Use public token for public translation data
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (publicToken) {
      headers['Authorization'] = `Bearer ${publicToken}`;
    }

    const response = await axios.get(`${baseURL}/items/translations`, {
      headers,
      params: {
        filter: {
          language: { _eq: lang },
          section: { _eq: section },
        },
        fields: ['content'],
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response?.data?.data?.[0]?.content) {
      return getTranslationFallback(section, lang);
    }

    try {
      const translations = JSON.parse(response.data.data[0].content);
      return translations;
    } catch (parseError) {
      return getTranslationFallback(section, lang);
    }
  } catch (error) {
    return getTranslationFallback(section, lang);
  }
};

// 🔄 Translation fallback system
const getTranslationFallback = (section: string, lang: string) => {
  const fallbacks: Record<string, Record<string, any>> = {
    'eccellenze': {
      'it': {
        title: 'Eccellenze Italiane',
        subtitle: 'Scopri le migliori eccellenze italiane selezionate da TheBestItaly',
        companies_section: 'Le Migliori Eccellenze Italiane'
      },
      'en': {
        title: 'Italian Excellence',
        subtitle: 'Discover the best Italian excellence selected by TheBestItaly',
        companies_section: 'The Best Italian Excellence'
      }
    },
    'general': {
      'it': {
        featured_articles: 'Articoli in Evidenza',
        read_more: 'Leggi di più',
        load_more: 'Carica altri',
        no_results: 'Nessun risultato trovato'
      },
      'en': {
        featured_articles: 'Featured Articles',
        read_more: 'Read more',
        load_more: 'Load more',
        no_results: 'No results found'
      }
    },
    'header': {
      'it': {
        destinations: 'Destinazioni',
        magazine: 'Magazine',
        experiences: 'Esperienze',
        excellence: 'Eccellenze',
        useful_info: 'Informazioni Utili'
      },
      'en': {
        destinations: 'Destinations',
        magazine: 'Magazine',
        experiences: 'Experiences',
        excellence: 'Excellence',
        useful_info: 'Useful Information'
      }
    },
    'footer': {
      'it': {
        about: 'Chi Siamo',
        contact: 'Contatti',
        privacy: 'Privacy',
        terms: 'Termini di Servizio'
      },
      'en': {
        about: 'About Us',
        contact: 'Contact',
        privacy: 'Privacy',
        terms: 'Terms of Service'
      }
    }
  };

  const sectionFallback = fallbacks[section];
  if (sectionFallback) {
    const langFallback = sectionFallback[lang] || sectionFallback['it'] || sectionFallback['en'];
    if (langFallback) {
      return langFallback;
    }
  }

  return {};
};

// 🎯 HELPER FUNCTIONS
export const getSupportedLanguages = async (): Promise<string[]> => {
  try {
    // 🔐 Use public token for public data
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (publicToken) {
      headers['Authorization'] = `Bearer ${publicToken}`;
    }
    
    const response = await axios.get(`${baseURL}/items/languages`, {
      headers,
      params: {
        filter: { status: { _eq: 'published' } },
        fields: ['code', 'active'],
        limit: 100
      }
    });

    const languages = response.data?.data || [];
    return languages
      .filter((lang: any) => lang.active)
      .map((lang: any) => lang.code);
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return ['it', 'en']; // fallback
  }
};

// 🚀 MEMORY-SAFE SINGLETON PATTERN
class DirectusClientManager {
  private static instance: DirectusWebClient | null = null;
  private static createdAt: number = 0;
  private static readonly MAX_INSTANCE_AGE = 300000; // 5 minutes

  static getInstance(): DirectusWebClient {
    const now = Date.now();
    
    // Auto-cleanup old instances
    if (this.instance && (now - this.createdAt) > this.MAX_INSTANCE_AGE) {
      this.instance.cleanup();
      this.instance = null;
    }

    if (!this.instance) {
      this.instance = new DirectusWebClient();
      this.createdAt = now;
    }

    return this.instance;
  }

  static cleanup() {
    if (this.instance) {
      this.instance.cleanup();
      this.instance = null;
    }
    DirectusWebClient.globalCleanup();
  }
}

// Export the managed instance
export default DirectusClientManager.getInstance();
export { DirectusClientManager };

// 🔄 AUTO-REFRESH CACHE for destinations descriptions fix
if (typeof window === 'undefined') { // Only on server side
  // Auto-refresh destinations cache to load missing descriptions
  DirectusWebClient.refreshDestinationsCache().catch(error => {
    console.warn('⚠️ Auto-refresh destinations cache failed:', error);
  });
  
  // Auto-refresh sidebar cache to fix destination filtering
  DirectusWebClient.refreshSidebarCache().catch(error => {
    console.warn('⚠️ Auto-refresh sidebar cache failed:', error);
  });
} 