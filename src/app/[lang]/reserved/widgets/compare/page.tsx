'use client';

import { useState } from 'react';

const LANGUAGE_NAMES: { [key: string]: string } = {
  'af': 'Afrikaans', 'am': 'Amharic', 'ar': 'العربية', 'az': 'Azərbaycan', 'bg': 'Български',
  'bn': 'বাংলা', 'ca': 'Català', 'cs': 'Čeština', 'da': 'Dansk', 'de': 'Deutsch',
  'el': 'Ελληνικά', 'en': 'English', 'es': 'Español', 'et': 'Eesti', 'fa': 'فارسی',
  'fi': 'Suomi', 'fr': 'Français', 'he': 'עברית', 'hi': 'हिन्दी', 'hr': 'Hrvatski',
  'hu': 'Magyar', 'hy': 'Հայերեն', 'id': 'Bahasa Indonesia', 'is': 'Íslenska', 'it': 'Italiano',
  'ja': '日本語', 'ka': 'ქართული', 'ko': '한국어', 'lt': 'Lietuvių', 'lv': 'Latviešu',
  'mk': 'Македонски', 'ms': 'Bahasa Melayu', 'nl': 'Nederlands', 'no': 'Norsk', 'pl': 'Polski',
  'pt': 'Português', 'ro': 'Română', 'ru': 'Русский', 'sk': 'Slovenčina', 'sl': 'Slovenščina',
  'sr': 'Српски', 'sv': 'Svenska', 'sw': 'Kiswahili', 'th': 'ไทย', 'tk': 'Türkmençe',
  'tl': 'Filipino', 'tr': 'Türkçe', 'uk': 'Українська', 'ur': 'اردو', 'vi': 'Tiếng Việt', 'zh': '中文'
};

export default function WidgetComparePage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const [selectedLangs] = useState(['it', 'en', 'fr', 'es', 'de', 'pt']);

  const SmallWidget = ({ title = "Roma - Capitale d'Italia", type = "destination" }) => (
    <div className="bg-white border rounded-xl p-4 shadow-md max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <img src="/images/logo-black.webp" alt="TheBestItaly" className="h-8 w-auto" />
        <div className="flex-1">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">
            {type === 'destination' ? 'Destinazione' : 'Eccellenza'} italiana
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600 mb-2">Lingue disponibili:</div>
        <div className="flex flex-wrap gap-2">
          {selectedLangs.slice(0, 4).map(langCode => (
            <button key={langCode} className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md text-xs transition-colors">
              <img src={`/images/flags/${langCode}.svg`} alt={langCode} className="w-4 h-3" />
              <span>{LANGUAGE_NAMES[langCode]}</span>
            </button>
          ))}
          {selectedLangs.length > 4 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{selectedLangs.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );

  const MediumWidget = ({ title = "Firenze - Culla del Rinascimento", type = "destination" }) => (
    <div className="bg-white border rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <img src="/images/logo-black.webp" alt="TheBestItaly" className="h-10 w-auto" />
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">
            Scopri {type === 'destination' ? 'questa destinazione' : 'questa eccellenza'} italiana
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">Lingue disponibili:</div>
        <div className="grid grid-cols-2 gap-2">
          {selectedLangs.map(langCode => (
            <button key={langCode} className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm transition-colors">
              <img src={`/images/flags/${langCode}.svg`} alt={langCode} className="w-5 h-4" />
              <span>{LANGUAGE_NAMES[langCode]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const LargeWidget = ({ title = "Venezia - La Serenissima", type = "destination" }) => (
    <div className="bg-white border rounded-2xl shadow-xl max-w-2xl mx-auto">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-4">
          <img src="/images/logo-black.webp" alt="TheBestItaly" className="h-12 w-auto" />
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">{title}</div>
            <div className="text-gray-600">
              Scopri le meraviglie di {type === 'destination' ? 'questa destinazione' : 'questa eccellenza'} italiana
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Contenuto Principale</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              Questo è il contenuto principale dell'articolo o della destinazione. 
              Il testo cambierà dinamicamente in base alla lingua selezionata dall'utente.
              Include descrizioni, informazioni turistiche e dettagli specifici.
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Scegli la tua lingua:</div>
          <div className="grid grid-cols-3 gap-3">
            {selectedLangs.map(langCode => (
              <button key={langCode} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg text-sm font-medium transition-all transform hover:scale-105">
                <img src={`/images/flags/${langCode}.svg`} alt={langCode} className="w-6 h-4" />
                <span>{LANGUAGE_NAMES[langCode]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Confronto Dimensioni Widget
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Visualizza le tre dimensioni disponibili per i widget TheBestItaly
          </p>
          <a 
            href={`/${lang}/reserved/widgets`}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Torna al Generatore
          </a>
        </div>

        {/* Small Widget */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🔹 Small Widget</h2>
            <p className="text-gray-600">Perfetto per sidebar, footer o spazi ridotti</p>
          </div>
          <div className="flex justify-center mb-6">
            <SmallWidget />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Caratteristiche:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Logo TheBestItaly + Nome destinazione/azienda</li>
              <li>• Bandiere con nomi delle lingue (max 4 visibili)</li>
              <li>• Dimensioni compatte: ~300px larghezza</li>
              <li>• Ideale per: sidebar, widget laterali, footer</li>
            </ul>
          </div>
        </div>

        {/* Medium Widget */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🔸 Medium Widget</h2>
            <p className="text-gray-600">Equilibrio perfetto tra contenuto e dimensioni</p>
          </div>
          <div className="flex justify-center mb-6">
            <MediumWidget />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Caratteristiche:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Logo + Titolo + Descrizione</li>
              <li>• Griglia di lingue con bandiere e nomi completi</li>
              <li>• Dimensioni medie: ~400px larghezza</li>
              <li>• Ideale per: sezioni dedicate, pagine di contenuto</li>
            </ul>
          </div>
        </div>

        {/* Large Widget */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🔶 Large Widget</h2>
            <p className="text-gray-600">Widget completo con contenuto dinamico</p>
          </div>
          <div className="flex justify-center mb-6">
            <LargeWidget />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Caratteristiche:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Header completo con logo e descrizione estesa</li>
              <li>• Contenuto principale che cambia lingua dinamicamente</li>
              <li>• Selezione lingue con effetti hover e animazioni</li>
              <li>• Dimensioni ampie: ~600px larghezza</li>
              <li>• Ideale per: pagine principali, landing page, articoli</li>
            </ul>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">💡 Quando Usare Ogni Dimensione</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800">Small Widget</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>📱 Siti mobile-first</li>
                <li>📄 Blog sidebar</li>
                <li>🔗 Footer links</li>
                <li>📊 Dashboard widgets</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-green-800">Medium Widget</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>🌐 Siti aziendali</li>
                <li>📰 Sezioni news</li>
                <li>🏨 Siti turistici</li>
                <li>📋 Pagine informative</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-purple-800">Large Widget</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>🎯 Landing pages</li>
                <li>📖 Articoli principali</li>
                <li>🏛️ Siti istituzionali</li>
                <li>🎨 Portfolio creativi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 