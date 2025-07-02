import axios, { AxiosInstance } from 'axios';
import { getOptimizedImageUrl } from "./imageUtils";
import { getProvincesForRegion, getMunicipalitiesForProvince, getDestinationDetails } from './static-destinations';
// Rimosse le importazioni di redis-cache che causavano errori
// import { redis, getCacheKey } from './redis-cache';

// Interfaces
export interface Translation {
  languages_code: string;
  destination_name?: string;
  seo_title?: string;
  seo_summary?: string;
  description?: string;
  slug_permalink?: string;
}

// No cache imports needed - cache handled at Redis layer

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
  featured_image?: string; // Immagine in evidenza
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
        limit: 30,
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

interface DirectusTranslation {
  languages_code: string;
  destination_name?: string;
  seo_title?: string;
  seo_summary?: string;
  description?: string;
  slug_permalink?: string;
  status: string;
  [key: string]: any;
};

// Definizione del tipo per un elemento di Directus (articolo, destinazione, etc.)
export type DirectusItem = {
  id: string;
  type: 'region' | 'province' | 'municipality';
  slug?: string;
  image?: string;
  lat?: number;
  long?: number;
  translations?: DirectusTranslation[];
  hreflang_new?: any;
  parent?: {
    id: string;
    translations: {
      slug_permalink: string;
    }[];
  } | null;
  [key: string]: any;
};

class DirectusClient {
  private client: AxiosInstance;
  private static activeCalls = 0;
  private static readonly MAX_CONCURRENT_CALLS = 50; // 🎯 Aumentato per coesistenza script/navigazione
  private static readonly REQUEST_TIMEOUT = 120000; // 🎯 Aumentato a 2 minuti per generazione statica

  constructor(lang?: string) {
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_DIRECTUS_URL environment variable is not set');
    }

    this.client = axios.create({
      baseURL,
      timeout: DirectusClient.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        DirectusClient.activeCalls++;
        
        // Rate limiting - se troppo traffico aspetta
        if (DirectusClient.activeCalls > DirectusClient.MAX_CONCURRENT_CALLS) {
          console.warn(`⚠️  [DirectusClient] Rate limiting: ${DirectusClient.activeCalls} active calls`);
        }

        // 📊 Logging delle chiamate per debug
        const url = config.url || '';
        const params = config.params ? Object.keys(config.params).length : 0;
        console.log(`📖 Directus API: ${config.method?.toUpperCase()} ${url} (${params} params, ${DirectusClient.activeCalls} active)`);

        return config;
      },
      (error) => {
        DirectusClient.activeCalls--;
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        DirectusClient.activeCalls--;
        
        // 🎯 Simple logging for successful responses
        console.log(`✅ [DirectusClient] Response successful for ${response.config.url}`);

        return response;
      },
      (error) => {
        DirectusClient.activeCalls--;
        
        // 📊 Log degli errori per debug
        const status = error.response?.status;
        const url = error.config?.url || 'unknown';
        console.error(`❌ [DirectusClient] Error ${status}: ${url}`, {
          message: error.message,
          status,
          data: error.response?.data
        });

        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      console.error('❌ [DirectusClient] Request failed:', error.message);
      throw error;
    }
  }

  public async get(url: string, config?: object) {
    return this.makeRequest(async () => {
      try {
        const response = await this.client.get(url, config);
        return response;
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
      }
    });
  }

  public async post(url: string, data?: any, config?: object) {
    return this.makeRequest(async () => {
      try {
        const response = await this.client.post(url, data, config);
        return response;
      } catch (error) {
        console.error('DirectusClient POST error:', error);
        throw error;
      }
    });
  }

  public async put(url: string, data?: any, config?: object) {
    return this.makeRequest(async () => {
      try {
        const response = await this.client.put(url, data, config);
        return response;
      } catch (error) {
        console.error('DirectusClient PUT error:', error);
        throw error;
      }
    });
  }

