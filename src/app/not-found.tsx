import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Pagina non trovata
          </h2>
          <p className="text-gray-600">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/it" 
            className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Torna alla Home
          </Link>
          
          <Link 
            href="/it/magazine" 
            className="inline-block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Vai al Magazine
          </Link>
        </div>
      </div>
    </div>
  );
} 