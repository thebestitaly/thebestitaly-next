import axios, { AxiosInstance } from 'axios';

// Admin-specific interfaces
export interface AdminArticle {
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

export interface AdminCompany {
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
  description?: string;
  seo_title?: string;
  seo_summary?: string;
  slug_permalink?: string;
}

export interface CompanyImage {
  id: string;
  directus_files_id: string;
}

export interface Translation {
  languages_code: string;
  destination_name?: string;
  seo_title?: string;
  seo_summary?: string;
  description?: string;
  slug_permalink?: string;
}

export interface Category {
  id: string;
  uuid_id: string;
  nome_categoria: string;
  image: string;
  visible: boolean;
  translations: {
    id: string;
    languages_code: string;
    nome_categoria: string;
    seo_title: string;
    seo_summary: string;
    slug_permalink: string;
  }[];
}

/**
 * 🔐 ADMIN-OPTIMIZED DirectusClient 
 * CRUD operations and authentication for admin panel
 */
class DirectusAdminClient {
  private client: AxiosInstance;
  private static activeCalls = 0;
  private static readonly MAX_CONCURRENT_CALLS = 5; // Lower for admin operations
  private static readonly REQUEST_TIMEOUT = 60000; // Longer timeout for admin operations

  constructor() {
    // Always use proxy to avoid CORS issues in both development and production
    // Only server-side API routes should use direct CDN access
    const baseURL = '/api/directus';
    
    console.log(`🔗 DirectusAdminClient using proxy: ${baseURL}`);

    this.client = axios.create({
      baseURL,
      timeout: DirectusAdminClient.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      maxContentLength: 50 * 1024 * 1024, // 50MB for admin uploads
      maxBodyLength: 50 * 1024 * 1024,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (DirectusAdminClient.activeCalls >= DirectusAdminClient.MAX_CONCURRENT_CALLS) {
          throw new Error(`Max concurrent calls exceeded: ${DirectusAdminClient.activeCalls}`);
        }
        DirectusAdminClient.activeCalls++;
        return config;
      },
      (error) => {
        DirectusAdminClient.activeCalls = Math.max(0, DirectusAdminClient.activeCalls - 1);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        DirectusAdminClient.activeCalls = Math.max(0, DirectusAdminClient.activeCalls - 1);
        return response;
      },
      (error) => {
        DirectusAdminClient.activeCalls = Math.max(0, DirectusAdminClient.activeCalls - 1);
        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      console.error('DirectusAdminClient request error:', error);
      throw error;
    }
  }

  // 🔐 AUTHENTICATION
  public async testAuth(): Promise<boolean> {
    return this.makeRequest(async () => {
      try {
        await this.client.get('/users/me');
        return true;
      } catch (error) {
        console.error('Auth test failed:', error);
        return false;
      }
    });
  }

  // 🎯 CRUD OPERATIONS
  public async get(url: string, config?: object) {
    return this.makeRequest(async () => {
      const response = await this.client.get(url, config);
      return response;
    });
  }

  public async post(url: string, data?: any, config?: object) {
    return this.makeRequest(async () => {
      const response = await this.client.post(url, data, config);
      return response;
    });
  }

  public async put(url: string, data?: any, config?: object) {
    return this.makeRequest(async () => {
      const response = await this.client.put(url, data, config);
      return response;
    });
  }

  public async delete(url: string, config?: object) {
    return this.makeRequest(async () => {
      const response = await this.client.delete(url, config);
      return response;
    });
  }

  // 🎯 ADMIN ARTICLE OPERATIONS
  public async getArticlesForReserved(
    languageCode: string,
    offset: number = 0,
    limit: number = 50
  ): Promise<{ articles: AdminArticle[]; total: number }> {
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
      console.error('Error fetching articles for admin:', error);
      return { articles: [], total: 0 };
    }
  }

