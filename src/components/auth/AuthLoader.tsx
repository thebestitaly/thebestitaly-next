import React from 'react';

export default function AuthLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Verifica autenticazione...
        </h2>
        <p className="text-gray-600">
          Stiamo controllando le tue credenziali
        </p>
      </div>
    </div>
  );
} 