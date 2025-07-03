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
  region_id?: {
    id: string;
    uuid_id?: string;
    translations: Translation[];
  } | null;
  province_id?: {
    id: string;
    uuid_id?: string;
    translations: Translation[];
  } | null;
  type: 'region' | 'province' | 'municipality';
  image?: string;
  video_url?: string;
  lat?: number;
  long?: number;
  translations: Translation[];
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
  featured: boolean;
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

// 🎯 UNIFIED DESTINATION INTERFACE
interface DestinationQueryOptions {
  // Filtering
  type?: 'region' | 'province' | 'municipality';
  regionId?: string;
  provinceId?: string;
  parentId?: string;
  excludeId?: string;
  featured?: boolean | 'homepage' | 'top';
  
  // Identification (for single item queries)
  id?: string;
  uuid?: string;
  slug?: string;
  
  // Language & Response
  lang: string;
  limit?: number;
  offset?: number;
  
  // Field Selection Presets
  fields?: 'minimal' | 'full' | 'sitemap' | 'homepage' | 'navigation';
}

// 🎯 FIELD PRESETS - Optimized for different use cases
const FIELD_PRESETS = {
  minimal: [
    'id', 'uuid_id', 'type', 
    'translations.destination_name', 
    'translations.slug_permalink'
  ],
  
  full: [
    'id', 'uuid_id', 'type', 'image', 'lat', 'long',
    'region_id.id', 'region_id.uuid_id', 'region_id.translations.destination_name', 'region_id.translations.slug_permalink',
    'province_id.id', 'province_id.uuid_id', 'province_id.translations.destination_name', 'province_id.translations.slug_permalink',
    'translations.destination_name', 'translations.seo_title', 'translations.seo_summary', 
    'translations.description', 'translations.slug_permalink'
  ],
  
  sitemap: ['type', 'translations.slug_permalink'],
  
  homepage: [
    'id', 'uuid_id', 'type', 'image', 'featured_status',
    'translations.destination_name', 'translations.seo_title', 'translations.slug_permalink'
  ],
  
  navigation: [
    'id', 'uuid_id', 'type',
    'translations.destination_name', 'translations.slug_permalink'
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
  private static readonly REQUEST_TIMEOUT = 30000;

  constructor(lang?: string) {
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_DIRECTUS_URL environment variable is not set');
    }

    this.client = axios.create({
      baseURL,
      timeout: DirectusWebClient.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      maxContentLength: 10 * 1024 * 1024, // 10MB max
      maxBodyLength: 5 * 1024 * 1024,     // 5MB max
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
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
    try {
      return await requestFn();
    } catch (error) {
      console.error('DirectusWebClient request error:', error);
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
  async getHomepageCompanies(lang: string) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            featured: { _eq: true },
            active: { _eq: true }
          },
          fields: [
            'id', 'uuid_id', 'website', 'company_name', 'slug_permalink',
            'featured_image', 'phone', 'category_id', 'destination_id',
            'translations.seo_title', 'translations.seo_summary'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 12
        }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching homepage companies:', error);
      return [];
    }
  }

  async getHomepageArticles(lang: string) {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          filter: {
            featured_status: { _in: ['homepage', 'top'] }
          },
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
            'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            },
            'category_id.translations': {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 8,
          sort: ['-date_created']
        }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching homepage articles:', error);
      return [];
    }
  }

  async getFeaturedDestinations(lang: string): Promise<Destination[]> {
    // 🚀 REFACTORED: Use unified getDestinations method
    return this.getDestinations({
      featured: true,
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
    try {
      const filterParam = JSON.stringify({
        'translations': { 'slug_permalink': { '_eq': slug } }
      });
      
      const deepParam = JSON.stringify({
        'translations': {
          '_filter': { 'languages_code': { '_eq': languageCode } }
        },
        'category_id.translations': {
          '_filter': { 'languages_code': { '_eq': languageCode } }
        }
      });
      
      const fieldsParam = 'id,uuid_id,image,category_id.id,category_id.uuid_id,category_id.translations.nome_categoria,category_id.translations.slug_permalink,destination_id,date_created,translations.languages_code,translations.titolo_articolo,translations.description,translations.seo_summary,translations.slug_permalink';

      const response = await this.client.get(`/items/articles?filter=${encodeURIComponent(filterParam)}&deep=${encodeURIComponent(deepParam)}&fields=${fieldsParam}`);

      const article = response.data?.data?.[0];
      if (!article) return null;

      let translation = article.translations?.[0];
      let categoryTranslation = article.category_id?.translations?.[0];

      return {
        id: article.id,
        uuid_id: article.uuid_id,
        image: article.image,
        date_created: article.date_created,
        featured_status: article.featured_status || 'none',
        category_id: article.category_id ? {
          id: article.category_id.id,
          uuid_id: article.category_id.uuid_id,
          translations: [{
            nome_categoria: categoryTranslation?.nome_categoria || 'Uncategorized',
            slug_permalink: categoryTranslation?.slug_permalink || 'uncategorized'
          }]
        } : undefined,
        destination_id: article.destination_id,
        destination_uuid: article.destination_uuid,
        translations: [{
          languages_code: translation?.languages_code || languageCode,
          titolo_articolo: translation?.titolo_articolo || 'Untitled',
          description: translation?.description || '',
          seo_title: translation?.seo_title || translation?.titolo_articolo || 'Untitled',
          seo_summary: translation?.seo_summary || '',
          slug_permalink: translation?.slug_permalink || slug
        }]
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  async getArticleByUUID(uuid: string, languageCode: string): Promise<Article | null> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          filter: { uuid_id: { _eq: uuid } },
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink', 'destination_id',
            'translations.*'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            },
            'category_id.translations': {
              _filter: { languages_code: { _eq: languageCode } }
            }
          },
          limit: 1
        }
      });

      const article = response.data?.data?.[0];
      if (!article) return null;

      return {
        id: article.id,
        uuid_id: article.uuid_id,
        image: article.image,
        date_created: article.date_created,
        featured_status: article.featured_status || 'none',
        category_id: article.category_id,
        destination_id: article.destination_id,
        destination_uuid: article.destination_uuid,
        translations: article.translations || []
      };
    } catch (error) {
      console.error('Error fetching article by UUID:', error);
      return null;
    }
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
    try {
      const filterParam = JSON.stringify({
        slug_permalink: { _eq: slug }
      });
      
      const deepParam = JSON.stringify({
        translations: {
          _filter: { languages_code: { _eq: lang } }
        }
      });

      const response = await this.client.get(`/items/companies?filter=${encodeURIComponent(filterParam)}&deep=${encodeURIComponent(deepParam)}&fields=id,uuid_id,featured_image,website,company_name,phone,lat,long,category_id,destination_id,images.id,images.directus_files_id,featured,socials,translations.*`);
      
      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  async getCompanyByUUID(uuid: string, lang: string) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: { uuid_id: { _eq: uuid } },
          fields: [
            'id', 'uuid_id', 'website', 'company_name', 'slug_permalink',
            'featured_image', 'images', 'phone', 'lat', 'long',
            'category_id', 'destination_id', 'featured', 'active',
            'socials', 'translations.*'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 1
        }
      });

      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching company by UUID:', error);
      return null;
    }
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
  async getArticles(
    languageCode: string,
    offset: number = 0,
    limit: number = 10,
    filters: Record<string, any> = {},
    featuredStatus?: string
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      const filterConditions: any = {};
      
      if (featuredStatus) {
        filterConditions.featured_status = { _eq: featuredStatus };
      }
      
      Object.assign(filterConditions, filters);

      const response = await this.client.get('/items/articles', {
        params: {
          filter: filterConditions,
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink', 'destination_id',
            'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            },
            'category_id.translations': {
              _filter: { languages_code: { _eq: languageCode } }
            }
          },
          limit,
          offset,
          sort: ['-date_created'],
          meta: 'filter_count'
        }
      });

      return {
        articles: response.data.data || [],
        total: response.data.meta?.filter_count || 0
      };
    } catch (error) {
      console.error('Error fetching articles:', error);
      return { articles: [], total: 0 };
    }
  }

  async getArticlesByCategory(
    categorySlug: string, 
    languageCode: string, 
    limit: number = 10
  ): Promise<Article[]> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          filter: {
            'category_id.translations.slug_permalink': { _eq: categorySlug }
          },
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink', 'destination_id',
            'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            },
            'category_id.translations': {
              _filter: { languages_code: { _eq: languageCode } }
            }
          },
          limit,
          sort: ['-date_created']
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  }

  async getArticlesForSidebar(
    languageCode: string,
    filters: Record<string, any> = {},
    limit: number = 10
  ): Promise<Article[]> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          filter: filters,
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink', 'destination_id',
            'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            },
            'category_id.translations': {
              _filter: { languages_code: { _eq: languageCode } }
            }
          },
          limit,
          sort: ['-date_created']
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching articles for sidebar:', error);
      return [];
    }
  }

  async getLatestArticlesForSidebar(
    languageCode: string, 
    limit: number = 15
  ): Promise<Article[]> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          fields: [
            'id', 'uuid_id', 'image', 'date_created', 'featured_status',
            'category_id.id', 'category_id.uuid_id', 'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink', 'destination_id',
            'translations.titolo_articolo', 'translations.seo_summary', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            },
            'category_id.translations': {
              _filter: { languages_code: { _eq: languageCode } }
            }
          },
          limit,
          sort: ['-date_created']
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching latest articles for sidebar:', error);
      return [];
    }
  }

  async getCompanies(lang: string, filters: Record<string, any> = {}) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: { active: { _eq: true }, ...filters },
          fields: [
            'id', 'uuid_id', 'website', 'company_name', 'slug_permalink',
            'featured_image', 'images', 'phone', 'category_id', 'destination_id',
            'featured', 'active', 'featured_status',
            'translations.seo_title', 'translations.seo_summary', 'translations.slug_permalink'
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
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async getCompaniesByDestination(destinationId: string, lang: string, destinationType: 'region' | 'province' | 'municipality') {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            destination_id: { _eq: destinationId },
            active: { _eq: true }
          },
          fields: [
            'id', 'uuid_id', 'website', 'company_name', 'slug_permalink',
            'featured_image', 'images', 'phone', 'category_id', 'destination_id',
            'featured', 'active', 'featured_status',
            'translations.seo_title', 'translations.seo_summary', 'translations.slug_permalink'
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
      console.error('Error fetching companies by destination:', error);
      return [];
    }
  }

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
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: { active: { _eq: true } },
          fields: ['slug_permalink'],
          limit: 1000
        }
      });

      const companies = response.data?.data || [];
      return companies
        .map((company: any) => {
          if (company.slug_permalink) {
            return {
              slug_permalink: company.slug_permalink
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error fetching companies for sitemap:', error);
      return [];
    }
  }

  async getArticlesForSitemap(lang: string): Promise<Array<{slug_permalink: string, date_created?: string}>> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          fields: ['date_created', 'translations.slug_permalink'],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 500,
          sort: ['-date_created']
        }
      });

      const articles = response.data?.data || [];
      return articles
        .map((article: any) => {
          const translation = article.translations?.[0];
          if (translation?.slug_permalink) {
            return {
              slug_permalink: translation.slug_permalink,
              date_created: article.date_created
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      return [];
    }
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

  // 🎯 CLEANUP
  public cleanup() {
    this.client.interceptors.request.clear();
    this.client.interceptors.response.clear();
    DirectusWebClient.activeCalls = 0;
  }

  public static globalCleanup() {
    DirectusWebClient.activeCalls = 0;
  }

  /**
   * 🚀 UNIFIED DESTINATION METHOD
   * Replaces: getDestinationsByType, getFeaturedDestinations, getHomepageDestinations, getDestinationsForSitemap
   * Handles all destination queries with optimized performance
   */
  async getDestinations(options: DestinationQueryOptions): Promise<Destination[]> {
    try {
      // 🎯 Build optimized query parameters
      const params = this.buildOptimizedParams(options);
      
      // 🚀 Single API call instead of multiple queries
      const response = await this.client.get('/items/destinations', { params });
      
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  /**
   * 🛠️ SMART QUERY BUILDER
   * Builds optimized query parameters based on options
   */
  private buildOptimizedParams(options: DestinationQueryOptions) {
    const params: any = {
      // 🎯 Smart field selection
      fields: FIELD_PRESETS[options.fields || 'full'],
      
      // 🌍 Language filtering  
      deep: {
        translations: {
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
    if (options.regionId) {
      filters.region_id = { _eq: options.regionId };
    }
    
    if (options.provinceId) {
      filters.province_id = { _eq: options.provinceId };
    }
    
    if (options.parentId) {
      // Smart parent detection based on context
      if (options.type === 'municipality') {
        filters.province_id = { _eq: options.parentId };
      } else if (options.type === 'province') {
        filters.region_id = { _eq: options.parentId };
      }
    }
    
    // Featured filtering
    if (options.featured === true) {
      filters.featured_status = { _neq: 'none' };
    } else if (typeof options.featured === 'string') {
      filters.featured_status = { _eq: options.featured };
    }
    
    // Exclusion
    if (options.excludeId) {
      filters.id = { _neq: options.excludeId };
    }
    
    // Single item queries
    if (options.id) {
      filters.id = { _eq: options.id };
      params.limit = 1;
    } else if (options.uuid) {
      filters.uuid_id = { _eq: options.uuid };
      params.limit = 1;
    } else if (options.slug) {
      // Slug search uses translation filter
      params.filter = { 'translations.slug_permalink': { _eq: options.slug } };
      params.limit = 1;
    }
    
    // Apply filters if not using slug search
    if (!options.slug && Object.keys(filters).length > 0) {
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
}

// 🎯 TRANSLATION HELPERS
export const getTranslations = async (lang: string, section: string) => {
  try {
    const response = await directusWebClient.get('/items/translations', {
      params: {
        filter: {
          language: { _eq: lang },
          section: { _eq: section },
        },
        fields: ['content'],
      },
    });

    if (!response?.data?.data?.[0]?.content) {
      console.warn('No content found in translation response');
      return null;
    }

    try {
      return JSON.parse(response.data.data[0].content);
    } catch (parseError) {
      console.error('Error parsing content:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Translation fetch error:', error);
    return null;
  }
};

// 🎯 HELPER FUNCTIONS
export const getSupportedLanguages = async (): Promise<string[]> => {
  try {
    const response = await directusWebClient.get('/items/languages', {
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

const directusWebClient = new DirectusWebClient();
export default directusWebClient; 