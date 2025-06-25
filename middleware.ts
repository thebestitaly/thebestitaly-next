import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Province to Region mapping - inline per evitare problemi import in produzione
const provinceToRegion: Record<string, string> = {
  // Abruzzo
  'pescara': 'abruzzo', 'chieti': 'abruzzo', 'laquila': 'abruzzo', 'teramo': 'abruzzo',
  // Basilicata
  'matera': 'basilicata', 'potenza': 'basilicata',
  // Calabria
  'catanzaro': 'calabria', 'cosenza': 'calabria', 'crotone': 'calabria', 'reggio-calabria': 'calabria', 'vibo-valentia': 'calabria',
  // Campania
  'avellino': 'campania', 'benevento': 'campania', 'caserta': 'campania', 'napoli': 'campania', 'salerno': 'campania',
  // Emilia-Romagna
  'bologna': 'emilia-romagna', 'ferrara': 'emilia-romagna', 'forli-cesena': 'emilia-romagna', 'modena': 'emilia-romagna', 'parma': 'emilia-romagna', 'piacenza': 'emilia-romagna', 'ravenna': 'emilia-romagna', 'reggio-emilia': 'emilia-romagna', 'rimini': 'emilia-romagna',
  // Friuli-Venezia Giulia
  'gorizia': 'friuli-venezia-giulia', 'pordenone': 'friuli-venezia-giulia', 'trieste': 'friuli-venezia-giulia', 'udine': 'friuli-venezia-giulia',
  // Lazio
  'frosinone': 'lazio', 'latina': 'lazio', 'rieti': 'lazio', 'roma': 'lazio', 'viterbo': 'lazio',
  // Liguria
  'genova': 'liguria', 'imperia': 'liguria', 'la-spezia': 'liguria', 'savona': 'liguria',
  // Lombardia
  'bergamo': 'lombardia', 'brescia': 'lombardia', 'como': 'lombardia', 'cremona': 'lombardia', 'lecco': 'lombardia', 'lodi': 'lombardia', 'mantova': 'lombardia', 'milano': 'lombardia', 'monza-brianza': 'lombardia', 'pavia': 'lombardia', 'sondrio': 'lombardia', 'varese': 'lombardia',
  // Marche
  'ancona': 'marche', 'ascoli-piceno': 'marche', 'fermo': 'marche', 'macerata': 'marche', 'pesaro-urbino': 'marche',
  // Molise
  'campobasso': 'molise', 'isernia': 'molise',
  // Piemonte
  'alessandria': 'piemonte', 'asti': 'piemonte', 'biella': 'piemonte', 'cuneo': 'piemonte', 'novara': 'piemonte', 'torino': 'piemonte', 'verbano-cusio-ossola': 'piemonte', 'vercelli': 'piemonte',
  // Puglia
  'bari': 'puglia', 'barletta-andria-trani': 'puglia', 'brindisi': 'puglia', 'foggia': 'puglia', 'lecce': 'puglia', 'taranto': 'puglia',
  // Sardegna
  'cagliari': 'sardegna', 'nuoro': 'sardegna', 'oristano': 'sardegna', 'sassari': 'sardegna', 'sud-sardegna': 'sardegna',
  // Sicilia
  'agrigento': 'sicilia', 'caltanissetta': 'sicilia', 'catania': 'sicilia', 'enna': 'sicilia', 'messina': 'sicilia', 'palermo': 'sicilia', 'ragusa': 'sicilia', 'siracusa': 'sicilia', 'trapani': 'sicilia',
  // Toscana
  'arezzo': 'toscana', 'firenze': 'toscana', 'grosseto': 'toscana', 'livorno': 'toscana', 'lucca': 'toscana', 'massa-carrara': 'toscana', 'pisa': 'toscana', 'pistoia': 'toscana', 'prato': 'toscana', 'siena': 'toscana',
  // Trentino-Alto Adige
  'bolzano': 'trentino-alto-adige', 'trento': 'trentino-alto-adige',
  // Umbria
  'perugia': 'umbria', 'terni': 'umbria',
  // Valle d'Aosta
  'aosta': 'valle-daosta',
  // Veneto
  'belluno': 'veneto', 'padova': 'veneto', 'rovigo': 'veneto', 'treviso': 'veneto', 'venezia': 'veneto', 'verona': 'veneto', 'vicenza': 'veneto'
};

// Function to get redirect URL - inline
function getRedirectUrl(pathname: string): string | null {
  // Normalize pathname - remove trailing slash for matching
  const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  
  // Pattern: /[LANG]/provincia/comune -> /[LANG]/regione/provincia/comune
  // Support all languages: it, en, es, fr, de, etc.
  const match = normalizedPath.match(/^\/([a-z]{2})\/([^\/]+)\/(.+)$/);
  
  if (!match) {
    return null;
  }
  
  const [, lingua, provincia, resto] = match;
  const regione = provinceToRegion[provincia];
  
  if (!regione) {
    return null;
  }
  
  // Keep original trailing slash if it existed
  const trailingSlash = pathname.endsWith('/') ? '/' : '';
  return `/${lingua}/${regione}/${provincia}/${resto}${trailingSlash}`;
}

// Lingue supportate
const supportedLanguages = ['it', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur', 'ko', 'vi', 'th', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'el', 'he', 'fa', 'am', 'az', 'ka', 'hy', 'tk', 'tl', 'sw', 'ms', 'id', 'is', 'mk', 'af'];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // 🔧 FIXED: More precise bot detection - only block obvious bots
  const isBot = 
    // Major search engine bots (keep these)
    /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(userAgent) ||
    // Social media crawlers (keep these)
    /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(userAgent) ||
    // SEO and monitoring tools (keep these)
    /semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|blexbot/i.test(userAgent) ||
    // Only obvious bot patterns (removed generic patterns that catch browsers)
    /crawler|spider|scraper|wget|curl/i.test(userAgent) ||
    // Empty user agents (keep this)
    userAgent === '' ||
    // Very short user agents (suspicious)
    userAgent.length < 5

  // Only block bots from expensive image routes
  const isImageRoute = 
    pathname.startsWith('/api/directus/assets/') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/images/') ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff)$/i.test(pathname)

  if (isBot && isImageRoute) {
    console.log(`🚫 BLOCKED BOT: ${userAgent} accessing ${pathname}`)
    return new NextResponse('Bot access to images blocked', { status: 403 })
  }

  // Skip middleware per API routes, file statici, etc.
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots') ||
      pathname.startsWith('/sitemap') ||
      pathname.startsWith('/images') ||
      pathname.startsWith('/widgets')) {
    return NextResponse.next();
  }

  // Estrai il segmento della lingua dall'URL
  const pathSegments = pathname.split('/').filter(Boolean);
  const potentialLang = pathSegments[0];

  // Se non c'è lingua o lingua non supportata, redirect a italiano
  if (!potentialLang || !supportedLanguages.includes(potentialLang)) {
    const lang = 'it';
    return NextResponse.redirect(new URL(`/${lang}${pathname}`, request.url), 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes that should be accessible
    '/((?!_next/static|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
}