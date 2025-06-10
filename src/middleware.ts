import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a reserved area route (excluding login and api)
  const isReservedRoute = request.nextUrl.pathname.includes('/reserved') && 
                         !request.nextUrl.pathname.includes('/reserved/login') &&
                         !request.nextUrl.pathname.startsWith('/api/');

  if (isReservedRoute) {
    // Check for authentication cookie
    const sessionToken = request.cookies.get('directus_session_token')?.value;
    
    console.log('Middleware - Checking reserved route:', request.nextUrl.pathname);
    console.log('Middleware - Session token:', sessionToken ? 'exists' : 'missing');
    
    // Check if token exists and is not empty
    if (!sessionToken || sessionToken.trim() === '') {
      console.log('Middleware - No valid session token, redirecting to login');
      
      // Get the language from the path (e.g., /it/reserved -> it)
      const pathParts = request.nextUrl.pathname.split('/');
      const lang = pathParts[1] || 'it';
      
      // Redirect to login page if not authenticated
      const loginUrl = new URL(`/${lang}/reserved/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('Middleware - Valid session token found, allowing access');
  }

  // If user is logged in and trying to access login page, redirect to reserved area
  if (request.nextUrl.pathname.includes('/reserved/login')) {
    const sessionToken = request.cookies.get('directus_session_token')?.value;
    
    if (sessionToken) {
      const pathParts = request.nextUrl.pathname.split('/');
      const lang = pathParts[1] || 'it';
      const reservedUrl = new URL(`/${lang}/reserved`, request.url);
      return NextResponse.redirect(reservedUrl);
    }
  }

  return NextResponse.next();
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