'use client';

import { useState, useEffect } from 'react';

interface StagingTranslationManagerProps {
  itemType: 'article' | 'company' | 'destination';
  itemId: number;
  itemTitle: string;
}

interface TranslationStatus {
  itemType: string;
  itemId: number;
  staging: {
    count: number;
    languages: Array<{ code: string }>;
  };
  production: {
    count: number;
    languages: Array<{ code: string }>;
  };
  canSync: boolean;
}

export default function StagingTranslationManager({ 
  itemType, 
  itemId, 
  itemTitle 
}: StagingTranslationManagerProps) {
  const [status, setStatus] = useState<TranslationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [stopping, setStopping] = useState(false);

  // Carica stato delle traduzioni
  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/translations/staging/sync?itemType=${itemType}&itemId=${itemId}`);
      
      if (!response.ok) {
        console.error(`HTTP Error ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Controlla che la risposta abbia contenuto
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from server');
        throw new Error('Empty response');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response');
      }
      
      // Verifica che i dati abbiano la struttura corretta
      if (!data || typeof data !== 'object') {
        console.error('Invalid data structure:', data);
        throw new Error('Invalid data structure');
      }
      
      setStatus(data);
    } catch (error) {
      console.error('Error loading status:', error);
      // Fallback con dati vuoti
      setStatus({
        itemType,
        itemId,
        staging: { count: 0, languages: [] },
        production: { count: 0, languages: [] },
        canSync: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Ferma le traduzioni in corso
  const stopTranslations = async () => {
    try {
      setStopping(true);
      
      const response = await fetch('/api/translations/staging/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          itemId,
          translationType: 'all', // Non importa per stop
          action: 'stop'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`🛑 Traduzioni fermate per ${itemTitle}`);
        setTranslating(false);
      } else {
        alert(`⚠️ ${result.message}`);
      }
    } catch (error) {
      console.error('Stop error:', error);
      alert('❌ Errore durante l\'interruzione');
    } finally {
      setStopping(false);
    }
  };

  // Continua le traduzioni mancanti
  const continueTranslations = async (translationType: 'english' | 'all') => {
    try {
      setTranslating(true);
      
      const response = await fetch('/api/translations/staging/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          itemId,
          translationType,
          action: 'continue'
        })
      });

      const result = await response.json();
      if (result.success) {
        if (result.skipped) {
          alert(`✅ Tutte le traduzioni sono già complete per ${itemTitle}`);
        } else {
          alert(`✅ Traduzioni mancanti completate per ${itemTitle}`);
        }
        loadStatus(); // Ricarica stato
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Continue error:', error);
      alert('❌ Errore durante il completamento');
    } finally {
      setTranslating(false);
    }
  };

  // Crea traduzioni in staging
  const createStagingTranslations = async (translationType: 'english' | 'all') => {
    try {
      setTranslating(true);
      
      const response = await fetch('/api/translations/staging/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          itemId,
          translationType
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`✅ Traduzioni create in staging per ${itemTitle}`);
          loadStatus(); // Ricarica stato
        } else {
          alert(`❌ Errore: ${result.error}`);
        }
      } else {
        const errorText = await response.text();
        alert(`❌ Errore HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('❌ Errore durante la traduzione');
    } finally {
      setTranslating(false);
    }
  };

  // Sincronizza traduzioni alla produzione
  const syncToProduction = async () => {
    if (!confirm(`Confermi di voler sincronizzare le traduzioni di "${itemTitle}" dalla staging alla produzione?`)) {
      return;
    }

    try {
      setSyncing(true);
      
      const response = await fetch('/api/translations/staging/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          itemId,
          languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
          confirmSync: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.syncedCount} traduzioni sincronizzate in produzione`);
        loadStatus(); // Ricarica stato
        setSelectedLanguages([]);
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Errore durante la sincronizzazione');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [itemType, itemId]);

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🔄 Gestione Traduzioni Staging
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {itemType}: <strong>{itemTitle}</strong> (ID: {itemId})
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stato Traduzioni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                🏗️ Staging Database
              </h4>
              <p className="text-sm text-yellow-700">
                {status?.staging?.count || 0} traduzioni disponibili
              </p>
              {status?.staging?.languages?.map(lang => (
                <span key={lang.code} className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs mr-1 mt-1">
                  <a 
                    href={`/it/reserved/preview/${itemType}/${itemId}?lang=${lang.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    title={`Preview ${lang.code} translation`}
                  >
                    {lang.code} 🔍
                  </a>
                </span>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                🚀 Production Database
              </h4>
              <p className="text-sm text-green-700">
                {status?.production?.count || 0} traduzioni attive
              </p>
              {status?.production?.languages?.map(lang => (
                <span key={lang.code} className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs mr-1 mt-1">
                  {lang.code}
                </span>
              ))}
            </div>
          </div>

          {/* Azioni Traduzione */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">1. Crea Traduzioni in Staging</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => createStagingTranslations('english')}
                disabled={translating || stopping}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {translating ? '⏳ Traducendo...' : '🇬🇧 Solo Inglese'}
              </button>
              
              <button
                onClick={() => createStagingTranslations('all')}
                disabled={translating || stopping}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {translating ? '⏳ Traducendo...' : '🌍 Tutte le Lingue (49)'}
              </button>

              {/* Pulsante Stop - visibile solo durante traduzione */}
              {translating && (
                <button
                  onClick={stopTranslations}
                  disabled={stopping}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stopping ? '⏳ Fermando...' : '🛑 Ferma Traduzioni'}
                </button>
              )}
            </div>

            {/* Pulsanti Continue - visibili solo se ci sono traduzioni parziali */}
            {status?.staging?.count && status.staging.count > 0 && status.staging.count < 49 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Continua Traduzioni Mancanti:</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => continueTranslations('english')}
                    disabled={translating || stopping}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📝 Continua Inglese
                  </button>
                  
                  <button
                    onClick={() => continueTranslations('all')}
                    disabled={translating || stopping}
                    className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📝 Continua Tutte
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selezione Lingue per Sync */}
          {status?.staging?.count && status.staging.count > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">2. Seleziona Lingue da Sincronizzare</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLanguages([])}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  Tutte
                </button>
                {status?.staging?.languages?.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (selectedLanguages.includes(lang.code)) {
                        setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                      } else {
                        setSelectedLanguages([...selectedLanguages, lang.code]);
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedLanguages.includes(lang.code)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sync alla Produzione */}
          {status?.canSync && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">3. Sincronizza alla Produzione</h4>
              <button
                onClick={syncToProduction}
                disabled={syncing}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {syncing ? '⏳ Sincronizzando...' : '🚀 Conferma e Sincronizza'}
              </button>
                             <p className="text-sm text-gray-600">
                 {selectedLanguages.length > 0 
                   ? `Verranno sincronizzate ${selectedLanguages.length} lingue selezionate`
                   : `Verranno sincronizzate tutte le ${status?.staging.count || 0} traduzioni`
                 }
              </p>
            </div>
          )}

          {/* Refresh */}
          <div className="pt-4 border-t">
            <button
              onClick={loadStatus}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🔄 Aggiorna Stato
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 