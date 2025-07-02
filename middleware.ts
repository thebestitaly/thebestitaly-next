import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ BASIC MIDDLEWARE - Just handle essential redirects
  const { pathname } = request.nextUrl;
  
  // Handle root redirect to Italian homepage
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/it', request.url));
  }
  
  // Let all other requests pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match only root path to avoid API route conflicts
    '/',
  ],
};