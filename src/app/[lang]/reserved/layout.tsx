import React from 'react';
import Link from 'next/link';

export default function ReservedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/it/reserved" 
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                📚 Articoli
              </Link>
              <Link 
                href="/it/reserved/create" 
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                ✏️ Nuovo
              </Link>
              <Link 
                href="/it/reserved/widgets" 
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                🔧 Widget
              </Link>
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