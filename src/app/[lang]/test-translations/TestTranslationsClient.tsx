'use client';

import { useT, useSectionTranslations } from '@/hooks/useTranslations';
import { useState } from 'react';

interface TestTranslationsClientProps {
  lang: string;
}

export default function TestTranslationsClient({ lang }: TestTranslationsClientProps) {
  const [testKey, setTestKey] = useState('welcome_message');
  const [testSection, setTestSection] = useState('homepage');
  
  // Hook per singola traduzione
  const { t } = useT(lang);
  
  // Hook per sezione intera
  const { translations: navigationTranslations, loading: navLoading } = useSectionTranslations('navigation', lang);
  const { translations: commonTranslations, loading: commonLoading } = useSectionTranslations('common', lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test Sistema Traduzioni
          </h1>
          <p className="text-gray-600">
            Lingua corrente: <span className="font-semibold text-blue-600">{lang.toUpperCase()}</span>
          </p>
        </div>

        {/* Test Hook Singola Traduzione */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🎯 Test Hook Singola Traduzione
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chiave di traduzione:
              </label>
              <select 
                value={testKey} 
                onChange={(e) => setTestKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="welcome_message">welcome_message</option>
                <option value="navigation_home">navigation_home</option>
                <option value="navigation_about">navigation_about</option>
                <option value="button_search">button_search</option>
                <option value="loading">loading</option>
                <option value="error_generic">error_generic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sezione:
              </label>
              <select 
                value={testSection} 
                onChange={(e) => setTestSection(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="homepage">homepage</option>
                <option value="navigation">navigation</option>
                <option value="common">common</option>
                <option value="errors">errors</option>
              </select>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Risultato:</strong>
            <div className="text-lg text-blue-600 font-semibold mt-2">
              &quot;{t(testKey, testSection)}&quot;
            </div>
          </div>
        </div>

        {/* Test Sezione Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🧭 Test Sezione Navigation
          </h2>
          
          {navLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Caricamento...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(navigationTranslations).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{key}</div>
                  <div className="text-lg font-semibold text-gray-900">&quot;{value}&quot;</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Sezione Common */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🔧 Test Sezione Common
          </h2>
          
          {commonLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Caricamento...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(commonTranslations).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{key}</div>
                  <div className="text-lg font-semibold text-gray-900">&quot;{value}&quot;</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Esempi Pratici */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            💡 Esempi Pratici di Utilizzo
          </h2>
          
          <div className="space-y-4">
            {/* Simulazione Header */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Header Simulato:</h3>
              <nav className="flex space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  {t('navigation_home', 'navigation')}
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  {t('navigation_about', 'navigation')}
                </a>
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  {t('button_search', 'common')}
                </button>
              </nav>
            </div>

            {/* Simulazione Welcome */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Welcome Message:</h3>
              <h1 className="text-2xl font-bold text-green-800">
                {t('welcome_message', 'homepage')}
              </h1>
            </div>

            {/* Simulazione Loading */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Loading State:</h3>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-yellow-800">{t('loading', 'common')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Link per andare alla gestione traduzioni */}
        <div className="mt-8 text-center">
          <a 
            href={`/${lang}/reserved/translations`}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            🛠️ Gestisci Traduzioni
          </a>
        </div>
      </div>
    </div>
  );
} 