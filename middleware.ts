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
  // Pattern: /it/provincia/comune -> /it/regione/provincia/comune
  const match = pathname.match(/^\/it\/([^\/]+)\/(.+)$/);
  
  if (!match) {
    return null;
  }
  
  const [, provincia, resto] = match;
  const regione = provinceToRegion[provincia];
  
  if (!regione) {
    return null;
  }
  
  return `/it/${regione}/${provincia}/${resto}`;
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
  // SEMPRE LOG - per verificare che middleware si attivi
  console.log(`🚨 MIDDLEWARE WORKING! PATH: ${request.nextUrl.pathname}`);
  
  const pathname = request.nextUrl.pathname;
  
  // TEST REDIRECT SEMPLICE: solo napoli -> campania/napoli
  if (pathname === '/it/napoli/ischia' || pathname === '/it/napoli/ischia/') {
    console.log(`🔄 REDIRECT NAPOLI -> CAMPANIA/NAPOLI`);
    return NextResponse.redirect(new URL('/it/campania/napoli/ischia/', request.url), 301);
  }
  
  // Aggiungi header per test
  const response = NextResponse.next();
  response.headers.set('x-middleware-test', 'ACTIVE');
  return response;
}

export const config = {
  matcher: [
    '/it/:path*'
  ],
};