  public async delete(url: string, config?: object) {
    return this.makeRequest(async () => {
      try {
        const response = await this.client.delete(url, config);
        return response;
      } catch (error) {
        console.error('DirectusClient DELETE error:', error);
        throw error;
      }
    });
  }

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
      // 🚨 TEMPORANEAMENTE BYPASSATO per test timeout
      // const isAuth = await this.testAuth();
      // if (!isAuth) {
      //   console.error("[getHomepageArticles] Authentication failed");
      //   return [];
      // }

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
      // 🚨 TEMPORANEAMENTE BYPASSATO per test timeout
      // const isAuth = await this.testAuth();
      // if (!isAuth) {
      //   console.error("[getLatestArticlesForHomepage] Authentication failed");
      //   return [];
      // }

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
      // 🚨 TEMPORANEAMENTE BYPASSATO per test timeout
      // const isAuth = await this.testAuth();
      // if (!isAuth) {
      //   console.error("[getArticleBySlug] Authentication failed");
      //   return null;
      // }

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
      // 🚨 TEMPORANEAMENTE BYPASSATO per test timeout
      // const isAuth = await this.testAuth();
      // if (!isAuth) {
      //   console.error("[getArticleByUUID] Authentication failed");
      //   return null;
      // }

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

  public async getDestinationsByType(type: 'region' | 'province' | 'municipality', languageCode: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[type][_eq]': type,
          'fields[]': [
            'id', 
            'uuid_id', 
            'type', 
            'image',
            // 🚀 ESSENZIALE: Slug delle regioni parent per URL gerarchici
            'region_id.id',
            'region_id.uuid_id', 
            'region_id.translations.destination_name',
            'region_id.translations.slug_permalink',
            'region_id.translations.languages_code',
            // 🚀 ESSENZIALE: Slug delle province parent per URL gerarchici
            'province_id.id',
            'province_id.uuid_id',
            'province_id.translations.destination_name', 
            'province_id.translations.slug_permalink',
            'province_id.translations.languages_code',
            // Campi principali della destinazione
            'translations.destination_name',
            'translations.slug_permalink',
            'translations.languages_code'
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'sort[]': 'id',
          'limit': type === 'municipality' ? 50 : 100 // Limit per municipi
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching ${type} destinations:`, error.message);
      return this._getDestinationsByTypeDirect(type, languageCode);
    }
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
  
  // 🚀 FUNZIONE OTTIMIZZATA per sidebar - Single query, no meta count + Redis cache
  public async getArticlesForSidebar(
    languageCode: string,
    filters: Record<string, any> = {},
    limit: number = 10
  ): Promise<Article[]> {
    try {
      // Direct call - cache managed at Redis layer
      return await this._getArticlesForSidebarDirect(languageCode, filters, limit);

    } catch (error: any) {
      console.error("Error fetching articles for sidebar:", error.message || error);
      return [];
    }
  }

  private async _getArticlesForSidebarDirect(
    languageCode: string,
    filters: Record<string, any> = {},
    limit: number = 10
  ): Promise<Article[]> {
    try {
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("Authentication failed");
        return [];
      }

      // Single query ottimizzata con deep joins
      const params: Record<string, any> = {
        sort: "-date_created",
        fields: [
          "id",
          "image", 
          "date_created",
          "translations.titolo_articolo",
          "translations.slug_permalink",
          "translations.seo_summary"
        ],
        limit: Math.max(limit, 1),
        filter: {
          status: { _eq: 'published' },
          ...filters
        },
        deep: {
          translations: {
            _filter: {
              languages_code: { _eq: languageCode }
            }
          }
        }
      };

      const response = await this.client.get('/items/articles', { params });
      const rawArticles = response.data.data || [];

      // Filtra solo articoli con traduzioni valide
      return rawArticles.filter((article: any) => 
        article.translations && article.translations.length > 0
      );

    } catch (error: any) {
      console.error("Error fetching articles for sidebar direct:", error.message || error);
      return [];
    }
  }

  // 🚀 FUNZIONE ULTRA-OTTIMIZZATA per articoli generali sidebar (cache lunga)
  public async getLatestArticlesForSidebar(
    languageCode: string, 
    limit: number = 15
  ): Promise<Article[]> {
    try {
      // Direct call - cache managed at Redis layer
      return await this._getArticlesForSidebarDirect(
        languageCode,
        { category_id: { _neq: 9 } },
        limit
      );

    } catch (error: any) {
      console.error("Error fetching latest articles for sidebar:", error.message || error);
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
    limit = 20, // Default sensato invece di illimitato
  }: {
    type: string;
    region_id?: string | number | { id: string | number };
    province_id?: string | number | { id: string | number };
    exclude_id?: string | number;
    lang?: string; // RESO OPZIONALE
    limit?: number;
  }): Promise<Destination[]> {
    return await this._getDestinationsDirect({
      type,
      region_id,
      province_id,
      exclude_id,
      lang,
      limit,
    });
  }

  private async _getDestinationsDirect({
    type,
    region_id,
    province_id,
    exclude_id,
    lang,
    limit = 20,
  }: {
    type: string;
    region_id?: string | number | { id: string | number };
    province_id?: string | number | { id: string | number };
    exclude_id?: string | number;
    lang?: string; // RESO OPZIONALE
    limit?: number;
  }): Promise<Destination[]> {
      if (limit === -1) {
        // Gestione della paginazione per limit: -1
        let allItems: Destination[] = [];
        let page = 1;
        const pageSize = 50; // Ridotto a 50 per maggiore stabilità
        let hasMore = true;

        console.log(`- Paginazione attivata per ${type}. Dimensione blocco: ${pageSize}`);

        while (hasMore) {
          let retries = 3;
          let success = false;
          while(retries > 0 && !success) {
            try {
              const params = this.buildDirectusParams({ type, region_id, province_id, exclude_id, lang, limit: pageSize, offset: (page - 1) * pageSize });
              console.log(`  - Carico blocco pagina ${page} (Tentativo ${4 - retries})...`);
              const response = await this.client.get('/items/destinations', { params });
              const items = response.data.data;
              
              if (items && items.length > 0) {
                allItems = allItems.concat(items);
                page++;
              } else {
                hasMore = false;
              }
              success = true; // La chiamata è andata a buon fine
              // Pausa per non sovraccaricare il server
              await new Promise(resolve => setTimeout(resolve, 1000)); 

            } catch (error: any) {
              retries--;
              if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') && retries > 0) {
                console.warn(`  - Errore di connessione (${error.code})! Riprovo tra 5 secondi... (${retries} tentativi rimasti)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
              } else {
                console.error(`🚨 Errore grave durante la paginazione (${error.code}). Impossibile continuare.`);
                throw error; // Rilancia l'errore se non è un timeout o i tentativi sono finiti
              }
            }
          }
           if (!success) {
            console.error(`\n❌ Processo interrotto dopo multipli fallimenti nel caricare la pagina ${page}.`);
            hasMore = false; // Interrompe il ciclo principale
          }
        }
        console.log(`- Paginazione completata. Totale ${allItems.length} ${type} caricati.`);
        return allItems;

      } else {
        // Chiamata singola standard
        const params = this.buildDirectusParams({ type, region_id, province_id, exclude_id, lang, limit });
        const response = await this.client.get('/items/destinations', { params });
        return response.data.data;
      }
  }

  private buildDirectusParams({ type, region_id, province_id, exclude_id, lang, limit, offset }: {
    type: string;
    region_id?: string | number | { id: string | number };
    province_id?: string | number | { id: string | number };
    exclude_id?: string | number;
    lang?: string;
    limit?: number;
    offset?: number;
  }): Record<string, any> {
      const params: Record<string, any> = {
        'filter[type][_eq]': type,
        'fields[]': [
          'id', 'uuid_id', 'type', 'image',
          'region_id.id', 'region_id.uuid_id', 'province_id.id', 'province_id.uuid_id',
          'translations.languages_code', 'translations.destination_name',
          'translations.seo_summary', 'translations.slug_permalink'
        ],
        limit: limit,
        offset: offset
      };

      if (lang) {
        params['deep[translations][_filter][languages_code][_eq]'] = lang;
      }
      
      if (region_id) {
        const regionIdValue = typeof region_id === 'object' && region_id.id ? region_id.id : region_id;
        params['filter[region_id][_eq]'] = regionIdValue;
      }
      if (province_id) {
        const provinceIdValue = typeof province_id === 'object' && province_id.id ? province_id.id : province_id;
        params['filter[province_id][_eq]'] = provinceIdValue;
      }
      if (exclude_id) {
        params['filter[id][_neq]'] = exclude_id;
      }
    
    return params;
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
    // Direct call - cache managed at Redis layer
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
      // 🚨 TEMPORANEAMENTE BYPASSATO per test timeout
      // const isAuth = await this.testAuth();
      // if (!isAuth) {
      //   console.error("[getArticlesByCategory] Authentication failed");
      //   return [];
      // }

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
        // 🚀 OTTIMIZZAZIONE CRITICA: Per le regioni, limitiamo drasticamente
        // Prima otteniamo solo le prime 10 province di questa regione
        const provincesResponse = await this.client.get('/items/destinations', {
          params: {
            filter: {
              region_id: { _eq: destinationId },
              type: { _eq: 'province' }
            },
            fields: ['id'],
            limit: 10 // ⚡ LIMITE CRITICO: solo prime 10 province
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
            'company_name',
            'slug_permalink',
            'featured_image',
            'translations.seo_title'
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
          limit: destinationType === 'region' ? 30 : 100 // ⚡ LIMITE SPECIFICO: regioni max 30, altri 100
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
          'filter[featured_status][_eq]': 'homepage',
          'fields[]': [
            'id',
            'type',
            'image',
            // 🚀 ESSENZIALE: Slug delle regioni parent per URL gerarchici
            'region_id.id',
            'region_id.translations.slug_permalink',
            'region_id.translations.languages_code',
            // 🚀 ESSENZIALE: Slug delle province parent per URL gerarchici  
            'province_id.id', 
            'province_id.translations.slug_permalink',
            'province_id.translations.languages_code',
            'featured_status',
            // Campi principali della destinazione
            'translations.destination_name',
            'translations.seo_title',
            'translations.slug_permalink',
            'translations.languages_code'
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'limit': 10,
          'sort[]': ['featured_sort', 'id']
        }
      });

      if (!response.data.data?.length) {
        response = await this.client.get('/items/destinations', {
          params: {
            'fields[]': [
              'id',
              'type', 
              'image',
              'region_id.id',
              'region_id.translations.slug_permalink',
              'region_id.translations.languages_code',
              'province_id.id', 
              'province_id.translations.slug_permalink',
              'province_id.translations.languages_code',
              'translations.destination_name',
              'translations.slug_permalink',
              'translations.languages_code'
            ],
            'deep[translations][_filter][languages_code][_eq]': languageCode,
            'limit': 8,
            'sort[]': 'id'
          }
        });
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching homepage destinations:', error.message);
      return [];
    }
  }

  // Metodi semplici per sitemap - solo URLs essenziali
  public async getDestinationsForSitemap(lang: string): Promise<Array<{slug_permalink: string, type: string}>> {
    try {
      // 🚀 Usa il sistema static-destinations per massima velocità e affidabilità
      const { getProvincesForRegion } = await import('./static-destinations');
      
      const destinations: Array<{slug_permalink: string, type: string}> = [];
      
      // 1. Ottieni tutte le regioni usando il metodo esistente
      const regions = await this.getDestinationsByType('region', lang);
      regions.forEach((region: Destination) => {
        const slug = region.translations[0]?.slug_permalink;
        if (slug) {
          destinations.push({
            slug_permalink: slug,
            type: 'region'
          });
        }
      });
      
      // 2. Ottieni alcune province (solo prime per evitare sitemap troppo grandi)
      for (const region of regions.slice(0, 10)) { // Solo prime 10 regioni per limitare dimensioni
        try {
          const provinces = await getProvincesForRegion(region.id, lang);
          provinces.slice(0, 5).forEach((province: Destination) => { // Max 5 province per regione
            const slug = province.translations[0]?.slug_permalink;
            if (slug) {
              destinations.push({
                slug_permalink: slug,
                type: 'province'
              });
            }
          });
        } catch (err) {
          // Ignora errori su singole regioni
          console.warn(`Error fetching provinces for region ${region.id}:`, err);
        }
      }
      
      console.log(`✅ Static-destinations sitemap: ${destinations.length} destinations for ${lang}`);
      return destinations;
        
    } catch (staticError) {
      console.warn('Static-destinations not available, using fallback method:', staticError);
      
      // 🔄 Fallback: Usa metodo tradizionale più semplice (senza traduzioni)
      try {
        const response = await this.client.get('/items/destinations', {
          params: {
            'fields': ['id', 'type'],
            'filter': { 'type': { '_eq': 'region' } },
            'limit': 20
          }
        });
        
        const regions = response.data?.data || [];
        
        // Fallback manuale con slug statici per le regioni principali
        const staticRegionMap: Record<string, string> = {
          '1': 'lazio', '2': 'lombardia', '3': 'campania', '4': 'sicilia',
          '5': 'veneto', '6': 'emilia-romagna', '7': 'piemonte', '8': 'puglia',
          '9': 'toscana', '10': 'calabria', '11': 'sardegna', '12': 'liguria',
          '13': 'marche', '14': 'abruzzo', '15': 'umbria', '16': 'friuli-venezia-giulia',
          '17': 'trentino-alto-adige', '18': 'basilicata', '19': 'molise', '20': 'valle-d-aosta'
        };
        
        const destinations = regions
          .map((region: any) => {
            const slug = staticRegionMap[region.id.toString()];
            if (slug) {
              return {
                slug_permalink: slug,
                type: 'region'
              };
            }
            return null;
          })
          .filter(Boolean);
          
        console.log(`📍 Fallback destinations: ${destinations.length} regions`);
        return destinations;
        
      } catch (fallbackError) {
        console.error('Even fallback destinations method failed:', fallbackError);
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
          'limit': 5000 // Aumentato da 1000 per includere più POI
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

  // 🔧 MEMORY LEAK FIX: Public cleanup method
  public cleanup() {
    this.client.interceptors.request.clear();
    this.client.interceptors.response.clear();
  }

  // Aggiungi qui i nuovi metodi
  async getRelatedMunicipalities(provinceId: string, excludeId: string | null, lang: string) {
    const params = {
      fields: ['id', 'type', 'image', 'translations.destination_name', 'translations.slug_permalink'],
      filter: {
        parent: { _eq: provinceId },
        ...(excludeId && { id: { _neq: excludeId } })
      },
      limit: 15
    };
    return this.getItems('destinations', params);
  }

  async getRelatedProvinces(regionId: string, lang: string) {
    const params = {
      fields: ['id', 'type', 'image', 'translations.destination_name', 'translations.slug_permalink'],
      filter: { parent: { _eq: regionId } },
      limit: 50 // Mostra più province
    };
    return this.getItems('destinations', params);
  }

  async getItemById(collection: string, id: string, params: any = {}) {
    return this.getItems(collection, {
      ...params,
      filter: { id: { _eq: id } },
      limit: 1
    }).then(items => items[0] || null);
  }

  // Metodo esistente...
  async getItems(collection: string, params: any = {}): Promise<any> {
    // const cacheKey = getCacheKey(`items:${collection}`, params);
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) return JSON.parse(cachedData);

    const response = await this.client.get(`/items/${collection}`, { params });
    const data = response.data?.data || [];
    // await redis.set(cacheKey, JSON.stringify(data));
    return data;
  }

  async getSingleton(collection: string, params: any = {}): Promise<any> {
    // ... existing code ...
  }

  async getPageTitles(/* ... */): Promise<any> {
    // ... implementazione esistente ...
  }
}

// ... (dopo la classe DirectusClient e prima di getSidebarData)

interface HreflangData {
  [lang: string]: string;
}

export const getDestinationHreflang = async (destinationId: string): Promise<HreflangData> => {
  const client = new DirectusClient();
  try {
    const destination = await client.getItemById('destinations', destinationId, {
      fields: [
        'id', 'type', 'translations.languages_code', 'translations.slug_permalink',
        'parent.id', 'parent.translations.languages_code', 'parent.translations.slug_permalink',
        'region.id', 'region.translations.languages_code', 'region.translations.slug_permalink'
      ],
    });

    if (!destination || !destination.translations) {
      return {};
    }

    const hreflangs: HreflangData = {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';

    for (const translation of destination.translations) {
      const lang = translation.languages_code;
      const slug = translation.slug_permalink;
      if (!lang || !slug) continue;

      let path = '';
      if (destination.type === 'region') {
        path = `/${lang}/${slug}`;
      } else if (destination.type === 'province') {
        const regionSlug = destination.parent?.translations?.find((t: any) => t.languages_code === lang)?.slug_permalink;
        if (regionSlug) {
          path = `/${lang}/${regionSlug}/${slug}`;
        }
      } else if (destination.type === 'municipality') {
        const provinceSlug = destination.parent?.translations?.find((t: any) => t.languages_code === lang)?.slug_permalink;
        const regionSlug = destination.region?.translations?.find((t: any) => t.languages_code === lang)?.slug_permalink;
        if (regionSlug && provinceSlug) {
          path = `/${lang}/${regionSlug}/${provinceSlug}/${slug}`;
        }
      }

      if (path) {
        hreflangs[lang] = `${baseUrl}${path}`;
      }
    }
    return hreflangs;
  } catch (error) {
    console.error('Error fetching destination hreflang:', error);
    return {};
  }
};

export const getSupportedLanguages = async (): Promise<string[]> => {
  const client = new DirectusClient();
  try {
    const languages = await client.getItems('languages', {
      fields: ['code'],
      sort: ['code']
    });

    return languages.map((lang: any) => lang.code).filter(Boolean);
  } catch (error) {
    console.warn(`Could not fetch languages from DB, using fallback list.`);
    return ['it', 'en', 'fr', 'de', 'es'];
  }
};

function getSafeId(value: any): string | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'object' && value !== null && value.id) {
        return String(value.id);
    }
    return null;
}

export async function getSidebarData(destinationId: string, lang: string) {
    const client = new DirectusClient();
    let destination;
    try {
        destination = await client.getDestinationById(destinationId, lang);
    } catch (error) {
        console.error(`[Sidebar] Fallito caricamento destinazione per id ${destinationId}`, error);
        return { region: null, province: null, relatedProvinces: [], relatedMunicipalities: [] };
    }
    
    if (!destination) {
        console.warn(`[Sidebar] Nessuna destinazione trovata per id ${destinationId}`);
        return { region: null, province: null, relatedProvinces: [], relatedMunicipalities: [] };
    }

    const sidebarData: {
      region?: any | null;
      province?: any | null;
      relatedProvinces?: any[];
      relatedMunicipalities?: any[];
    } = {};

    if (destination.type === 'municipality') {
        const provinceId = getSafeId(destination.province_id);
        const regionId = getSafeId(destination.region_id);
        
        if (provinceId) {
            try {
                const [province, municipalities] = await Promise.all([
                    client.getDestinationById(provinceId, lang),
                    getMunicipalitiesForProvince(provinceId, lang)
                ]);
                sidebarData.province = province;
                sidebarData.relatedMunicipalities = municipalities.filter((m: any) => String(m.id) !== String(destinationId));
            } catch (error) {
                console.error(`[Sidebar] Fallito caricamento comuni/provincia per provincia id ${provinceId}`, error);
            }
        }
        
        if (regionId) {
            try {
                sidebarData.region = await client.getDestinationById(regionId, lang);
            } catch (error) {
                console.error(`[Sidebar] Fallito caricamento regione per id ${regionId}`, error);
            }
        }

    } else if (destination.type === 'province') {
        const regionId = getSafeId(destination.region_id);
        if (regionId) {
            try {
                sidebarData.region = await client.getDestinationById(regionId, lang);
            } catch (error) {
                console.error(`[Sidebar] Fallito caricamento regione per id ${regionId}`, error);
            }
        }
        try {
            sidebarData.relatedMunicipalities = await getMunicipalitiesForProvince(String(destinationId), lang);
        } catch (error) {
            console.error(`[Sidebar] Fallito caricamento comuni per provincia id ${destinationId}`, error);
        }

    } else if (destination.type === 'region') {
        try {
            sidebarData.relatedProvinces = await getProvincesForRegion(String(destinationId), lang);
        } catch (error) {
            console.error(`[Sidebar] Fallito caricamento province per regione id ${destinationId}`, error);
        }
    }

    return sidebarData;
}

const directusClient = new DirectusClient();
export default directusClient;

// ... (dopo getDestinationHreflang)

export const getArticleHreflang = async (articleId: string): Promise<HreflangData> => {
  const client = new DirectusClient();
  try {
    const article = await client.getItemById('articles', articleId, {
      fields: ['id', 'translations.languages_code', 'translations.slug_permalink'],
    });

    if (!article || !article.translations) return {};

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
    console.error(`Error fetching hreflang for article ${articleId}:`, error);
    return {};
  }
};

export const getCompanyHreflang = async (companyId: string): Promise<HreflangData> => {
  const client = new DirectusClient();
  try {
    const company = await client.getItemById('companies', companyId, {
      fields: ['id', 'slug_permalink'],
    });

    if (!company || !company.slug_permalink) return {};

    const hreflangs: HreflangData = {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
    
    // Assumendo che le lingue supportate per i POI siano queste
    const supportedLangs = ['it', 'en', 'fr', 'de', 'es']; 
    
    supportedLangs.forEach(lang => {
      hreflangs[lang] = `${baseUrl}/${lang}/poi/${company.slug_permalink}`;
    });

    return hreflangs;
  } catch (error) {
    console.error(`Error fetching hreflang for company ${companyId}:`, error);
    return {};
  }
};