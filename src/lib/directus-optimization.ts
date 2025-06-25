// Utility per ottimizzare le query Directus e ridurre il traffico Egress
export const OPTIMIZED_IMAGE_PARAMS = {
  // Parametri ULTRA-OTTIMIZZATI per ridurre dimensioni immagini e traffico
  THUMBNAIL: 'width=80&height=80&fit=cover&quality=65&format=webp', // Era 150x150 q70
  CARD: 'width=320&height=200&fit=cover&quality=70&format=webp', // Era 400x240 q75
  HERO_MOBILE: 'width=375&height=200&fit=cover&quality=70&format=webp', // Era 400x240 q75
  HERO_DESKTOP: 'width=1000&height=350&fit=cover&quality=75&format=webp', // Era 1200x400 q80
  GALLERY: 'width=600&height=400&fit=cover&quality=75&format=webp', // Era 800x600 q80
  
  // NUOVI PARAMETRI per ottimizzazioni specifiche
  SIDEBAR: 'width=200&height=120&fit=cover&quality=65&format=webp', // Per sidebar
  SLIDER: 'width=800&height=450&fit=cover&quality=75&format=webp', // Per slider
  ARTICLE_HERO: 'width=900&height=400&fit=cover&quality=75&format=webp', // Per hero articoli
  COMPANY_LOGO: 'width=300&height=200&fit=contain&quality=80&format=webp', // Per loghi aziende
  
  // Parametri micro per preview e lazy loading
  MICRO: 'width=50&height=50&fit=cover&quality=50&format=webp', // Per preview micro
  BLUR_PLACEHOLDER: 'width=20&height=12&fit=cover&quality=30&format=webp', // Per blur placeholder
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
  MENU: 604800, // 7 giorni (fix 32-bit overflow)
      DESTINATIONS: 604800, // 7 giorni (fix 32-bit overflow)
    COMPANIES: 604800, // 7 giorni (fix 32-bit overflow)
  ARTICLES: 604800, // 7 giorni
      CATEGORIES: 604800, // 7 giorni (fix 32-bit overflow)
  HOMEPAGE: 3600, // 1 ora
} as const;

// 🚨 CRITICAL EMERGENCY: 21.87GB/DAY = 650GB/MONTH DISASTER!
export const IMAGE_SIZES = {
  // MINIMALI ASSOLUTI - Railway sta bruciando soldi
  MICRO: { width: 24, height: 24, quality: 25 },           // DRASTICO: era 50x50
  THUMBNAIL: { width: 60, height: 60, quality: 35 },       // DRASTICO: era 120x120  
  CARD: { width: 150, height: 100, quality: 40 },          // DRASTICO: era 320x200
  HERO_MOBILE: { width: 250, height: 130, quality: 45 },   // DRASTICO: era 375x200
  HERO_DESKTOP: { width: 400, height: 180, quality: 50 },  // DRASTICO: era 1000x350
  
  // EMERGENCY SIZES
  SIDEBAR: { width: 48, height: 48, quality: 30 },         
  SLIDER: { width: 120, height: 80, quality: 35 },        
  ARTICLE_HERO: { width: 300, height: 160, quality: 45 },  
  COMPANY_LOGO: { width: 48, height: 48, quality: 35 },    
  PREVIEW: { width: 32, height: 24, quality: 25 },         
  BLUR_PLACEHOLDER: { width: 16, height: 12, quality: 20 } 
}; 