  public async getArticleByUUID(uuid: string, languageCode: string): Promise<AdminArticle | null> {
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

  // 🎯 ADMIN COMPANY OPERATIONS
  public async getCompanyByUUID(uuid: string, lang: string): Promise<AdminCompany | null> {
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

  // 🎯 ADMIN CATEGORY OPERATIONS
  public async getCategories(languageCode: string): Promise<Category[]> {
    try {
      const response = await this.client.get('/items/categorias', {
        params: {
          fields: [
            'id', 'uuid_id', 'nome_categoria', 'image', 'visible',
            'translations.*'
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

  // 🎯 ADMIN DESTINATION OPERATIONS
  public async getDestinationsByType(type: 'region' | 'province' | 'municipality', languageCode: string): Promise<any[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          filter: { type: { _eq: type } },
          fields: [
            'id', 'uuid_id', 'type', 'image', 'region_id', 'province_id',
            'translations.destination_name', 'translations.seo_title',
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
      console.error('Error fetching destinations by type:', error);
      return [];
    }
  }

  // 🎯 ADMIN COMPANY OPERATIONS
  public async getCompaniesForListing(lang: string, filters: Record<string, any> = {}, limit?: number): Promise<any[]> {
    try {
      // Light query for listing - only essential fields, no description
      const response = await this.client.get('/items/companies', {
        params: {
          filter: { ...filters },
          fields: [
            'id', 'uuid_id', 'website', 'company_name', 
            'featured_image', 'images', 'phone', 'category_id', 'destination_id',
            'active', 'featured', 'featured_status',
            'translations.description', 
            'translations.seo_title', 'translations.seo_summary'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: limit || 100
        }
      });

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching companies for listing:', error);
      return [];
    }
  }

  public async getCompanyForEdit(uuid: string, lang: string): Promise<AdminCompany | null> {
    try {
      // Complete query for editing - all fields including description
      const response = await this.client.get('/items/companies', {
        params: {
          filter: { uuid_id: { _eq: uuid } },
          fields: [
            'id', 'uuid_id', 'website', 'company_name', 
            'featured_image', 'images', 'phone', 'category_id', 'destination_id',
            'active', 'featured', 'featured_status', 'lat', 'long', 'socials',
            'translations.description', 
            'translations.seo_title', 'translations.seo_summary'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 1
        }
      });

      const company = response.data?.data?.[0];
      if (!company) return null;

      return {
        id: company.id,
        uuid_id: company.uuid_id,
        logo: company.logo || '',
        website: company.website || '',
        company_name: company.company_name || '',
        slug_permalink: company.slug_permalink || '',
        phone: company.phone || '',
        lat: company.lat,
        long: company.long,
        category_id: company.category_id || '',
        destination_id: company.destination_id || '',
        active: company.active || false,
        images: company.images || [],
        featured: company.featured || false,
        featured_image: company.featured_image,
        socials: company.socials || {},
        translations: company.translations || []
      };
    } catch (error) {
      console.error('Error fetching company for edit:', error);
      return null;
    }
  }

  public async getCompanyCategories(lang: string): Promise<any[]> {
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

  public async getDestinations(params: {
    type: string;
    region_id?: string | number | { id: string | number };
    province_id?: string | number | { id: string | number };
    exclude_id?: string | number;
    lang?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      const { type, region_id, province_id, exclude_id, lang, limit = 20 } = params;
      
      const queryParams: any = {
        filter: { type: { _eq: type } },
        fields: [
          'id', 'uuid_id', 'type', 'image', 'region_id', 'province_id',
          'translations.destination_name', 'translations.seo_title',
          'translations.seo_summary', 'translations.slug_permalink'
        ],
        limit
      };

      if (lang) {
        queryParams.deep = {
          translations: {
            _filter: { languages_code: { _eq: lang } }
          }
        };
      }

      if (region_id) {
        const regionIdValue = typeof region_id === 'object' && region_id.id ? region_id.id : region_id;
        queryParams.filter.region_id = { _eq: regionIdValue };
      }

      if (province_id) {
        const provinceIdValue = typeof province_id === 'object' && province_id.id ? province_id.id : province_id;
        queryParams.filter.province_id = { _eq: provinceIdValue };
      }

      if (exclude_id) {
        queryParams.filter.id = { _neq: exclude_id };
      }

      const response = await this.client.get('/items/destinations', { params: queryParams });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  public async getDestinationById(id: string, languageCode: string): Promise<any | null> {
    try {
      const response = await this.client.get(`/items/destinations/${id}`, {
        params: {
          fields: [
            'id', 'uuid_id', 'type', 'image', 'region_id', 'province_id',
            'translations.destination_name', 'translations.seo_title',
            'translations.seo_summary', 'translations.description', 'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: languageCode } }
            }
          }
        }
      });

      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching destination by ID:', error);
      return null;
    }
  }

  // 🎯 GENERIC ADMIN OPERATIONS
  async getItemById(collection: string, id: string, params: any = {}) {
    return this.getItems(collection, {
      ...params,
      filter: { id: { _eq: id } },
      limit: 1
    }).then(items => items[0] || null);
  }

  async getItems(collection: string, params: any = {}): Promise<any> {
    try {
      const response = await this.client.get(`/items/${collection}`, {
        params
      });
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching items from ${collection}:`, error);
      return [];
    }
  }

  async getSingleton(collection: string, params: any = {}): Promise<any> {
    try {
      const response = await this.client.get(`/items/${collection}`, {
        params
      });
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching singleton from ${collection}:`, error);
      return null;
    }
  }

  // 🎯 FILE OPERATIONS
  async uploadFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data?.data?.id || null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await this.client.delete(`/files/${fileId}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // 🎯 TRANSLATION OPERATIONS
  async getTranslations(lang: string, section: string) {
    try {
      const response = await this.client.get('/items/translations', {
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
  }

  async createTranslation(data: any) {
    try {
      const response = await this.client.post('/items/translations', data);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error creating translation:', error);
      return null;
    }
  }

  async updateTranslation(id: string, data: any) {
    try {
      const response = await this.client.patch(`/items/translations/${id}`, data);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error updating translation:', error);
      return null;
    }
  }

  // 🎯 CACHE OPERATIONS
  async invalidateCache(key?: string) {
    try {
      const url = key ? `/cache/invalidate?key=${key}` : '/cache/invalidate';
      await this.client.post(url);
      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  }

  // 🎯 CLEANUP
  public cleanup() {
    this.client.interceptors.request.clear();
    this.client.interceptors.response.clear();
    DirectusAdminClient.activeCalls = 0;
  }

  public static globalCleanup() {
    DirectusAdminClient.activeCalls = 0;
  }

  // 🎯 SITEMAP METHODS (for compatibility with old directus.ts)
  public async getArticlesForSitemap(lang: string): Promise<any[]> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          fields: ['slug_permalink', 'date_created'],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          limit: 1000
        }
      });
      
      return response.data?.data?.map((article: any) => ({
        slug_permalink: article.translations?.[0]?.slug_permalink,
        date_created: article.date_created
      })).filter((article: any) => article.slug_permalink) || [];
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      return [];
    }
  }

  public async getCompaniesForSitemap(): Promise<any[]> {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          fields: ['slug_permalink'],
          filter: { active: { _eq: true } },
          limit: 1000
        }
      });
      
      return response.data?.data?.filter((company: any) => company.slug_permalink) || [];
    } catch (error) {
      console.error('Error fetching companies for sitemap:', error);
      return [];
    }
  }

  public async getCategoriesForSitemap(lang: string): Promise<any[]> {
    try {
      const response = await this.client.get('/items/categorias', {
        params: {
          fields: ['slug_permalink'],
          deep: {
            translations: {
              _filter: { languages_code: { _eq: lang } }
            }
          },
          filter: { visible: { _eq: true } },
          limit: 100
        }
      });
      
      return response.data?.data?.map((category: any) => ({
        slug_permalink: category.translations?.[0]?.slug_permalink
      })).filter((category: any) => category.slug_permalink) || [];
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
      return [];
    }
  }
}

const directusAdminClient = new DirectusAdminClient();
export default directusAdminClient; 