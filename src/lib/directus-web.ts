import axios, { AxiosInstance } from 'axios';
import { getOptimizedImageUrl } from "./imageUtils";
import { getProvincesForRegion, getMunicipalitiesForProvince, getDestinationDetails } from './static-destinations';

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
}

// 🎯 FIELD PRESETS - Optimized for different use cases
const FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'type', 
    'translations.destination_name', 
    'translations.slug_permalink'
  ],
  
  full: [
    'id', 'uuid_id', 'type', 'image', 'lat', 'long', 'featured_status',
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.destination_name', 'translations.seo_title', 'translations.seo_summary', 
    'translations.description', 'translations.slug_permalink'
  ],
  
  sitemap: ['type', 'translations.slug_permalink'],
  
  homepage: [
    'id', 'uuid_id', 'type', 'image', 'featured_status',
    // 🚀 ADDED: Parent destination data for URL building
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.destination_name', 'translations.seo_title', 'translations.seo_summary', 'translations.slug_permalink'
  ],
  
  navigation: [
    'id', 'uuid_id', 'type',
    // 🚀 ADDED: Parent destination data for URL building
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.destination_name', 'translations.slug_permalink'
  ]
};

// 🚀 ARTICLE FIELD PRESETS - Optimized for different use cases
const ARTICLE_FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'date_created', 'featured_status',
    'translations.titolo_articolo', 'translations.slug_permalink'
  ],
  
  full: [
    'id', 'uuid_id', 'image', 'date_created', 'featured_status', 'destination_id',
    'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
    'category_id.translations.slug_permalink', 'translations.*'
  ],
  
  sitemap: [
    'id', 'date_created', 'translations.slug_permalink'
  ],
  
  homepage: [
    'id', 'uuid_id', 'image', 'date_created', 'featured_status',
    'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
    'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
  ],
  
  sidebar: [
    'id', 'uuid_id', 'image', 'date_created', 'featured_status',
    'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
    'category_id.translations.slug_permalink', 'destination_id',
    'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
  ]
};

// 🏢 COMPANY FIELD PRESETS - Optimized for different use cases
const COMPANY_FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'company_name', 'slug_permalink',
    'translations.seo_title'
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
    'phone', 'category_id', 'destination_id', 'featured_status', 'translations.seo_title', 'translations.seo_summary'
  ]
};

/**
 * 🎯 WEB-OPTIMIZED DirectusClient 
 * Only public read-only operations for maximum performance
 */
class DirectusWebClient {
  private client: AxiosInstance;
  private static activeCalls = 0;
  private static readonly MAX_CONCURRENT_CALLS = 10;
  private static readonly REQUEST_TIMEOUT = 10000; // Reduced from 30s to 10s
  
  // 🚀 MEMORY OPTIMIZATION: Client pool to reuse instances
  private static clientPool: Map<string, DirectusWebClient> = new Map();
  private static readonly MAX_POOL_SIZE = 3;
  private lastUsed: number = Date.now();
  
  // 🚀 CIRCUIT BREAKER: Prevent cascade failures
  private static errorCount = 0;
  private static readonly MAX_ERRORS = 10;
  private static lastErrorReset = Date.now();
  private static readonly ERROR_RESET_INTERVAL = 60000; // 1 minute

  constructor(lang?: string) {
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_DIRECTUS_URL environment variable is not set');
    }

