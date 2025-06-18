import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractLanguageFromPath, isRTLLanguage } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  // Extract language from pathname
  const lang = extractLanguageFromPath(request.nextUrl.pathname);
  const isRTL = isRTLLanguage(lang);

  // Create response
  const response = NextResponse.next();
  
  // Set custom headers for language and direction
  response.headers.set('x-pathname', request.nextUrl.pathname);
  response.headers.set('x-language', lang);
  response.headers.set('x-direction', isRTL ? 'rtl' : 'ltr');
  
  // For companies/POI pages, if language is not Italian or English, 
  // we should still use the correct lang/dir for the HTML tag
  // The content fallback is handled in the page components
  // Check if this is a reserved area route (excluding login and api)
  const isReservedRoute = request.nextUrl.pathname.includes('/reserved') && 
                         !request.nextUrl.pathname.includes('/reserved/login') &&
                         !request.nextUrl.pathname.startsWith('/api/');

  if (isReservedRoute) {
    // Check for authentication cookie
    const sessionToken = request.cookies.get('directus_session_token')?.value;
    
    // Check if token exists and is not empty
    if (!sessionToken || sessionToken.trim() === '') {
      // Redirect to login page if not authenticated
      const loginUrl = new URL(`/${lang}/reserved/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is logged in and trying to access login page, redirect to reserved area
  if (request.nextUrl.pathname.includes('/reserved/login')) {
    const sessionToken = request.cookies.get('directus_session_token')?.value;
    
    if (sessionToken) {
      const reservedUrl = new URL(`/${lang}/reserved`, request.url);
      return NextResponse.redirect(reservedUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 