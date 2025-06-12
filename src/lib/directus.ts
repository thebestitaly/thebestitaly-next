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

export interface Destination {
  id: string;
  region_id?: {
    id: string;
    translations: Translation[];
  } | null;
  province_id?: {
    id: string;
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
  id: number;
  languages_code: string;
  nome_categoria: string;
  seo_title: string;
  seo_summary: string;
  slug_permalink: string;
}

export interface Category {
  id: number;
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
  image?: string;
  video_url?: string; // YouTube, Vimeo, or direct video URL
  date_created: string;
  featured_status: 'none' | 'homepage' | 'top' | 'editor' | 'trending';
  category_id?: {
    id: number;
    translations: {
      nome_categoria: string;
      slug_permalink: string;
    }[];
  };
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
  id: number;
  logo: string;
  website: string;
  company_name: string;
  slug_permalink: string;
  email: string;
  phone: string;
  category_id: number;
  destination_id: number;
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
  id: number;
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
          'id',
          'type',
          'translations.slug_permalink',
          'region_id',
          'province_id',
          'region_id.translations.slug_permalink',
          'province_id.translations.slug_permalink',
        ],
        lang,
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
    // Create the client without hardcoded headers
    // Use proxy API route in browser to avoid CORS issues
    const baseURL = typeof window !== 'undefined' 
      ? '/api/directus' 
      : process.env.NEXT_PUBLIC_DIRECTUS_URL;
      
    this.client = axios.create({
      baseURL,
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
  public async testAuth(): Promise<boolean> {
    try {
      await this.client.get('/users/me');
      return true;
    } catch (error) {
      console.error('Auth test failed:', error);
      return false;
    }
  }
  async getCompaniesForListing(lang: string, filters: Record<string, any> = {}) {
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
            'email',
            'phone',
            'category_id',
            'destination_id',
            'featured',
            'active',
            'featured_status',
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
          }
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
            'email',
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
            'category_id',
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
          limit: 10,
          sort: ['id']
        }
      });

      return (response.data?.data || []).filter((company: Company) => {
        const translation = company.translations?.find((t: any) => t.languages_code === lang);
        return translation?.seo_title?.trim();
      });
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
            featured_status: { _eq: 'homepage' },
            status: { _eq: 'published' }
          },
          fields: [
            'id',
            'image',
            'date_created',
            'featured_status',
            'category_id.id',
            'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink',
            'translations.languages_code',
            'translations.titolo_articolo',
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
            },
            'category_id.translations': {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          },
          limit: 4,
          sort: ['-date_created']
        }
      });

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching homepage articles:', error);
      return [];
    }
  }

  async getLatestArticlesForHomepage(lang: string) {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          filter: {
            featured_status: { _neq: 'homepage' },
            status: { _eq: 'published' },
            category_id: { _neq: 9 },
            languages_code: { _eq: lang  }
          },
          fields: [
            'id',
            'image',
            'date_created',
            'featured_status',
            'category_id.id',
            'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink',
            'translations.languages_code',
            'translations.titolo_articolo',
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
            },
            'category_id.translations': {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          },
          limit: 12,
          sort: ['-date_created']
        }
      });

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching latest articles for homepage:', error);
      return [];
    }
  }

  async getCompanyBySlug(slug: string, lang: string) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            slug_permalink: { _eq: slug }
          },
          fields: [
            'id',
            'featured_image',
            'website',
            'company_name',
            'email',
            'phone',
            'category_id',
            'destination_id',
            'images.id',
            'images.directus_files_id',
            'featured',
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
          }
        }
      });
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
      const response = await this.client.get('/items/articles', {
        params: {
          'filter': {
            'translations': {
              'slug_permalink': {
                '_eq': slug
              }
            }
          },
          'fields': [
            'id',
            'image',
            'category_id.id',
            'category_id.translations.nome_categoria',
            'category_id.translations.slug_permalink',
            'date_created',
            'translations.titolo_articolo',
            'translations.description',
            'translations.seo_summary'
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

      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching article:', error);
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
  
      // Parametri base per la richiesta
      const params: Record<string, any> = {
        filter: {
          status: {
            _eq: 'published'
          }
        },
        sort: "-date_created",
        fields: [
          "id",
          "image",
          "category_id.id",
          "category_id.translations.nome_categoria",
          "category_id.translations.slug_permalink",
          "date_created",
          "featured_status",
          "translations.languages_code",
          "translations.titolo_articolo",
          "translations.seo_summary",
          "translations.slug_permalink",
        ],
        'deep[translations][_filter][languages_code][_eq]': languageCode,
        'deep[category_id.translations][_filter][languages_code][_eq]': languageCode,
        offset: Math.max(offset, 0),
        limit: Math.max(limit, 1),
        meta: 'total_count',
      };

      // Inizializza il filtro
      params.filter = {};

      // Aggiungi filtri opzionali se presenti
      if (Object.keys(filters).length > 0) {
        params.filter = { ...params.filter, ...filters };
      }

      // Aggiungi filtro per featured_status
      if (featuredStatus) {
        params.filter = { ...params.filter, featured_status: { _eq: featuredStatus } };
      }

      // Effettua la chiamata API
      const response = await this.client.get('/items/articles', { params });

      // Estrai articoli e totale dal meta
      const articles = response.data.data || [];
      const total = response.data.meta?.total_count || 0;

      return { articles, total };
    } catch (error: any) {
      console.error("Error fetching articles:", error.message || error);
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
            'region_id.translations.slug_permalink',
            'region_id.translations.destination_name',
            'province_id',
            'province_id.id', // Assicurati di recuperare l'ID della provincia
            'province_id.translations.slug_permalink',
            'province_id.translations.destination_name',
            'parent.translations.slug_permalink',
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
          'deep[province_id.translations][_filter][languages_code][_eq]': languageCode,
          'deep[region_id.translations][_filter][languages_code][_eq]': languageCode,
          'deep[parent.translations][_filter][languages_code][_eq]': languageCode,
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
    region_id?: string;
    province_id?: string;
    exclude_id?: string;
    lang: string;
  }): Promise<Destination[]> {
    try {
      const filterParams: Record<string, any> = {
        'filter[type][_eq]': type,
      };
  
      if (region_id) filterParams['filter[region_id][_eq]'] = region_id;
      if (province_id) filterParams['filter[province_id][_eq]'] = province_id;
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
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[id][_eq]': id,
          'fields[]': [
            'id',
            'parent.translations.slug_permalink',
            'translations.slug_permalink',
            'translations.destination_name',
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'deep[parent.translations][_filter][languages_code][_eq]': languageCode,
        },
      });

      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching destination by ID:', error);
      return null;
    }
  }
  public async getArticlesByCategory(
    categorySlug: string, 
    languageCode: string, 
    limit: number = 10 // Limite di default
  ): Promise<Article[]> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          'filter[status][_eq]': 'published',
          'filter[category_id][translations][slug_permalink][_eq]': categorySlug,
          'fields[]': [
            'id',
            'image',
            'category_id.id',
            'category_id.translations.nome_categoria',
            'date_created',
            'translations.titolo_articolo',
            'translations.description',
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
            },
            'category_id.translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          },
          'sort': ['-date_created'] 
        }
      });
  
      return response.data?.data || [];
    } catch (error) {
      console.error('[getArticlesByCategory] Error fetching articles:', error);
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

  async getCompanyFiles(companyId: number) {
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
            'email',
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