    // 🔐 Use appropriate token for authentication
    // For server-side calls, use DIRECTUS_TOKEN; for client-side, use NEXT_PUBLIC_DIRECTUS_TOKEN
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
      maxContentLength: 10 * 1024 * 1024, // 10MB max
      maxBodyLength: 5 * 1024 * 1024,     // 5MB max
      // 🚀 MEMORY OPTIMIZATION: Limit connections and enable cleanup
      maxRedirects: 3,
      httpAgent: typeof window === 'undefined' ? new (require('http').Agent)({ 
        keepAlive: true,
        maxSockets: 5,        // Limit concurrent connections
        maxFreeSockets: 2,    // Limit idle connections
        timeout: 5000,        // Connection timeout
        freeSocketTimeout: 10000, // Close idle sockets after 10s
      }) : undefined,
      httpsAgent: typeof window === 'undefined' ? new (require('https').Agent)({ 
        keepAlive: true,
        maxSockets: 5,
        maxFreeSockets: 2,
        timeout: 5000,
        freeSocketTimeout: 10000,
      }) : undefined,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // 🚀 TEMPORARILY REMOVED: Concurrent calls limit causing 404s
        // if (DirectusWebClient.activeCalls >= DirectusWebClient.MAX_CONCURRENT_CALLS) {
        //   throw new Error(`Max concurrent calls exceeded: ${DirectusWebClient.activeCalls}`);
        // }
        DirectusWebClient.activeCalls++;
        return config;
      },
      (error) => {
        DirectusWebClient.activeCalls = Math.max(0, DirectusWebClient.activeCalls - 1);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        DirectusWebClient.activeCalls = Math.max(0, DirectusWebClient.activeCalls - 1);
        return response;
      },
      (error) => {
        DirectusWebClient.activeCalls = Math.max(0, DirectusWebClient.activeCalls - 1);
        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // 🚀 CIRCUIT BREAKER: Check if we should allow the request
    if (!DirectusWebClient.shouldAllowRequest()) {
      throw new Error('Circuit breaker is OPEN - too many errors');
    }
    
    // Add delay if we're at the limit
    while (DirectusWebClient.activeCalls >= DirectusWebClient.MAX_CONCURRENT_CALLS) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      return await requestFn();
    } catch (error) {
      // 🚨 Record error for circuit breaker
      DirectusWebClient.recordError();
      throw error;
    }
  }

  public async get(url: string, config?: object) {
    return this.makeRequest(async () => {
      const response = await this.client.get(url, config);
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
    // 🚀 REFACTORED: Use unified getDestinations method
    return this.getDestinations({
      featured: 'homepage',
      lang,
      fields: 'homepage',
      limit: 8
    });
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
      const response = await this.client.get('/items/categorias', {
        params: {
          filter: { visible: { _eq: true } },
          fields: [
            'id', 'uuid_id', 'nome_categoria', 'image', 'visible',
            'translations.nome_categoria', 'translations.seo_title',
            'translations.seo_summary', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            }
          }
        }
      });

      return response.data.data || [];
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

  // 🚀 CIRCUIT BREAKER: Check if we should allow requests
  private static shouldAllowRequest(): boolean {
    const now = Date.now();
    
    // Reset error count after interval
    if (now - DirectusWebClient.lastErrorReset > DirectusWebClient.ERROR_RESET_INTERVAL) {
      DirectusWebClient.errorCount = 0;
      DirectusWebClient.lastErrorReset = now;
    }
    
    // Block if too many errors
    if (DirectusWebClient.errorCount >= DirectusWebClient.MAX_ERRORS) {
      console.warn('🚨 Circuit breaker OPEN - blocking requests due to too many errors');
      return false;
    }
    
    return true;
  }
  
  // 🚀 CIRCUIT BREAKER: Record error
  private static recordError() {
    DirectusWebClient.errorCount++;
  }

  // 🚀 MEMORY OPTIMIZATION: Get client from pool or create new one
  public static getClient(lang?: string): DirectusWebClient {
    const key = lang || 'default';
    
    // Check if we have a client in the pool
    if (DirectusWebClient.clientPool.has(key)) {
      const client = DirectusWebClient.clientPool.get(key)!;
      client.lastUsed = Date.now();
      return client;
    }
    
    // Create new client if pool is not full
    if (DirectusWebClient.clientPool.size < DirectusWebClient.MAX_POOL_SIZE) {
      const client = new DirectusWebClient(lang);
      DirectusWebClient.clientPool.set(key, client);
      return client;
    }
    
    // Pool is full, find oldest client to replace
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [k, client] of DirectusWebClient.clientPool.entries()) {
      if (client.lastUsed < oldestTime) {
        oldestTime = client.lastUsed;
        oldestKey = k;
      }
    }
    
    // Cleanup old client and create new one
    if (oldestKey) {
      const oldClient = DirectusWebClient.clientPool.get(oldestKey)!;
      oldClient.cleanup();
      DirectusWebClient.clientPool.delete(oldestKey);
    }
    
    const client = new DirectusWebClient(lang);
    DirectusWebClient.clientPool.set(key, client);
    return client;
  }

  // 🧹 Clean up old clients periodically
  public static cleanupOldClients() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    for (const [key, client] of DirectusWebClient.clientPool.entries()) {
      if (now - client.lastUsed > maxAge) {
        client.cleanup();
        DirectusWebClient.clientPool.delete(key);
      }
    }
  }

  // 🎯 CLEANUP
  public cleanup() {
    this.client.interceptors.request.clear();
    this.client.interceptors.response.clear();
    DirectusWebClient.activeCalls = 0;
    
    // 🚀 MEMORY OPTIMIZATION: Force cleanup of axios instance
    if (this.client && this.client.defaults) {
      this.client.defaults.timeout = 1000; // Force quick timeout for pending requests
    }
    
    // 🗑️ Clear any cached data
    this.client = null as any;
    
    // 🧹 Force garbage collection if available (Node.js)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  public static globalCleanup() {
    DirectusWebClient.activeCalls = 0;
    
    // 🧹 Force garbage collection if available (Node.js)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  /**
   * 🚀 UNIFIED DESTINATION METHOD
   * Replaces: getDestinationsByType, getFeaturedDestinations, getHomepageDestinations, getDestinationsForSitemap
   * Handles all destination queries with optimized performance
   */
  async getDestinations(options: DestinationQueryOptions): Promise<Destination[]> {
    try {
      // 🚀 TWO-STEP QUERY: Avoid 403 errors by using destinations_translations table first
      if (options.slug) {
        // Step 1: Get translation data
        
        // Step 1: Get FULL translation data (not just ID)
        const translationUrl = '/items/destinations_translations';
        const translationParams = {
          filter: { 
            slug_permalink: { _eq: options.slug },
            languages_code: { _eq: options.lang }
          },
                      fields: [
              'destinations_id', 'languages_code', 'destination_name', 
              'slug_permalink', 'seo_title', 'seo_summary', 
              'description'
            ]
        };
        const translationResponse = await this.client.get(translationUrl, { 
          params: translationParams
        });
        
        const translationData = translationResponse.data?.data || [];
        if (translationData.length === 0) {
          return [];
        }
        
        const translation = translationData[0];
        const destinationId = translation.destinations_id;
        
        // Step 2: Get ONLY base destination data (NO deep relations, NO 403!)
        const destinationResponse = await this.client.get(`/items/destinations/${destinationId}`, { 
          params: {
            fields: ['id', 'uuid_id', 'type', 'image', 'featured_status', 'region_id', 'province_id']
          }
        });
        
        const baseDestination = destinationResponse.data?.data;
        if (!baseDestination) {
          return [];
        }
        
        // Filter by type if specified
        if (options.type && baseDestination.type !== options.type) {
          return [];
        }
        
        // Step 3: Combine the two separate results into the expected format
        const combinedDestination = {
          ...baseDestination,
          translations: [translation] // Add the translation data from Step 1
        };
        
        const result = [combinedDestination];
        
        return result;
      }
      
      // 🎯 For non-slug queries, use optimized params
      const params = this.buildOptimizedParams(options);
      const response = await this.client.get('/items/destinations', { params });
      const data = response.data?.data || [];
      
      return data;
    } catch (error) {
      // Silent error handling for destinations
      
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
      // 🚀 SEPARATE QUERY APPROACH for single articles to avoid 403 errors
      if (options.slug || options.uuid) {
        return await this.getArticleWithSeparateQueries(options);
      }
      
      // 🎯 Build optimized query parameters for list queries
      const params = this.buildArticleParams(options);
      
      // 🚀 Single API call for list queries
      const response = await this.client.get('/items/articles', { params });
      
      // Return with total count if offset is specified (for pagination)
      if (options.offset !== undefined) {
        return {
          articles: response.data?.data || [],
          total: response.data?.meta?.filter_count || 0
        };
      }
      
      return response.data?.data || [];
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
   * 🚀 UNIFIED COMPANY METHOD
   * Replaces: getHomepageCompanies, getCompanyBySlug, getCompanyByUUID, getCompanies, 
   * getCompaniesByDestination, getCompaniesForSitemap
   * Handles all company queries with optimized performance
   */
  async getCompanies(options: CompanyQueryOptions): Promise<Company[] | Company | null> {
    try {
      // 🎯 Build optimized query parameters
      const params = this.buildCompanyParams(options);
      
      // 🚀 Single API call instead of multiple queries
      const response = await this.client.get('/items/companies', { params });
      
      // Return single company or array based on query type
      if (options.slug || options.uuid) {
        return response.data?.data?.[0] || null;
      }
      
      return response.data?.data || [];
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
      console.warn(`⚠️ No translation content found for section "${section}" and language "${lang}"`);
      return getTranslationFallback(section, lang);
    }

    try {
      const translations = JSON.parse(response.data.data[0].content);
      console.log(`✅ Loaded translations for section "${section}" (${lang})`);
      return translations;
    } catch (parseError) {
      console.error('❌ Error parsing translation content:', parseError);
      return getTranslationFallback(section, lang);
    }
  } catch (error) {
    console.error(`❌ Translation fetch error for section "${section}" (${lang}):`, (error as any).message);
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
      console.log(`🔄 Using fallback translations for section "${section}" (${lang})`);
      return langFallback;
    }
  }

  console.warn(`⚠️ No fallback available for section "${section}" (${lang})`);
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

// 🚀 MEMORY OPTIMIZATION: Use pooled client instead of singleton
const directusWebClient = {
  // Proxy all method calls to use pooled client
  ...DirectusWebClient.prototype,
  
  // Override methods to use pooled client
  getDestinations: (options: any) => DirectusWebClient.getClient(options.lang).getDestinations(options),
  getArticles: (options: any) => DirectusWebClient.getClient(options.lang).getArticles(options),
  getCompanies: (options: any) => DirectusWebClient.getClient(options.lang).getCompanies(options),
  getDestinationsByType: (type: 'region' | 'province' | 'municipality', lang: string) => DirectusWebClient.getClient(lang).getDestinationsByType(type, lang),
  getHomepageDestinations: (lang: string) => DirectusWebClient.getClient(lang).getHomepageDestinations(lang),
  getHomepageCompanies: (lang: string) => DirectusWebClient.getClient(lang).getHomepageCompanies(lang),
  getHomepageArticles: (lang: string) => DirectusWebClient.getClient(lang).getHomepageArticles(lang),
  getFeaturedDestinations: (lang: string) => DirectusWebClient.getClient(lang).getFeaturedDestinations(lang),
  getCategories: (lang: string) => DirectusWebClient.getClient(lang).getCategories(lang),
  getDestinationBySlug: (slug: string, lang: string) => DirectusWebClient.getClient(lang).getDestinationBySlug(slug, lang),
  getDestinationByUUID: (uuid: string, lang: string) => DirectusWebClient.getClient(lang).getDestinationByUUID(uuid, lang),
  getArticleBySlug: (slug: string, lang: string) => DirectusWebClient.getClient(lang).getArticleBySlug(slug, lang),
  getArticleByUUID: (uuid: string, lang: string) => DirectusWebClient.getClient(lang).getArticleByUUID(uuid, lang),
  getCompanyBySlug: (slug: string, lang: string) => DirectusWebClient.getClient(lang).getCompanyBySlug(slug, lang),
  getCompanyByUUID: (uuid: string, lang: string) => DirectusWebClient.getClient(lang).getCompanyByUUID(uuid, lang),
  getCompanyCategories: (lang: string) => DirectusWebClient.getClient(lang).getCompanyCategories(lang),
  getDestinationsForSitemap: (lang: string) => DirectusWebClient.getClient(lang).getDestinationsForSitemap(lang),
  getArticlesForSitemap: (lang: string) => DirectusWebClient.getClient(lang).getArticlesForSitemap(lang),
  getCompaniesForSitemap: () => DirectusWebClient.getClient().getCompaniesForSitemap(),
  getCategoriesForSitemap: (lang: string) => DirectusWebClient.getClient(lang).getCategoriesForSitemap(lang),
  get: (url: string, config?: any) => DirectusWebClient.getClient().get(url, config),
  
  // Add cleanup methods
  cleanup: () => DirectusWebClient.globalCleanup(),
  cleanupOldClients: () => DirectusWebClient.cleanupOldClients(),
};

// 🚀 MEMORY OPTIMIZATION: Auto-cleanup every 2 minutes
if (typeof window === 'undefined') {
  // Only in Node.js environment
  setInterval(() => {
    DirectusWebClient.cleanupOldClients();
  }, 120000); // 2 minutes
}

export default directusWebClient; 