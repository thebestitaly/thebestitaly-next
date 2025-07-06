import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect root to reserved area
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/reserved', request.url));
  }
  
  // Let all other requests pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match only root path to redirect to reserved area
    '/',
  ],
};