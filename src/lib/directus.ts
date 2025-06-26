import axios, { AxiosInstance } from 'axios';

// Interfaces
export interface Translation {
  languages_code: string;
  destination_name?: string;
  seo_title?: string;
  seo_summary?: string;
  description?: string;
  slug_permalink?: string;
}

// Import Redis cache only on server side
let RedisCache: any = null;
let withCache: any = null;
let CacheKeys: any = null;
let CACHE_DURATIONS: any = null;

// Dynamically import Redis cache only on server side
async function loadRedisCache() {
  if (typeof window !== 'undefined') {
    // Client side - no Redis
    return null;
  }
  
  if (!RedisCache) {
    try {
      const redisModule = await import('./redis-cache');
      RedisCache = redisModule.RedisCache;
      withCache = redisModule.withCache;
      CacheKeys = redisModule.CacheKeys;
      CACHE_DURATIONS = redisModule.CACHE_DURATIONS;
      console.log('✅ Redis cache loaded for DirectusClient');
    } catch (error) {
      console.warn('⚠️ Redis cache not available, using direct API calls');
    }
  }
  
  return RedisCache;
}

export interface Destination {
  id: string;
  uuid_id: string; // Nuovo UUID
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
  video_url?: string; // YouTube, Vimeo, or direct video URL
  lat?: number;
  long?: number;
  translations: Translation[];
}

export const getTranslations = async (lang: string, section: string) => {
  try {
    const response = await directusClient.get('/items/translations', {
      params: {
        filter: {
          language: { _eq: lang },
          section: { _eq: section },
        },
        fields: ['content'],
      },
    });

    // Verifica che ci sia il contenuto
    if (!response?.data?.data?.[0]?.content) {
      console.warn('No content found in translation response');
      return null;
    }

    // Parse del contenuto JSON
    try {
      const parsedContent = JSON.parse(response.data.data[0].content);

      return parsedContent;
    } catch (parseError) {
      console.error('Error parsing content:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Translation fetch error:', error);
    return null;
  }
};

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
  uuid_id: string; // Nuovo UUID
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
  uuid_id: string; // Nuovo UUID
  image?: string;
  video_url?: string; // YouTube, Vimeo, or direct video URL
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
  destination_uuid?: string; // UUID della destinazione
  translations: {
    languages_code: string;
    titolo_articolo: string;
    description?: string;
    seo_title?: string;
    seo_summary?: string;
    slug_permalink: string;
  }[];
}
interface SlugData {
  regionSlug: string;
  provinceSlug: string;
  municipalitySlug: string;
  breadcrumb: { label: string; path: string }[];
}
// Aggiungi queste interfacce
export interface Company {
  id: string;
  uuid_id: string; // Nuovo UUID
  logo: string;
  website: string;
  company_name: string;
  slug_permalink: string;
  phone: string;
  lat?: number;
  long?: number;
  category_id: string;
  category_uuid?: string; // UUID della categoria
  destination_id: string;
  destination_uuid?: string; // UUID della destinazione
  active: boolean;
  images: CompanyImage[];
  featured: boolean;
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


/**
 * Recupera gli slug e il breadcrumb per una destinazione.
 *
 * @param destinationId - ID della destinazione corrente.
 * @param lang - Codice della lingua.
 * @returns Un oggetto contenente gli slug e il breadcrumb.
 */
export const getSlugsAndBreadcrumbs = async (destinationId: string, lang: string): Promise<SlugData | null> => {
  try {
    const response = await directusClient.get(`/items/destinations/`, {
      params: {
        filter: {
          id: { _eq: destinationId },
        },
        fields: [
          'type',
          'region_id',
          'province_id', 
          'translations.slug_permalink',
          'region_id.translations.slug_permalink',
          'province_id.translations.slug_permalink',
        ],
        'deep[translations][_filter][languages_code][_eq]': lang,
        'deep[region_id.translations][_filter][languages_code][_eq]': lang,
        'deep[province_id.translations][_filter][languages_code][_eq]': lang,
        limit: 1,
      },
    });

    const destination = response.data.data[0]; // Aggiungi [0] qui per prendere il primo risultato

    if (!destination || !destination.translations || !destination.translations[0]) {
      console.error('Destination or translations not found');
      return null;
    }

    const type = destination.type;
    const currentSlug = destination.translations[0]?.slug_permalink || '';
    let regionSlug = '';
    let provinceSlug = '';
    let municipalitySlug = '';
    let breadcrumb: { label: string; path: string }[] = [];

    // Costruisci gli slug e il breadcrumb in base al tipo
    if (type === 'region') {
      regionSlug = currentSlug;
      breadcrumb = [{ label: regionSlug, path: `/${lang}/${regionSlug}` }];
    } else if (type === 'province') {
      regionSlug = destination.region_id?.translations?.[0]?.slug_permalink || '';
      provinceSlug = currentSlug;

      breadcrumb = [
        { label: regionSlug, path: `/${lang}/${regionSlug}` },
        { label: provinceSlug, path: `/${lang}/${regionSlug}/${provinceSlug}` },
      ];
    } else if (type === 'municipality') {
      regionSlug = destination.region_id?.translations?.[0]?.slug_permalink || '';
      provinceSlug = destination.province_id?.translations?.[0]?.slug_permalink || '';
      municipalitySlug = currentSlug;

      breadcrumb = [
        { label: regionSlug, path: `/${lang}/${regionSlug}` },
        { label: provinceSlug, path: `/${lang}/${regionSlug}/${provinceSlug}` },
        { label: municipalitySlug, path: `/${lang}/${regionSlug}/${provinceSlug}/${municipalitySlug}` },
      ];
    }

    return {
      regionSlug,
      provinceSlug,
      municipalitySlug,
      breadcrumb,
    };
  } catch (error) {
    console.error('Error fetching slugs and breadcrumbs:', error);
    return null;
  }
};
interface GetDestinationsParams {
  type: 'region' | 'province' | 'municipality';
  region_id?: string;
  province_id?: string;
  exclude_id?: string;
  lang: string;
}
class DirectusClient {
  private client: AxiosInstance;

