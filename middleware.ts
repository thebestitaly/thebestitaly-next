import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lingue supportate
const supportedLanguages = ['en', 'it'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Se il pathname non ha già un parametro lingua, redirect alla versione con lingua
  if (!pathname.match(/^\/[a-z]{2}\//)) {
    let lang = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';
    
    // Se la lingua non è supportata, usa 'en'
    if (!supportedLanguages.includes(lang)) {
      lang = 'en';
    }

    return NextResponse.redirect(new URL(`/${lang}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip alcuni path che non necessitano di localizzazione
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};