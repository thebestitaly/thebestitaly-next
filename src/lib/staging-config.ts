// Configurazione database staging e produzione
export const DATABASE_CONFIG = {
  production: {
    url: process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL!,
    directusUrl: process.env.DIRECTUS_URL!,
    directusToken: process.env.DIRECTUS_TOKEN!,
  },
  staging: {
    url: process.env.STAGING_DATABASE_URL || 'postgresql://postgres:FowPRDivdnyNlQYEukgNUaSMSsrMKNBA@crossover.proxy.rlwy.net:36794/railway',
    directusUrl: process.env.DIRECTUS_URL!, // Usa stesso Directus ma con database diverso
    directusToken: process.env.DIRECTUS_TOKEN!,
  }
};

// Helper per determinare quale database usare
export function getDatabaseConfig(useStaging = false) {
  return useStaging ? DATABASE_CONFIG.staging : DATABASE_CONFIG.production;
}

// Middleware per header staging
export function getStagingHeaders(useStaging = false) {
  return useStaging ? { 'X-Use-Staging-DB': 'true' } : {};
}

// Lista delle lingue supportate per traduzioni
export const SUPPORTED_LANGUAGES = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw','tk','hu'
];

// Mapping nomi lingue
export const LANGUAGE_NAMES: { [key: string]: string } = {
  'en': 'English',
  'fr': 'French', 
  'es': 'Spanish',
  'pt': 'Portuguese',
  'de': 'German',
  'nl': 'Dutch',
  'ro': 'Romanian',
  'sv': 'Swedish',
  'pl': 'Polish',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'el': 'Greek',
  'uk': 'Ukrainian',
  'ru': 'Russian',
  'bn': 'Bengali',
  'zh': 'Chinese (Simplified)',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'fa': 'Persian',
  'ur': 'Urdu',
  'ja': 'Japanese',
  'ko': 'Korean',
  'am': 'Amharic',
  'cs': 'Czech',
  'da': 'Danish',
  'fi': 'Finnish',
  'af': 'Afrikaans',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sr': 'Serbian',
  'th': 'Thai',
  'ms': 'Malay',
  'tl': 'Tagalog',
  'he': 'Hebrew',
  'ca': 'Catalan',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'sw': 'Swahili',
  'zh-tw': 'Chinese (Traditional)',
  'tk': 'Turkmen',
  'hu': 'Hungarian'
}; 