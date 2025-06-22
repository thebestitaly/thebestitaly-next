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
const supportedLanguages = ['it', 'en', 'fr', 'es', 'de', 'pt', 'tk', 'hu',
    'ro', 'nl', 'sv', 'pl', 'vi', 'id', 'el', 'uk',
    'ru', 'bn', 'zh', 'hi', 'ar', 'fa', 'ur', 'ja',
    'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg',
    'sk', 'sl', 'sr', 'th', 'ms', 'tl', 'he', 'ca',
    'et', 'lv', 'lt', 'mk', 'az', 'ka', 'hy', 'is',
    'sw', 'zh-tw'];
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 🎯 WIDGET REDIRECT - FIX PER I WIDGET!
  if (pathname.includes('/widgets/')) {
    const widgetPath = pathname.replace(/^\/[a-z]{2}\/widgets\//, '/widgets/');
    console.log(`🎯 WIDGET REDIRECT: ${pathname} -> ${widgetPath}`);
    return NextResponse.redirect(new URL(widgetPath, request.url), 302);
  }
  
  // 🔄 Check for redirects first (old URLs without region -> new URLs with region)
  const redirectUrl = getRedirectUrl(pathname);
  if (redirectUrl) {
    // Log only in development now that we know it works
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 MIDDLEWARE REDIRECT: ${pathname} -> ${redirectUrl}`);
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url), 301);
  }

  // Controlla se il pathname inizia già con un codice lingua supportato
  const langMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  
  if (langMatch) {
    const lang = langMatch[1];
    // Se la lingua è supportata, lascia passare
    if (supportedLanguages.includes(lang)) {
      return NextResponse.next();
    }
    // Se la lingua non è supportata, reindirizza a inglese
    return NextResponse.redirect(new URL(pathname.replace(`/${lang}`, '/en'), request.url), 302);
  }

  // Se non c'è lingua nel pathname, aggiungi la lingua preferita
  let lang = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';
  
  // Se la lingua non è supportata, usa 'en'
  if (!supportedLanguages.includes(lang)) {
    lang = 'en';
  }

  return NextResponse.redirect(new URL(`/${lang}${pathname}`, request.url), 302);
}

export const config = {
  matcher: [
    // Match ALL language paths and root paths for language detection
    '/(it|en|es|fr|de|pt|ru|zh|ja|ar|hi|bn|ur|ko|vi|th|tr|pl|nl|sv|da|no|fi|cs|sk|hu|ro|bg|hr|sr|sl|et|lv|lt|el|he|fa|am|az|ka|hy|tk|tl|sw|ms|id|is|mk|af)/:path*',
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|images).*)',
  ],
};