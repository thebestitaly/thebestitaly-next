"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { useAuth } from '@/hooks/useAuth';
import AuthLoader from '@/components/auth/AuthLoader';
import '../globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export default function ReservedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // If not authenticated, redirect to login (except on login page)
  // IMPORTANTE: useEffect deve essere chiamato sempre, prima dei return condizionali
  useEffect(() => {
    if (!user && !isLoading && pathname !== '/reserved/login') {
      // Save the current path to redirect back after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/reserved/login?returnUrl=${returnUrl}`);
    }
  }, [user, isLoading, pathname, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <AuthLoader />;
  }

  // If not authenticated, show minimal layout
  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${poppins.variable} font-sans`}>
      {/* Header Area Riservata */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna alla Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Area Riservata
                </span>
              </div>
            </div>
            
            {/* User Info & Navigation */}
            <div className="flex items-center space-x-6">
              {isLoading ? (
                <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
              ) : user ? (
                <>
                  {/* Navigation Links */}
                  <Link 
                    href="/reserved" 
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    📚 Articoli
                  </Link>
                  <Link 
                    href="/reserved/create" 
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    ✏️ Nuovo
                  </Link>
                  <Link 
                    href="/reserved/widgets" 
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    🔧 Widget
                  </Link>
                  
                  {/* User dropdown */}
                  <div className="flex items-center space-x-3 border-l border-gray-300 pl-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-gray-900">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-900 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© 2024 TheBestItaly - Area Riservata per la gestione dei contenuti</p>
        </div>
      </footer>
    </div>
  );
} 