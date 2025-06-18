import { getTranslation, getTranslationsForSection } from '@/lib/translations-server';

interface ExampleTranslationsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function ExampleTranslationsPage({ params }: ExampleTranslationsPageProps) {
  const { lang } = await params;

  // Esempi di utilizzo del nuovo sistema di traduzioni
  
  // 1. Singola traduzione
  const welcomeMessage = await getTranslation('title', lang, 'infothebest');
  const searchButton = await getTranslation('search', lang, 'menu');
  
  // 2. Sezione completa
  const menuTranslations = await getTranslationsForSection('menu', lang);
  const footerTranslations = await getTranslationsForSection('footer', lang);
  
  // 3. Con fallback automatico
  const nonExistentKey = await getTranslation('non_existent_key', lang, 'menu');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">
            🌐 Esempio Sistema Traduzioni
          </h1>
          
          <div className="space-y-8">
            {/* Informazioni lingua */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-blue-900">
                📍 Lingua Corrente: {lang.toUpperCase()}
              </h2>
              <p className="text-blue-700">
                Il sistema caricherà automaticamente le traduzioni per questa lingua,
                con fallback su italiano se non disponibili.
              </p>
            </div>

            {/* Singole traduzioni */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-green-900">
                🎯 Singole Traduzioni
              </h2>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <strong>Titolo del sito:</strong> {welcomeMessage}
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <strong>Pulsante ricerca:</strong> {searchButton}
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                  <strong>Chiave inesistente (fallback):</strong> {nonExistentKey}
                </div>
              </div>
            </div>

            {/* Sezione Menu */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">
                🧭 Sezione Menu ({Object.keys(menuTranslations).length} traduzioni)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(menuTranslations).slice(0, 8).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600 font-mono">{key}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>
              {Object.keys(menuTranslations).length > 8 && (
                <div className="mt-3 text-sm text-purple-700">
                  ... e altre {Object.keys(menuTranslations).length - 8} traduzioni
                </div>
              )}
            </div>

            {/* Sezione Footer */}
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                🦶 Sezione Footer ({Object.keys(footerTranslations).length} traduzioni)
              </h2>
              <div className="space-y-3">
                {Object.entries(footerTranslations).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded border-l-4 border-gray-500">
                    <div className="text-sm text-gray-600 font-mono">{key}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiche */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-900">
                📊 Statistiche Sistema
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">51</div>
                  <div className="text-sm text-gray-600">Lingue</div>
                </div>
                <div className="bg-white p-4 rounded text-center">
                  <div className="text-2xl font-bold text-green-600">36</div>
                  <div className="text-sm text-gray-600">Chiavi</div>
                </div>
                <div className="bg-white p-4 rounded text-center">
                  <div className="text-2xl font-bold text-purple-600">1557</div>
                  <div className="text-sm text-gray-600">Traduzioni</div>
                </div>
                <div className="bg-white p-4 rounded text-center">
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <div className="text-sm text-gray-600">Sezioni</div>
                </div>
              </div>
            </div>

            {/* Codice di esempio */}
            <div className="bg-gray-900 p-6 rounded-lg text-white">
              <h2 className="text-xl font-semibold mb-4">
                💻 Esempio di Codice
              </h2>
              <pre className="text-sm overflow-x-auto">
{`// Server Components (in page.tsx)
import { getTranslation, getTranslationsForSection } from '@/lib/translations-server';

// Singola traduzione
const title = await getTranslation('title', lang, 'infothebest');

// Sezione completa  
const menuItems = await getTranslationsForSection('menu', lang);

// Client Components (usando hooks)
import { useTranslation, useSectionTranslations } from '@/hooks/useTranslations';

const { t } = useTranslation(lang);
const menuTranslations = useSectionTranslations('menu', lang);`}
              </pre>
            </div>

            {/* Note */}
            <div className="bg-blue-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                📝 Note Importanti
              </h2>
              <ul className="space-y-2 text-blue-800">
                <li>✅ <strong>Cache intelligente:</strong> Le traduzioni sono messe in cache per 5 minuti</li>
                <li>✅ <strong>Fallback automatico:</strong> Se una traduzione non esiste, viene usato l'italiano</li>
                <li>✅ <strong>Performance:</strong> Sistema normalizzato con indici ottimizzati</li>
                <li>✅ <strong>Scalabilità:</strong> Supporta facilmente nuove lingue e sezioni</li>
                <li>✅ <strong>Compatibilità:</strong> Funziona sia lato server che client</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 