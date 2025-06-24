// Utility per ottimizzare le query Directus e ridurre il traffico Egress
export const OPTIMIZED_IMAGE_PARAMS = {
  // Parametri ottimizzati per ridurre dimensioni immagini
  THUMBNAIL: 'width=150&height=150&fit=cover&quality=70&format=webp',
  CARD: 'width=400&height=240&fit=cover&quality=75&format=webp',
  HERO_MOBILE: 'width=400&height=240&fit=cover&quality=75&format=webp',
  HERO_DESKTOP: 'width=1200&height=400&fit=cover&quality=80&format=webp',
  GALLERY: 'width=800&height=600&fit=cover&quality=80&format=webp',
} as const;

// Fields ottimizzati per ridurre payload
export const MINIMAL_FIELDS = {
  DESTINATION: [
    'id',
    'uuid_id',
    'type',
    'image',
    'lat',
    'long',
    'translations.destination_name',
    'translations.seo_title',
    'translations.seo_summary',
    'translations.slug_permalink'
  ],
  
  COMPANY: [
    'id',
    'uuid_id',
    'company_name',
    'slug_permalink',
    'featured_image',
    'category_id',
    'destination_id',
    'translations.seo_title',
    'translations.seo_summary'
  ],
  
  ARTICLE: [
    'id',
    'uuid_id',
    'image',
    'date_created',
    'featured_status',
    'translations.titolo_articolo',
    'translations.seo_summary',
    'translations.slug_permalink'
  ],
  
  CATEGORY: [
    'id',
    'uuid_id',
    'image',
    'translations.nome_categoria',
    'translations.slug_permalink'
  ]
} as const;

// Utility per costruire URL immagini ottimizzate
export function getOptimizedImageUrl(baseUrl: string, imageId: string, type: keyof typeof OPTIMIZED_IMAGE_PARAMS): string {
  if (!imageId) return '';
  return `${baseUrl}/assets/${imageId}?${OPTIMIZED_IMAGE_PARAMS[type]}`;
}

// Utility per limitare la descrizione e ridurre payload
export function truncateDescription(text: string | undefined, maxLength: number = 150): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Cache TTL ottimizzati per diversi tipi di contenuto
export const CACHE_TTL = {
  MENU: 31536000, // 1 anno (contenuto quasi statico)
  DESTINATIONS: 2592000, // 30 giorni
  COMPANIES: 2592000, // 30 giorni
  ARTICLES: 604800, // 7 giorni
  CATEGORIES: 2592000, // 30 giorni
  HOMEPAGE: 3600, // 1 ora
} as const; 