  constructor() {
    // DirectusClient per LETTURA - usa proxy per evitare CORS
    // Le operazioni di SCRITTURA usano API routes dedicate in /api/admin/
    const isBrowser = typeof window !== 'undefined';
    
    let baseURL: string;
    if (isBrowser) {
      baseURL = '/api/directus';
    } else {
      // Server-side: usa l'URL dell'app se disponibile, altrimenti fallback a Directus diretto
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const isBuild = process.env.NODE_ENV === 'production' && !process.env.RAILWAY_ENVIRONMENT_NAME;
      
      if (isBuild) {
        // 🚨 EMERGENCY: NEVER use direct Railway URLs - always use proxy even during build
        baseURL = 'https://thebestitaly.eu/api/directus';
      } else if (appUrl && !appUrl.includes('localhost')) {
        baseURL = appUrl + '/api/directus';
      } else {
        // 🚨 EMERGENCY: For localhost development, still use proxy to prevent Railway costs
        baseURL = 'https://thebestitaly.eu/api/directus';
      }
    }
      
    this.client = axios.create({
      baseURL,
      timeout: 60000, // Aumentato a 60 secondi per connessioni lente
      maxRedirects: 5,
    });
  
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(request => {
      // Add authorization header dynamically on each request
      // Use server-side token if available, otherwise use public token
      const token = process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
      if (token) {
        request.headers['Authorization'] = `Bearer ${token}`;
      }
      request.headers['Content-Type'] = 'application/json';
      
      
      return request;
    });

    this.client.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        console.error('🚨 Directus Error:', error.response?.status, error.response?.statusText || error.message);
        return Promise.reject(error);
      }
    );
  }
  public async get(url: string, config?: object) {
    try {
      const response = await this.client.get(url, config);
      return response;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  }

  public async post(url: string, data?: any, config?: object) {
    try {
      const response = await this.client.post(url, data, config);
      return response;
    } catch (error) {
      console.error('DirectusClient POST error:', error);
      throw error;
    }
  }

  public async put(url: string, data?: any, config?: object) {
    try {
      const response = await this.client.put(url, data, config);
      return response;
    } catch (error) {
      console.error('DirectusClient PUT error:', error);
      throw error;
    }
  }

  public async delete(url: string, config?: object) {
    try {
      const response = await this.client.delete(url, config);
      return response;
    } catch (error) {
      console.error('DirectusClient DELETE error:', error);
      throw error;
    }
  }
  public async testAuth(): Promise<boolean> {
    try {
      await this.client.get('/users/me');
      return true;
    } catch (error) {
      console.error('Auth test failed:', error);
      return false;
    }
  }
  async getCompaniesForListing(lang: string, filters: Record<string, any> = {}, limit?: number) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            ...filters
          },
          fields: [
            'id',
            'website',
            'company_name',
            'slug_permalink',
            'featured_image',
            'phone',
            'category_id',
            'destination_id',
            'featured',
            'active',
            'featured_status',
            'translations.description',
            'translations.seo_title',
            'translations.seo_summary'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          },
          limit: limit !== undefined ? limit : -1, // Usa il limite specificato o tutti i record
          sort: ['-id'] // Ordina per ID decrescente (più recenti prima)
        }
      });

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching companies for listing:', error);
      return [];
    }
  }

  async getCompanies(lang: string, filters: Record<string, any> = {}) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            ...filters
          },
          fields: [
            'id',
            'website',
            'company_name',
            'slug_permalink',
            'featured_image',
            'images',
            'phone',
            'category_id',
            'destination_id',
            'featured',
            'active',
            'featured_status',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
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

  async getHomepageCompanies(lang: string) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            featured_status: { _eq: 'homepage' },
            active: { _eq: true }
          },
          fields: [
            'id',
            'website',
            'company_name',
            'slug_permalink',
            'featured_image',
            'active',
            'featured_status',
            'category_id.id',
            'category_id.translations.name',
            'translations.languages_code',
            'translations.seo_title',
            'translations.seo_summary'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            },
            'category_id.translations': {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          },
          limit: 10,
          sort: ['id']
        }
      });

      // Filtra solo le companies che hanno almeno una traduzione per la lingua richiesta
      return (response.data?.data || []).filter((company: Company) => {
        return company.translations && company.translations.length > 0;
      });
    } catch (error) {
      console.error('Error fetching homepage companies:', error);
      return [];
    }
  }

  async getHomepageArticles(lang: string) {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("[getHomepageArticles] Authentication failed");
        return [];
      }

      const response = await this.client.get('/items/articles', {
        params: {
          filter: {
            featured_status: { _eq: 'homepage' },
            status: { _eq: 'published' }
          },
          fields: [
            'id',
            'image',
            'category_id.translations.nome_categoria',
            'translations.languages_code',
            'translations.titolo_articolo',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          // OTTIMIZZAZIONE: Filtra traduzioni per lingua specifica
          deep: {
            translations: {
              _filter: {
                languages_code: { _eq: lang }
              }
            },
            'category_id.translations': {
              _filter: {
                languages_code: { _eq: lang }
              }
            }
          },
          limit: 4,
          sort: ['-date_created']
        }
      });

      const articles = response.data?.data || [];
      console.log(`[getHomepageArticles] Found ${articles.length} articles for language: ${lang}`);

      // OTTIMIZZAZIONE: Con deep filtering, ogni articolo dovrebbe già avere le traduzioni corrette
      return articles.map((article: any) => {
        const translation = article.translations?.[0];
        const categoryTranslation = article.category_id?.translations?.[0];

        if (!translation) {
          console.warn(`[getHomepageArticles] Missing translation for article ${article.id}, language: ${lang}`);
        }

        return {
          ...article,
          translations: translation ? [translation] : [],
          category_id: article.category_id ? {
            ...article.category_id,
            translations: categoryTranslation ? [categoryTranslation] : []
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching homepage articles:', error);
      return [];
    }
  }

  async getLatestArticlesForHomepage(lang: string) {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("[getLatestArticlesForHomepage] Authentication failed");
        return [];
      }

      const response = await this.client.get('/items/articles', {
        params: {
          filter: {
            featured_status: { _neq: 'homepage' },
            status: { _eq: 'published' },
            category_id: { _neq: 9 }
          },
          fields: [
            'id',
            'image',
            'category_id.translations.nome_categoria',
            'translations.languages_code',
            'translations.titolo_articolo',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          // OTTIMIZZAZIONE: Filtra traduzioni per lingua specifica
          deep: {
            translations: {
              _filter: {
                languages_code: { _eq: lang }
              }
            },
            'category_id.translations': {
              _filter: {
                languages_code: { _eq: lang }
              }
            }
          },
          limit: 15, // Aumento a 15 per compensare eventuali traduzioni mancanti
          sort: ['-date_created']
        }
      });

      const articles = response.data?.data || [];
      console.log(`[getLatestArticlesForHomepage] Found ${articles.length} articles for language: ${lang}`);

      // OTTIMIZZAZIONE: Con deep filtering, ogni articolo dovrebbe già avere le traduzioni corrette  
      const validArticles = articles
        .map((article: any) => {
          const translation = article.translations?.[0];
          const categoryTranslation = article.category_id?.translations?.[0];

          if (!translation) {
            console.warn(`[getLatestArticlesForHomepage] Missing translation for article ${article.id}, language: ${lang}`);
            return null; // Scarta articoli senza traduzione
          }

          return {
            ...article,
            translations: [translation],
            category_id: article.category_id ? {
              ...article.category_id,
              translations: categoryTranslation ? [categoryTranslation] : []
            } : undefined
          };
        })
        .filter(Boolean) // Rimuovi articoli null
        .slice(0, 12); // Prendi solo i primi 12 articoli validi

      console.log(`[getLatestArticlesForHomepage] Returning ${validArticles.length} valid articles out of ${articles.length} fetched`);
      return validArticles;
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  }

  async getCompanyBySlug(slug: string, lang: string) {
    try {
      const filterParam = JSON.stringify({
        slug_permalink: { _eq: slug }
      });
      
      const deepParam = JSON.stringify({
        translations: {
          _filter: {
            languages_code: {
              _eq: lang
            }
          }
        }
      });

      const response = await this.client.get(`/items/companies?filter=${encodeURIComponent(filterParam)}&deep=${encodeURIComponent(deepParam)}&fields=id,featured_image,website,company_name,phone,lat,long,category_id,destination_id,images.id,images.directus_files_id,featured,socials,translations.*`);
      
      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  async getCompanyCategories(lang: string) {
    try {
      const response = await this.client.get('/items/company_categories', {
        params: {
          fields: [
            'id',
            'sort',
            'translations.*'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
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
  public async getArticleBySlug(slug: string, languageCode: string): Promise<Article | null> {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("[getArticleBySlug] Authentication failed");
        return null;
      }

      const filterParam = JSON.stringify({
        'translations': {
          'slug_permalink': {
            '_eq': slug
          }
        }
      });
      
      const deepParam = JSON.stringify({
        'translations': {
          '_filter': {
            'languages_code': { '_eq': languageCode }
          }
        },
        'category_id.translations': {
          '_filter': {
            'languages_code': { '_eq': languageCode }
          }
        }
      });
      
      const fieldsParam = 'id,uuid_id,image,category_id.id,category_id.uuid_id,category_id.translations.nome_categoria,category_id.translations.slug_permalink,destination_id,date_created,translations.languages_code,translations.titolo_articolo,translations.description,translations.seo_summary,translations.slug_permalink';

      const response = await this.client.get(`/items/articles?filter=${encodeURIComponent(filterParam)}&deep=${encodeURIComponent(deepParam)}&fields=${fieldsParam}`);

      const article = response.data?.data?.[0];
      if (!article) return null;

      // Verifica se abbiamo la traduzione nella lingua richiesta
      let translation = article.translations?.[0];
      let categoryTranslation = article.category_id?.translations?.[0];
      
      // FALLBACK: Se non abbiamo traduzione nella lingua richiesta, rifai la query con italiano
      if (!translation && languageCode !== 'it') {
        console.log(`[getArticleBySlug] No translation found for ${languageCode}, trying Italian fallback`);
        
        const fallbackFilterParam = JSON.stringify({
          'translations': {
            'slug_permalink': {
              '_eq': slug
            }
          }
        });
        
        const fallbackDeepParam = JSON.stringify({
          'translations': {
            '_filter': {
              'languages_code': { '_eq': 'it' }
            }
          },
          'category_id.translations': {
            '_filter': {
              'languages_code': { '_eq': 'it' }
            }
          }
        });
        
        const fallbackFieldsParam = 'id,uuid_id,image,category_id.id,category_id.uuid_id,category_id.translations.nome_categoria,category_id.translations.slug_permalink,destination_id,date_created,translations.languages_code,translations.titolo_articolo,translations.description,translations.seo_summary,translations.slug_permalink';

        const fallbackResponse = await this.client.get(`/items/articles?filter=${encodeURIComponent(fallbackFilterParam)}&deep=${encodeURIComponent(fallbackDeepParam)}&fields=${fallbackFieldsParam}`);
        
        const fallbackArticle = fallbackResponse.data?.data?.[0];
        if (fallbackArticle) {
          translation = fallbackArticle.translations?.[0];
          categoryTranslation = fallbackArticle.category_id?.translations?.[0];
          
          return {
            ...fallbackArticle,
            translations: translation ? [translation] : [],
            category_id: fallbackArticle.category_id ? {
              ...fallbackArticle.category_id,
              translations: categoryTranslation ? [categoryTranslation] : []
            } : undefined
          };
        }
      }

      return {
        ...article,
        translations: translation ? [translation] : [],
        category_id: article.category_id ? {
          ...article.category_id,
          translations: categoryTranslation ? [categoryTranslation] : []
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  // NUOVA FUNZIONE: Ottieni articolo tramite UUID (uso pubblico)
  public async getArticleByUUID(uuid: string, languageCode: string): Promise<Article | null> {
    try {
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("[getArticleByUUID] Authentication failed");
        return null;
      }

      const response = await this.client.get('/items/articles', {
        params: {
          'filter': {
            'uuid_id': {
              '_eq': uuid // Usa UUID invece di slug
            }
          },
          'fields': [
            'id',
            'uuid_id',
            'image',
            'category_id.id',
            'category_id.uuid_id',
            'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink',
            'destination_id',
            'date_created',
            'translations.languages_code',
            'translations.titolo_articolo',
            'translations.description',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          // OTTIMIZZAZIONE: Prova prima con la lingua richiesta
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': { '_eq': languageCode }
              }
            },
            'category_id.translations': {
              '_filter': {
                'languages_code': { '_eq': languageCode }
              }
            }
          }
        }
      });

      const article = response.data?.data?.[0];
      if (!article) return null;

      // Verifica se abbiamo la traduzione nella lingua richiesta
      let translation = article.translations?.[0];
      let categoryTranslation = article.category_id?.translations?.[0];
      
      // FALLBACK: Se non abbiamo traduzione nella lingua richiesta, rifai la query con italiano
      if (!translation && languageCode !== 'it') {
        console.log(`[getArticleByUUID] No translation found for ${languageCode}, trying Italian fallback`);
        
        const fallbackResponse = await this.client.get('/items/articles', {
          params: {
            'filter': {
              'uuid_id': {
                '_eq': uuid
              }
            },
            'fields': [
              'id',
              'uuid_id',
              'image',
              'category_id.id',
              'category_id.uuid_id',
              'category_id.translations.nome_categoria',
              'category_id.translations.slug_permalink',
              'destination_id',
              'date_created',
              'translations.languages_code',
              'translations.titolo_articolo',
              'translations.description',
              'translations.seo_summary',
              'translations.slug_permalink'
            ],
            'deep': {
              'translations': {
                '_filter': {
                  'languages_code': { '_eq': 'it' }
                }
              },
              'category_id.translations': {
                '_filter': {
                  'languages_code': { '_eq': 'it' }
                }
              }
            }
          }
        });
        
        const fallbackArticle = fallbackResponse.data?.data?.[0];
        if (fallbackArticle) {
          translation = fallbackArticle.translations?.[0];
          categoryTranslation = fallbackArticle.category_id?.translations?.[0];
          
          return {
            ...fallbackArticle,
            translations: translation ? [translation] : [],
            category_id: fallbackArticle.category_id ? {
              ...fallbackArticle.category_id,
              translations: categoryTranslation ? [categoryTranslation] : []
            } : undefined
          };
        }
      }

      return {
        ...article,
        translations: translation ? [translation] : [],
        category_id: article.category_id ? {
          ...article.category_id,
          translations: categoryTranslation ? [categoryTranslation] : []
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching article by UUID:', error);
      return null;
    }
  }

  public async getCategories(languageCode: string): Promise<Category[]> {
    try {
      const response = await this.client.get('/items/categorias', {
        params: {
          'filter': {
            'visible': {
              '_eq': true
            }
          },
          'fields': [
            'id',
            'nome_categoria',
            'image',
            'visible',
            'translations.nome_categoria',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
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

  public async getDestinationsByType(type: string, languageCode: string): Promise<Destination[]> {
    // Try Redis cache first for menu destinations (server-side only)
    await loadRedisCache();
    
    if (withCache && CacheKeys && CACHE_DURATIONS && type === 'region') {
      return await withCache(
        CacheKeys.menuDestinations(type, languageCode),
        CACHE_DURATIONS.MENU_DESTINATIONS,
        async () => {
          return await this._getDestinationsByTypeDirect(type, languageCode);
        }
      );
    }
    
    // For non-menu destinations, use direct call
    return await this._getDestinationsByTypeDirect(type, languageCode);
  }

  private async _getDestinationsByTypeDirect(type: string, languageCode: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter': {
            'type': {
              '_eq': type
            }
          },
          'fields': [
            'id',
            'type',
            'image',
            'region_id',        // Aggiungi questo
            'province_id',      // E questo se serve
            'translations.destination_name',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          }
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }
  
  public async getArticles(
    languageCode: string,
    offset: number = 0,
    limit: number = 10,
    filters: Record<string, any> = {},
    featuredStatus?: string
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("Authentication failed");
        return { articles: [], total: 0 };
      }
  
      // NUOVA STRATEGIA: Filtra direttamente le traduzioni invece di usare deep
      const params: Record<string, any> = {
        sort: "-date_created",
        fields: [
          "id",
          "image",
          "category_id.id",
          "destination_id",
          "date_created",
          "featured_status"
        ],
        offset: Math.max(offset, 0),
        limit: Math.max(limit, 1),
        meta: 'total_count',
      };

      // Inizializza il filtro con status published (sempre presente)
      params.filter = {
        status: {
          _eq: 'published'
        }
      };

      // Aggiungi filtri opzionali se presenti
      if (Object.keys(filters).length > 0) {
        params.filter = { ...params.filter, ...filters };
      }

      // Aggiungi filtro per featured_status
      if (featuredStatus) {
        params.filter = { ...params.filter, featured_status: { _eq: featuredStatus } };
      }

      // Effettua la chiamata API per gli articoli
      const response = await this.client.get('/items/articles', { params });

      // Estrai articoli e totale dal meta
      const rawArticles = response.data.data || [];
      const total = response.data.meta?.total_count || 0;

      if (rawArticles.length === 0) {
        return { articles: [], total: 0 };
      }

      // OTTIMIZZAZIONE: Ottieni traduzioni separate per lingua specifica
      const articleIds = rawArticles.map((a: any) => a.id);
      
      // Query separata per traduzioni articoli
      const translationsResponse = await this.client.get('/items/articles_translations', {
        params: {
          filter: {
            articles_id: { _in: articleIds },
            languages_code: { _eq: languageCode }
          },
          fields: [
            'articles_id',
            'languages_code',
            'titolo_articolo',
            'seo_summary',
            'slug_permalink'
          ]
        }
      });

      const translations = translationsResponse.data?.data || [];
      const translationsMap = translations.reduce((acc: any, t: any) => {
        acc[t.articles_id] = t;
        return acc;
      }, {});

      // Query separata per categorie e loro traduzioni  
      const allCategoryIds = rawArticles.map((a: any) => a.category_id?.id || a.category_id).filter(Boolean);
      const uniqueCategoryIds = [...new Set(allCategoryIds)];
      let categoryTranslationsMap: any = {};

      if (uniqueCategoryIds.length > 0) {
        
        const categoryTranslationsResponse = await this.client.get('/items/categorias_translations', {
          params: {
            filter: {
              categorias_id: { _in: uniqueCategoryIds },
              languages_code: { _eq: languageCode }
            },
            fields: [
              'categorias_id',
              'languages_code',
              'nome_categoria',
              'slug_permalink'
            ]
          }
        });

        const categoryTranslations = categoryTranslationsResponse.data?.data || [];
        categoryTranslationsMap = categoryTranslations.reduce((acc: any, ct: any) => {
          acc[ct.categorias_id] = ct;
          return acc;
        }, {});
      }



      // Costruisci gli articoli finali
      const articles = rawArticles.map((article: any) => {
        const translation = translationsMap[article.id];
        const categoryTranslation = article.category_id ? categoryTranslationsMap[article.category_id] : null;

        // Se mancano traduzioni per la lingua richiesta, prova fallback italiano
        if (!translation && languageCode !== 'it') {
          console.warn(`[getArticles] Missing translation for article ${article.id}, language: ${languageCode}. Should implement Italian fallback.`);
        }

        return {
          ...article,
          translations: translation ? [translation] : [],
          category_id: article.category_id ? {
            id: article.category_id,
            translations: categoryTranslation ? [categoryTranslation] : []
          } : undefined
        };
      });

      // Filtra solo articoli con traduzioni valide
      const validArticles = articles.filter((article: any) => article.translations.length > 0);

      return { articles: validArticles, total };
    } catch (error: any) {
      console.error("Error fetching articles:", error.message || error);
      return { articles: [], total: 0 };
    }
  }

  // Metodo specifico per la sezione riservata che include tutti gli articoli (draft + published)
  public async getArticlesForReserved(
    languageCode: string,
    offset: number = 0,
    limit: number = 50
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("Authentication failed");
        return { articles: [], total: 0 };
      }
  
      // Parametri base per la richiesta (senza filtro status per includere draft)
      const params: Record<string, any> = {
        sort: "-date_created",
        fields: [
          "id",
          "status", // Includiamo il campo status
          "image",
          "category_id.id",
          "category_id.translations.languages_code",
          "category_id.translations.nome_categoria",
          "category_id.translations.slug_permalink",
          "destination_id",
          "date_created",
          "date_updated",
          "featured_status",
          "translations.languages_code",
          "translations.titolo_articolo",
          "translations.seo_summary",
          "translations.slug_permalink",
        ],
        offset: Math.max(offset, 0),
        limit: Math.max(limit, 1),
        meta: 'total_count',
      };

      // Effettua la chiamata API senza filtro status per includere tutti gli articoli
      const response = await this.client.get('/items/articles', { params });

      // Estrai articoli e totale dal meta
      const rawArticles = response.data.data || [];
      const total = response.data.meta?.total_count || 0;

      // Implementa fallback in italiano per ogni articolo
      const articles = rawArticles.map((article: any) => {
        // Trova la traduzione nella lingua richiesta
        let translation = article.translations?.find((t: any) => t.languages_code === languageCode);
        
        // Se non esiste, usa il fallback italiano
        if (!translation) {
          translation = article.translations?.find((t: any) => t.languages_code === 'it');
        }
        
        // Trova la traduzione della categoria nella lingua richiesta
        let categoryTranslation = article.category_id?.translations?.find((t: any) => t.languages_code === languageCode);
        
        // Se non esiste, usa il fallback italiano per la categoria
        if (!categoryTranslation) {
          categoryTranslation = article.category_id?.translations?.find((t: any) => t.languages_code === 'it');
        }

        return {
          ...article,
          translations: translation ? [translation] : [],
          category_id: article.category_id ? {
            ...article.category_id,
            translations: categoryTranslation ? [categoryTranslation] : []
          } : undefined
        };
      });

      return { articles, total };
    } catch (error: any) {
      console.error("Error fetching articles for reserved:", error.message || error);
      return { articles: [], total: 0 };
    }
  }

  public async getDestinationBySlug(slug: string, languageCode: string): Promise<Destination | null> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[translations][slug_permalink][_eq]': slug,
          'fields[]': [
            'id',
            'type',
            'region_id',
            'province_id',
            'image',
            'lat',
            'long',
            'translations.destination_name',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.description',
            'translations.slug_permalink',
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'limit': 1,
        },
      });
  
      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching destination:', error);
      return null;
    }
  }
  public async getDestinations({
    type,
    region_id,
    province_id,
    exclude_id,
    lang,
  }: {
    type: string;
    region_id?: string | number | { id: string | number };
    province_id?: string | number | { id: string | number };
    exclude_id?: string | number;
    lang: string;
  }): Promise<Destination[]> {
    // Try Redis cache first (server-side only)
    await loadRedisCache();
    
    if (withCache && CacheKeys && CACHE_DURATIONS) {
      // Create a unique cache key based on parameters
      const regionIdStr = typeof region_id === 'object' ? region_id?.id?.toString() : region_id?.toString();
      const provinceIdStr = typeof province_id === 'object' ? province_id?.id?.toString() : province_id?.toString();
      const cacheKey = `destinations:${type}:r${regionIdStr || 'none'}:p${provinceIdStr || 'none'}:ex${exclude_id || 'none'}:${lang}`;
      
      return await withCache(
        cacheKey,
        CACHE_DURATIONS.RELATED_DESTINATIONS,
        async () => {
          return await this._getDestinationsDirect({
            type,
            region_id,
            province_id,
            exclude_id,
            lang,
          });
        }
      );
    }
    
    // Fallback to direct call
    return await this._getDestinationsDirect({
      type,
      region_id,
      province_id,
      exclude_id,
      lang,
    });
  }

  private async _getDestinationsDirect({
    type,
    region_id,
    province_id,
    exclude_id,
    lang,
  }: {
    type: string;
    region_id?: string | number | { id: string | number };
    province_id?: string | number | { id: string | number };
    exclude_id?: string | number;
    lang: string;
  }): Promise<Destination[]> {
    try {
      const filterParams: Record<string, any> = {
        'filter[type][_eq]': type,
      };
  
      // Estrai l'ID se viene passato un oggetto
      if (region_id) {
        const regionIdValue = typeof region_id === 'object' && region_id.id ? region_id.id : region_id;
        filterParams['filter[region_id][_eq]'] = regionIdValue;
      }
      if (province_id) {
        const provinceIdValue = typeof province_id === 'object' && province_id.id ? province_id.id : province_id;
        filterParams['filter[province_id][_eq]'] = provinceIdValue;
      }
      if (exclude_id) filterParams['filter[id][_neq]'] = exclude_id;
  
      const response = await this.client.get('/items/destinations', {
        params: {
          ...filterParams,
          'fields[]': [
            'id',
            'type',
            'image',
            'region_id',
            'province_id',
            'translations.destination_name',
            'translations.seo_summary',
            'translations.slug_permalink',
          ],
          'deep[translations][_filter][languages_code][_eq]': lang,
          limit: -1, // Ottieni tutti i record
        },
      });
  
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }
  // Siblings: Destinations sharing the same `parent_Id` as the current destination
  public async getDestinationsBySiblingId(id: string, lang: string, province_id: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[province_id][_eq]': province_id,
          'filter[id][_neq]': id,
          'fields[]': [
            'id',
            'type',
            'image',
            'province_id',
            'parent.translations.slug_permalink',
            'parent.parent.translations.slug_permalink',
            'translations.*',
          ],
          'deep[translations][_filter][languages_code][_eq]': lang,
        },
      });

      if (!response.data.data) {
        console.error('No sibling destinations found');
        return [];
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching sibling destinations:', error);
      return [];
    }
  }
  // Children: Destinations where the `parent_Id` matches the current destination's `id`
  public async getDestinationsByParentId(province_id: string, languageCode: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[province_id][_eq]': province_id,
          'fields[]': [
            'id',
            'type',
            'image',
            'province_id',
            'region_id',
            'translations.destination_name',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
        }
      });
  
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations by parent:', error);
      return [];
    }
  }
  public async getDestinationById(id: string, languageCode: string): Promise<Destination | null> {
    // Try Redis cache first (server-side only)
    await loadRedisCache();
    
    if (withCache && CacheKeys && CACHE_DURATIONS) {
      return await withCache(
        CacheKeys.destination(id, languageCode),
        CACHE_DURATIONS.DESTINATIONS,
        async () => {
          return await this._getDestinationByIdDirect(id, languageCode);
        }
      );
    }
    
    // Fallback to direct call
    return await this._getDestinationByIdDirect(id, languageCode);
  }

  private async _getDestinationByIdDirect(id: string, languageCode: string): Promise<Destination | null> {
    try {
      // 🚀 SINGLE QUERY with deep relations instead of 3 separate queries
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[id][_eq]': id,
          'fields[]': [
            'id',
            'type',
            'image',
            'region_id.id',
            'region_id.translations.destination_name',
            'region_id.translations.slug_permalink',
            'province_id.id', 
            'province_id.translations.destination_name',
            'province_id.translations.slug_permalink',
            'translations.destination_name',
            'translations.slug_permalink',
            'translations.seo_title',
            'translations.seo_summary'
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'deep[region_id.translations][_filter][languages_code][_eq]': languageCode,
          'deep[province_id.translations][_filter][languages_code][_eq]': languageCode,
          'limit': 1
        },
      });

      const destination = response.data?.data[0];
      if (!destination) return null;

      // 🚀 Data already filtered by language thanks to deep filtering
      return destination;
    } catch (error) {
      console.error('Error fetching destination by ID:', error);
      return null;
    }
  }

  // NUOVA FUNZIONE: Ottieni destinazione tramite UUID (uso pubblico) - Query super ottimizzata
  public async getDestinationByUUID(uuid: string, languageCode: string): Promise<Destination | null> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[uuid_id][_eq]': uuid,
          'fields[]': [
            'id',
            'uuid_id', 
            'type',
            'image',
            'region_id',
            'region_id.uuid_id',
            'region_id.image',
            'region_id.translations.slug_permalink',
            'region_id.translations.destination_name',
            'region_id.translations.languages_code',
            'province_id',
            'province_id.uuid_id', 
            'province_id.image',
            'province_id.translations.slug_permalink',
            'province_id.translations.destination_name',
            'province_id.translations.languages_code',
            'translations.slug_permalink',
            'translations.destination_name',
            'translations.seo_summary',
            'translations.languages_code'
          ],
          'deep[translations][_filter][languages_code][_in]': `${languageCode},it`,
          'deep[region_id.translations][_filter][languages_code][_in]': `${languageCode},it`,
          'deep[province_id.translations][_filter][languages_code][_in]': `${languageCode},it`
        },
      });

      const destination = response.data?.data[0];
      if (!destination) return null;

      // Applica fallback in italiano per le traduzioni principali
      let translation = destination.translations?.find((t: any) => t.languages_code === languageCode);
      if (!translation) {
        translation = destination.translations?.find((t: any) => t.languages_code === 'it');
      }

      // Applica fallback per regione e provincia (stesso codice)
      if (destination.region_id?.translations) {
        let regionTranslation = destination.region_id.translations.find((t: any) => t.languages_code === languageCode);
        if (!regionTranslation) {
          regionTranslation = destination.region_id.translations.find((t: any) => t.languages_code === 'it');
        }
        destination.region_id.translations = regionTranslation ? [regionTranslation] : [];
      }

      if (destination.province_id?.translations) {
        let provinceTranslation = destination.province_id.translations.find((t: any) => t.languages_code === languageCode);
        if (!provinceTranslation) {
          provinceTranslation = destination.province_id.translations.find((t: any) => t.languages_code === 'it');
        }
        destination.province_id.translations = provinceTranslation ? [provinceTranslation] : [];
      }

      destination.translations = translation ? [translation] : [];
      return destination;
    } catch (error) {
      console.error('Error fetching destination by UUID:', error);
      return null;
    }
  }
  public async getArticlesByCategory(
    categorySlug: string, 
    languageCode: string, 
    limit: number = 10 // Limite di default
  ): Promise<Article[]> {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("[getArticlesByCategory] Authentication failed");
        return [];
      }

      // Prima ottieni l'ID della categoria dal slug usando il nome corretto della collection
      const categoryResponse = await this.client.get('/items/categorias', {
        params: {
          'filter': {
            'translations': {
              'slug_permalink': {
                '_eq': categorySlug
              }
            }
          },
          'fields': ['id'],
          'limit': 1
        }
      });

      const category = categoryResponse.data?.data?.[0];
      if (!category) {
        console.log(`[getArticlesByCategory] Category not found for slug: ${categorySlug}`);
        return [];
      }

      // NUOVA STRATEGIA: Query separata per articoli e traduzioni
      const response = await this.client.get('/items/articles', {
        params: {
          'filter': {
            'status': {
              '_eq': 'published'
            },
            'category_id': {
              '_eq': category.id
            }
          },
          'fields': [
            'id',
            'image',
            'category_id'
          ],
          'sort': ['-date_created'],
          'limit': Math.min(limit, 50) // Massimo 50 articoli per performance
        }
      });
  
      const articles = response.data?.data || [];
      
      if (articles.length === 0) {
        return [];
      }

      // Query separata per traduzioni nella lingua specifica
      const articleIds = articles.map((a: any) => a.id);
      
      const translationsResponse = await this.client.get('/items/articles_translations', {
        params: {
          filter: {
            articles_id: { _in: articleIds },
            languages_code: { _eq: languageCode }
          },
          fields: [
            'articles_id',
            'languages_code',
            'titolo_articolo',
            'seo_summary',
            'slug_permalink'
          ]
        }
      });

      const translations = translationsResponse.data?.data || [];
      const translationsMap = translations.reduce((acc: any, t: any) => {
        acc[t.articles_id] = t;
        return acc;
      }, {});

      // Query per traduzione della categoria
      const categoryTranslationResponse = await this.client.get('/items/categorias_translations', {
        params: {
          filter: {
            categorias_id: { _eq: category.id },
            languages_code: { _eq: languageCode }
          },
          fields: [
            'categorias_id',
            'languages_code',
            'nome_categoria',
            'slug_permalink'
          ]
        }
      });

      const categoryTranslation = categoryTranslationResponse.data?.data?.[0];

      console.log(`[getArticlesByCategory] Found ${articles.length} articles for category: ${categorySlug}, ${translations.length} ${languageCode} translations`);

      // Costruisci gli articoli finali con solo le traduzioni nella lingua corrente
      const finalArticles = articles.map((article: any) => {
        const translation = translationsMap[article.id];
        
        if (!translation && languageCode !== 'it') {
          console.warn(`[getArticlesByCategory] Missing translation for article ${article.id}, language: ${languageCode}`);
        }

        return {
          ...article,
          translations: translation ? [translation] : [],
          category_id: {
            id: category.id,
            translations: categoryTranslation ? [categoryTranslation] : []
          }
        };
      });

      // Filtra solo articoli con traduzioni valide
      const validArticles = finalArticles.filter((article: any) => article.translations.length > 0);

      return validArticles;
      
    } catch (error) {
      console.error('[getArticlesByCategory] Error:', error);
      return [];
    }
  }
  
  private processDestinations(data: any[], searchLower: string, languageCode: string) {
    return data.map((d: any) => {
      let score = this.computeDestinationScore(d, searchLower);
  
      const regionName = d.region_id?.translations?.[0]?.destination_name?.toLowerCase();
      const provinceName = d.province_id?.translations?.[0]?.destination_name?.toLowerCase();
  
      if (regionName === searchLower) score += 10;
      if (provinceName === searchLower) score += 10;
      if (regionName?.includes(searchLower) || provinceName?.includes(searchLower)) score += 5; // Optional Chaining per evitare errori
  
      if (!d.translations?.[0]) return { ...d, score, link: '#' };
  
      let link = '#'; // Valore di default per semplificare la logica
      const slug = d.translations[0].slug_permalink;
      const regionSlug = d.region_id?.translations?.[0]?.slug_permalink;
      const provinceSlug = d.province_id?.translations?.[0]?.slug_permalink;
  
      switch (d.type) {
          case 'region': link = `/${languageCode}/${slug}/`; break;
          case 'province': if (regionSlug) link = `/${languageCode}/${regionSlug}/${slug}/`; break;
          case 'municipality': if (provinceSlug) link = `/${languageCode}/${provinceSlug}/${slug}/`; break;
      }
  
      return { ...d, score, link };
    })
    .filter((d: any) => d.score > 0 && d.link !== '#')
    .sort((a: any, b: any) => b.score - a.score);
  }
  
  private processArticles(data: any[], searchLower: string, languageCode: string) {
    return data.map((a: any) => ({
      ...a,
      score: this.computeArticleScore(a, searchLower),
      link: a.translations?.[0]?.slug_permalink ? `/${languageCode}/magazine/${a.translations[0].slug_permalink}/` : '#' // Condizione ternaria per evitare errori se slug_permalink non esiste
    }))
    .filter((a: any) => a.score > 0)
    .sort((a: any, b: any) => b.score - a.score);
  }
  
  private computeDestinationScore(item: any, searchLower: string): number {
    let score = 0;
    const translation = item.translations?.[0];
    if (!translation) return score;
  
    const titleLower = translation.destination_name?.toLowerCase() || '';
    const summaryLower = translation.seo_summary?.toLowerCase() || '';
    const descLower = translation.description?.toLowerCase() || '';
  
    if (titleLower.includes(searchLower)) score += 10;
    if (summaryLower.includes(searchLower)) score += 5;
    if (descLower.includes(searchLower)) score += 2;
  
    if (titleLower === searchLower) score += 15;
    if (titleLower.startsWith(searchLower)) score += 5;
  
    return score;
  }
  
  private computeArticleScore(item: any, searchLower: string): number {
      let score = 0;
      const translation = item.translations?.[0];
      if (!translation) return score;
    
      const titleLower = translation.titolo_articolo?.toLowerCase() || '';
      const summaryLower = translation.seo_summary?.toLowerCase() || '';
      const descLower = translation.description?.toLowerCase() || '';
    
      if (titleLower.includes(searchLower)) score += 10;
      if (summaryLower.includes(searchLower)) score += 5;
      if (descLower.includes(searchLower)) score += 2;
    
      if (titleLower === searchLower) score += 15;
      if (titleLower.startsWith(searchLower)) score += 5;
    
      return score;
  }

  async getDestinationsByRegionId(regionId: string, lang: string) {
    try {
      const response = await this.get('/items/destinations', {
        params: {
          filter: {
            region_id: { _eq: regionId }
          },
          fields: [
            'id',
            'type',
            'image',
            'province_id',
            'region_id',
            'translations.*'
          ],
          lang
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching destinations by region:', error);
      return [];
    }
  }

  async getDestinationsByProvinceId(provinceId: string, lang: string) {
    try {
      const response = await this.get('/items/destinations', {
        params: {
          filter: {
            province_id: { _eq: provinceId }
          },
          fields: [
            'id',
            'type',
            'image',
            'province_id',
            'region_id',
            'translations.*'
          ],
          lang
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching destinations by province:', error);
      return [];
    }
  }

  async getCompanyFiles(companyId: string) {
    try {
      const response = await this.client.get('/items/companies_files', {
        params: {
          filter: { companies_id: { _eq: companyId } },
          fields: ['directus_files_id'],
        },
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching company files:', error);
      return [];
    }
  }

  async getCompaniesByDestination(destinationId: string, lang: string, destinationType: 'region' | 'province' | 'municipality') {
    try {
      // Validazione destinationId
      if (!destinationId || typeof destinationId !== 'string') {
        console.error('❌ Invalid destinationId:', destinationId);
        return [];
      }

      const filter: any = { active: { _eq: true } };
      
      if (destinationType === 'region') {
        // Per le regioni, dobbiamo prendere tutte le companies delle province di quella regione
        // Prima otteniamo tutte le province di questa regione
        const provincesResponse = await this.client.get('/items/destinations', {
          params: {
            filter: {
              region_id: { _eq: destinationId },
              type: { _eq: 'province' }
            },
            fields: ['id']
          }
        });
        
        const provinceIds = provincesResponse.data?.data?.map((p: any) => p.id) || [];
        
        if (provinceIds.length > 0) {
          filter.destination_id = { _in: provinceIds };
        } else {
          // Se non ci sono province, non ci sono companies
          return [];
        }
      } else {
        // Per province e municipality, usiamo direttamente l'ID
        filter.destination_id = { _eq: destinationId };
      }

      const response = await this.client.get('/items/companies', {
        params: {
          filter,
          fields: [
            'id',
            'website',
            'company_name',
            'slug_permalink',
            'featured_image',
            'phone',
            'category_id',
            'destination_id',
            'socials',
            'translations.*'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          },
          sort: ['company_name'],
          limit: 100
        }
      });

      return response.data?.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching companies by destination:', error.response?.status, error.response?.data || error.message);
      return [];
    }
  }

  public async getFeaturedDestinations(languageCode: string): Promise<Destination[]> {
    try {
      // For now, we'll get the first 5 regions as featured destinations
      // In the future, we can add a 'featured' field to the destinations table
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter': {
            'type': {
              '_eq': 'region'
            }
          },
          'fields': [
            'id',
            'type',
            'image',
            'region_id',
            'province_id',
            'translations.destination_name',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          },
          'limit': 5,
          'sort': ['id'] // You can change this to sort by a field when available
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching featured destinations:', error);
      return [];
    }
  }

  public async getHomepageDestinations(languageCode: string): Promise<Destination[]> {
    try {
      let response = await this.client.get('/items/destinations', {
        params: {
          'filter': {
            'featured_status': {
              '_eq': 'homepage'
            }
          },
          'fields': [
            'id',
            'type',
            'image',
            'region_id',
            'province_id',
            'featured_status',
            'translations.destination_name',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          },
          'limit': 10,
          'sort': ['featured_sort', 'id']
        }
      });

      // If no results with lowercase, try uppercase
      if (!response.data.data?.length) {
        response = await this.client.get('/items/destinations', {
          params: {
            'filter': {
              'featured_status': {
                '_eq': 'homepage'
              }
            },
            'fields': [
              'id',
              'type',
              'image',
              'region_id',
              'province_id',
              'featured_status',
              'translations.destination_name',
              'translations.seo_title',
              'translations.seo_summary',
              'translations.slug_permalink'
            ],
            'deep': {
              'translations': {
                '_filter': {
                  'languages_code': {
                    '_eq': languageCode
                  }
                }
              }
            },
            'limit': 10,
            'sort': ['id']
          }
        });
      }

      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching homepage destinations:', error);
      return [];
    }
  }

  // Metodi semplici per sitemap - solo URLs essenziali
  public async getDestinationsForSitemap(lang: string): Promise<Array<{slug_permalink: string, type: string}>> {
    try {
      // Query molto semplice per evitare errori 500
      const response = await this.client.get('/items/destinations', {
        params: {
          'fields': ['type', 'translations.*'],
          'limit': 200
        }
      });

      const destinations = response.data?.data || [];
      console.log(`Raw destinations data:`, destinations.length);
      
      // Filtra manualmente per lingua e mappa i risultati
      const filtered = destinations
        .map((dest: any) => {
          // Trova la traduzione per la lingua corrente
          const translation = dest.translations?.find((t: any) => t.languages_code === lang);
          if (translation?.slug_permalink && dest.type) {
            return {
              slug_permalink: translation.slug_permalink,
              type: dest.type
            };
          }
          return null;
        })
        .filter(Boolean);
      
      console.log(`Filtered destinations for ${lang}:`, filtered.length);
      return filtered;
        
    } catch (error) {
      console.error('Error fetching destinations for sitemap:', error);
      // Proviamo con una query ancora più semplice
      try {
        console.log('Trying simpler destinations query...');
        const simpleResponse = await this.client.get('/items/destinations', {
          params: {
            'limit': 50
          }
        });
        console.log('Simple query worked, destinations available:', simpleResponse.data?.data?.length || 0);
        return [];
      } catch (simpleError) {
        console.error('Even simple destinations query failed:', simpleError);
        return [];
      }
    }
  }

  public async getCompaniesForSitemap(): Promise<Array<{slug_permalink: string}>> {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          'filter': { 'active': { '_eq': true } },
          'fields': ['slug_permalink'],
          'limit': 1000
        }
      });

      const companies = response.data?.data || [];
      
      return companies
        .map((company: any) => ({
          slug_permalink: company.slug_permalink
        }))
        .filter((company: any) => company.slug_permalink);
        
    } catch (error) {
      console.error('Error fetching companies for sitemap:', error);
      return [];
    }
  }

  public async getArticlesForSitemap(lang: string): Promise<Array<{slug_permalink: string, date_created?: string}>> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          'filter': { 'status': { '_eq': 'published' } },
          'fields': ['date_created', 'translations.slug_permalink'],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': { '_eq': lang }
              }
            }
          },
          'limit': 500,
          'sort': ['-date_created']
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

  public async getCategoriesForSitemap(lang: string): Promise<Array<{slug_permalink: string}>> {
    try {
      const response = await this.client.get('/items/categorias', {
        params: {
          'filter': { 'visible': { '_eq': true } },
          'fields': ['translations.slug_permalink'],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': { '_eq': lang }
              }
            }
          },
          'limit': 100
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
}
// Assicurati che non sia dentro un blocco come una funzione o un'istruzione condizionale



export const fetchArticleBySlug = async (slug: string, languageCode: string) => {
  if (!slug || !languageCode) {
    console.error('Error: Missing slug or language code');
    return null;
  }

  try {
    const response = await directusClient.get('/items/articles', {
      params: {
        'filter[translations][slug_permalink][_eq]': slug,
        'fields[]': [
          'id',
          'image',
          'category_id.id',
          'category_id.translations.nome_categoria',
          'date_created',
          'translations.titolo_articolo',
          'translations.description',
          'translations.seo_summary',
          'translations.slug_permalink',
        ],
        'deep[translations][_filter][languages_code][_eq]': languageCode,
        'deep[category.translations][_filter][languages_code][_eq]': languageCode,
      },
    });

    return response.data?.data[0] || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};


const directusClient = new DirectusClient();
export default directusClient;

// Add interface for hreflang data
interface HreflangData {
  [lang: string]: string;
}

/**
 * Get multilingual slugs for destinations (for hreflang)
 */
export const getDestinationHreflang = async (destinationId: string): Promise<HreflangData> => {
  try {
    const response = await directusClient.get(`/items/destinations/${destinationId}`, {
      params: {
        fields: [
          'id',
          'type',
          'region_id',
          'province_id',
          'translations.languages_code',
          'translations.slug_permalink',
          'region_id.translations.languages_code',
          'region_id.translations.slug_permalink',
          'province_id.translations.languages_code',
          'province_id.translations.slug_permalink',
        ],
      },
    });

    const destination = response.data.data;
    if (!destination || !destination.translations) {
      return {};
    }

    const hreflangs: HreflangData = {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';

    destination.translations.forEach((translation: any) => {
      const lang = translation.languages_code;
      const slug = translation.slug_permalink;
      
      if (!lang || !slug) return;

      let path = '';
      
      if (destination.type === 'region') {
        path = `/${lang}/${slug}`;
      } else if (destination.type === 'province') {
        const regionTranslation = destination.region_id?.translations?.find(
          (t: any) => t.languages_code === lang
        );
        if (regionTranslation?.slug_permalink) {
          path = `/${lang}/${regionTranslation.slug_permalink}/${slug}`;
        }
      } else if (destination.type === 'municipality') {
        const regionTranslation = destination.region_id?.translations?.find(
          (t: any) => t.languages_code === lang
        );
        const provinceTranslation = destination.province_id?.translations?.find(
          (t: any) => t.languages_code === lang
        );
        if (regionTranslation?.slug_permalink && provinceTranslation?.slug_permalink) {
          path = `/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${slug}`;
        }
      }

      if (path) {
        hreflangs[lang] = `${baseUrl}${path}`;
      }
    });

    return hreflangs;
  } catch (error) {
    console.error('Error fetching destination hreflang:', error);
    return {};
  }
};

/**
 * Get multilingual slugs for articles (for hreflang)
 */
export const getArticleHreflang = async (articleId: string): Promise<HreflangData> => {
  try {
    const response = await directusClient.get(`/items/articles/${articleId}`, {
      params: {
        fields: [
          'id',
          'translations.languages_code',
          'translations.slug_permalink',
        ],
      },
    });

    const article = response.data.data;
    if (!article || !article.translations) {
      return {};
    }

    const hreflangs: HreflangData = {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';

    article.translations.forEach((translation: any) => {
      const lang = translation.languages_code;
      const slug = translation.slug_permalink;
      
      if (lang && slug) {
        hreflangs[lang] = `${baseUrl}/${lang}/magazine/${slug}`;
      }
    });

    return hreflangs;
  } catch (error) {
    console.error('Error fetching article hreflang:', error);
    return {};
  }
};

/**
 * Get multilingual slugs for companies/POI (for hreflang)
 */
export const getCompanyHreflang = async (companyId: string): Promise<HreflangData> => {
  try {
    const response = await directusClient.get(`/items/companies/${companyId}`, {
      params: {
        fields: [
          'id',
          'slug_permalink',
        ],
      },
    });

    const company = response.data.data;
    if (!company || !company.slug_permalink) {
      return {};
    }

    const hreflangs: HreflangData = {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
    
    // For companies, the slug is the same across all languages
    // Only the content language changes
    const supportedLangs = ['it', 'en', 'fr', 'de', 'es'];
    
    supportedLangs.forEach(lang => {
      hreflangs[lang] = `${baseUrl}/${lang}/poi/${company.slug_permalink}`;
    });

    return hreflangs;
  } catch (error) {
    console.error('Error fetching company hreflang:', error);
    return {};
  }
};

/**
 * Get all supported languages from database
 */
export const getSupportedLanguages = async (): Promise<string[]> => {
  try {
    const response = await directusClient.get('/items/languages', {
      params: {
        fields: ['code'],
        sort: ['code']
      }
    });

    const languages = response.data?.data || [];
    return languages.map((lang: any) => lang.code).filter(Boolean);
  } catch (error) {
    // Silently fallback to known languages if languages collection is not accessible
    // This is expected behavior when using read-only tokens
    return ['it', 'en', 'fr', 'de', 'es'];
  }
};

/**
 * Get page titles and content from the titles collection
 * @param titleId - The ID of the title record (1=homepage, 2=experience, 3=eccellenze, etc.)
 * @param lang - Language code
 */
export const getPageTitles = async (titleId: string, lang: string): Promise<{
  title?: string;
  seo_title?: string;
  seo_summary?: string;
} | null> => {
  try {
    const response = await directusClient.get(`/items/titles/${titleId}`, {
      params: {
        fields: [
          'translations.title',
          'translations.seo_title', 
          'translations.seo_summary'
        ],
        deep: {
          translations: {
            _filter: {
              languages_code: { _eq: lang }
            }
          }
        }
      }
    });

    const titleData = response.data?.data;
    const translation = titleData?.translations?.[0];
    
    if (translation) {
      return {
        title: translation.title,
        seo_title: translation.seo_title,
        seo_summary: translation.seo_summary
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`Could not fetch titles from database for ID ${titleId}, lang ${lang}:`, error);
    return null;
  }
};