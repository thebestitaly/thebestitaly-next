import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redirectMap } from './src/lib/redirects';

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

  // 🔄 Check for redirects first (old URLs without region -> new URLs with region)
  if (redirectMap[pathname]) {
    return NextResponse.redirect(new URL(redirectMap[pathname], request.url), 301);
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
    return NextResponse.redirect(new URL(pathname.replace(`/${lang}`, '/en'), request.url));
  }

  // Se non c'è lingua nel pathname, aggiungi la lingua preferita
  let lang = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';
  
  // Se la lingua non è supportata, usa 'en'
  if (!supportedLanguages.includes(lang)) {
    lang = 'en';
  }

  return NextResponse.redirect(new URL(`/${lang}${pathname}`, request.url));
}

export const config = {
  matcher: [
    // Escludi favicon.ico, robots.txt, sitemap.xml e le altre directory
    '/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};