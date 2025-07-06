'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TranslationKey {
  id: number;
  key_name: string;
  section: string;
  description?: string;
}

interface TranslationFormData {
  keyName: string;
  section: string;
  description: string;
  englishText: string; // Lingua principale inglese
  translations: Record<string, string>; // Tutte le traduzioni
}

// Tutte le lingue supportate (50+ lingue) - inglese come principale
const ALL_LANGUAGES = [
  'en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur', 'fa', 'tr', 'ko', 
  'vi', 'th', 'id', 'ms', 'tl', 'sw', 'am', 'he', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'sk', 
  'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'el', 'mk', 'az', 'ka', 'hy', 'is', 'af', 
  'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'sq', 'bs', 'me', 'tk'
];

// Nomi delle lingue per display
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'it': 'Italian', 
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ur': 'Urdu',
  'fa': 'Persian',
  'tr': 'Turkish',
  'ko': 'Korean',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'sw': 'Swahili',
  'am': 'Amharic',
  'he': 'Hebrew',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'fi': 'Finnish',
  'pl': 'Polish',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'el': 'Greek',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'af': 'Afrikaans',
  'ca': 'Catalan',
  'eu': 'Basque',
  'gl': 'Galician',
  'cy': 'Welsh',
  'ga': 'Irish',
  'mt': 'Maltese',
  'sq': 'Albanian',
  'bs': 'Bosnian',
  'me': 'Montenegrin'
};

export default function TranslationsManagementPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<TranslationKey[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [translatingKeys, setTranslatingKeys] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<TranslationFormData>({
    keyName: '',
    section: '',
    description: '',
    englishText: '',
    translations: {}
  });

  // Carica dati
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carica chiavi
      const keysResponse = await fetch('/api/admin/translations?type=keys');
      const keysData = await keysResponse.json();
      
      if (keysData.success) {
        setKeys(keysData.keys);
      }

      // Carica traduzioni per inglese (lingua principale)
      const translationsResponse = await fetch('/api/admin/translations?language=en');
      const translationsData = await translationsResponse.json();
      
      if (translationsData.success) {
        setTranslations(translationsData.translations);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      alert('❌ Errore caricando dati');
    } finally {
      setLoading(false);
    }
  };

  // Carica traduzioni per tutte le lingue per una specifica chiave
  const loadAllTranslationsForKey = async (keyName: string, section: string) => {
    const allTranslations: Record<string, string> = {};
    
    for (const lang of ALL_LANGUAGES) {
      try {
        const response = await fetch(`/api/admin/translations?language=${lang}&section=${section}`);
        const data = await response.json();
        
        if (data.success && data.translations[keyName]) {
          allTranslations[lang] = data.translations[keyName];
        } else {
          allTranslations[lang] = ''; // Casella vuota se non c'è traduzione
        }
      } catch (error) {
        console.warn(`Error loading ${lang} for ${keyName}`);
        allTranslations[lang] = '';
      }
    }
    
    return allTranslations;
  };

  // Ottieni sezioni uniche
  const sections = Array.from(new Set(keys.map(key => key.section)));

  // Filtra chiavi per sezione
  const filteredKeys = selectedSection 
    ? keys.filter(key => key.section === selectedSection)
    : keys;

  // Inizia modifica
  const startEdit = async (key: TranslationKey) => {
    setEditingKey(key.key_name);
    
    // Carica tutte le traduzioni per questa chiave
    const allTranslations = await loadAllTranslationsForKey(key.key_name, key.section);
    
    setFormData({
      keyName: key.key_name,
      section: key.section,
      description: key.description || '',
      englishText: allTranslations.en || '',
      translations: allTranslations
    });
  };

  // Salva traduzione inglese
  const saveEnglishTranslation = async () => {
    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyName: formData.keyName,
          section: formData.section,
          translations: { en: formData.englishText }, // Solo inglese
          description: formData.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Traduzione inglese salvata! Ora puoi tradurre automaticamente nelle altre lingue.');
        // Aggiorna le traduzioni locali
        setFormData(prev => ({
          ...prev,
          translations: { ...prev.translations, en: prev.englishText }
        }));
        loadData();
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('❌ Errore salvando traduzione');
    }
  };

  // Salva tutte le traduzioni modificate
  const saveAllTranslations = async () => {
    try {
      // Prepara solo le traduzioni non vuote
      const nonEmptyTranslations = Object.fromEntries(
        Object.entries(formData.translations).filter(([_, value]) => value.trim() !== '')
      );

      if (Object.keys(nonEmptyTranslations).length === 0) {
        alert('❌ Nessuna traduzione da salvare');
        return;
      }

      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyName: formData.keyName,
          section: formData.section,
          translations: nonEmptyTranslations,
          description: formData.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Salvate ${Object.keys(nonEmptyTranslations).length} traduzioni!`);
        loadData();
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving all translations:', error);
      alert('❌ Errore salvando tutte le traduzioni');
    }
  };

  // Traduzione automatica in tutte le lingue
  const autoTranslateAll = async (keyName: string, section: string) => {
    const englishText = translations[section]?.[keyName] || formData.englishText;
    
    if (!englishText) {
      alert('❌ Prima devi salvare la versione inglese!');
      return;
    }

    setTranslatingKeys(prev => new Set(prev).add(keyName));
    
    try {
      const response = await fetch('/api/admin/translations/auto-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyName,
          section,
          englishText,
          translationType: 'all'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Traduzione completata in ${result.translationsCompleted}/${result.totalLanguages} lingue!`);
        
        // Aggiorna le traduzioni in tempo reale se stiamo modificando questa chiave
        if (editingKey === keyName && result.translations) {
          setFormData(prev => ({
            ...prev,
            translations: result.translations
          }));
        }
        
        loadData();
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error auto-translating:', error);
      alert('❌ Errore nella traduzione automatica');
    } finally {
      setTranslatingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyName);
        return newSet;
      });
    }
  };

  // Traduzione automatica solo in italiano
  const autoTranslateItalian = async (keyName: string, section: string) => {
    const englishText = translations[section]?.[keyName] || formData.englishText;
    
    if (!englishText) {
      alert('❌ Prima devi salvare la versione inglese!');
      return;
    }

    setTranslatingKeys(prev => new Set(prev).add(keyName));
    
    try {
      const response = await fetch('/api/admin/translations/auto-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyName,
          section,
          englishText,
          translationType: 'italian'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Traduzione in italiano completata!`);
        
        // Aggiorna le traduzioni in tempo reale se stiamo modificando questa chiave
        if (editingKey === keyName && result.translations) {
          setFormData(prev => ({
            ...prev,
            translations: { ...prev.translations, ...result.translations }
          }));
        }
        
        loadData();
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error auto-translating to Italian:', error);
      alert('❌ Errore nella traduzione in italiano');
    } finally {
      setTranslatingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyName);
        return newSet;
      });
    }
  };

  // Elimina traduzione
  const deleteTranslation = async (keyName: string) => {
    if (!confirm(`Confermi di voler eliminare la traduzione "${keyName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/translations?keyName=${keyName}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Traduzione eliminata');
        loadData();
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('❌ Errore eliminando traduzione');
    }
  };

  // Salva tutte le traduzioni della pagina corrente
  const saveAllPageTranslations = async () => {
    if (!editingKey || editingKey === 'new') {
      alert('❌ Prima apri una traduzione per modificarla');
      return;
    }

    const confirmation = confirm('Vuoi salvare tutte le traduzioni modificate?');
    if (!confirmation) return;

    await saveAllTranslations();
  };

  // Refresh cache
  const refreshCache = async () => {
    try {
      const response = await fetch('/api/admin/translations?action=refresh-cache', {
        method: 'PUT'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Cache aggiornata');
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      alert('❌ Errore aggiornando cache');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Caricamento traduzioni...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">🌍 Gestione Traduzioni con AI</h1>
          <div className="flex gap-3">
            {editingKey && editingKey !== 'new' && (
              <button
                onClick={saveAllPageTranslations}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                💾 Salva Tutto
              </button>
            )}
            <button
              onClick={refreshCache}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🔄 Refresh Cache
            </button>
            <button
              onClick={() => router.push('/reserved')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              ← Torna alla lista
            </button>
          </div>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700">Chiavi Totali</h3>
            <p className="text-2xl font-bold text-blue-600">{keys.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700">Sezioni</h3>
            <p className="text-2xl font-bold text-green-600">{sections.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700">Lingue Supportate</h3>
            <p className="text-2xl font-bold text-purple-600">{ALL_LANGUAGES.length}</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-blue-500 mr-3">🤖</div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Come funziona la traduzione automatica</h3>
              <p className="text-blue-700 text-sm">
                1. Crea la traduzione in <strong>inglese</strong> (lingua principale)<br/>
                2. Usa <strong>"🌍 Traduci Tutto"</strong> per tradurre automaticamente in tutte le {ALL_LANGUAGES.length - 1} lingue<br/>
                3. Oppure usa <strong>"🇮🇹 Solo Italiano"</strong> per una traduzione rapida in italiano<br/>
                4. Visualizza tutte le {ALL_LANGUAGES.length} caselle che si popolano in tempo reale
              </p>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Filtra per sezione:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Tutte le sezioni</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Form di modifica - CON TUTTE LE CASELLE */}
        {editingKey && (
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-xl font-bold mb-4">
              {formData.keyName ? `Modifica: ${formData.keyName}` : 'Nuova Traduzione'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-2">Nome Chiave</label>
                <input
                  type="text"
                  value={formData.keyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="es. destinations"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Sezione</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="es. navigation"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2">Descrizione</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Descrizione opzionale"
              />
            </div>

            {/* Campo inglese principale */}
            <div className="mb-6">
              <label className="block font-medium mb-2">
                Testo Inglese 🇬🇧 (Lingua Principale)
                <span className="text-sm text-gray-500 ml-2">(Le altre lingue verranno tradotte da qui)</span>
              </label>
              <textarea
                value={formData.englishText}
                onChange={(e) => setFormData(prev => ({ ...prev, englishText: e.target.value }))}
                className="w-full border rounded px-3 py-2 h-24 bg-blue-50"
                placeholder="Inserisci il testo in inglese..."
              />
            </div>

            {/* Tutte le caselle di traduzione */}
            <div className="mb-6">
              <label className="block font-medium mb-4">
                Tutte le Traduzioni ({ALL_LANGUAGES.length} lingue)
                <span className="text-sm text-gray-500 ml-2">(Si popolano automaticamente durante la traduzione)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border rounded p-4">
                {ALL_LANGUAGES.map(lang => (
                  <div key={lang}>
                    <label className="block text-sm font-medium mb-1">
                      {LANGUAGE_NAMES[lang]} ({lang.toUpperCase()})
                      {lang === 'en' && <span className="text-blue-600 ml-1">👑</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.translations[lang] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        translations: { ...prev.translations, [lang]: e.target.value }
                      }))}
                      className={`w-full border rounded px-3 py-2 text-sm ${
                        lang === 'en' ? 'bg-blue-50 border-blue-300' : 
                        formData.translations[lang] ? 'bg-green-50 border-green-300' : 
                        'bg-gray-50'
                      }`}
                      placeholder={`Traduzione in ${LANGUAGE_NAMES[lang]}`}
                      readOnly={lang === 'en'} // Inglese modificabile solo nel campo principale
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={saveEnglishTranslation}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                💾 Salva Inglese
              </button>
              
              <button
                onClick={saveAllTranslations}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                💾 Salva Tutto
              </button>
              
              {formData.englishText && (
                <>
                  <button
                    onClick={() => autoTranslateAll(formData.keyName, formData.section)}
                    disabled={translatingKeys.has(formData.keyName)}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    {translatingKeys.has(formData.keyName) ? '⏳ Traducendo...' : '🌍 Traduci Tutto'}
                  </button>
                  <button
                    onClick={() => autoTranslateItalian(formData.keyName, formData.section)}
                    disabled={translatingKeys.has(formData.keyName)}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    {translatingKeys.has(formData.keyName) ? '⏳' : '🇮🇹'} Solo Italiano
                  </button>
                </>
              )}
              
              <button
                onClick={() => setEditingKey(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                ❌ Chiudi
              </button>
            </div>
          </div>
        )}

        {/* Lista traduzioni */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Traduzioni {selectedSection && `- ${selectedSection}`}
            </h2>
            <button
              onClick={() => {
                setEditingKey('new');
                setFormData({
                  keyName: '',
                  section: selectedSection || '',
                  description: '',
                  englishText: '',
                  translations: {}
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ➕ Nuova Traduzione
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Chiave</th>
                  <th className="px-4 py-3 text-left">Sezione</th>
                  <th className="px-4 py-3 text-left">Descrizione</th>
                  <th className="px-4 py-3 text-left">Valore (EN)</th>
                  <th className="px-4 py-3 text-left">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map(key => (
                  <tr key={key.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{key.key_name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {key.section}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {key.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {translations[key.section]?.[key.key_name] || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => startEdit(key)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          ✏️ Modifica
                        </button>
                        
                        {translations[key.section]?.[key.key_name] && (
                          <>
                            <button
                              onClick={() => autoTranslateAll(key.key_name, key.section)}
                              disabled={translatingKeys.has(key.key_name)}
                              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                            >
                              {translatingKeys.has(key.key_name) ? '⏳' : '🌍'} Traduci Tutto
                            </button>
                            <button
                              onClick={() => autoTranslateItalian(key.key_name, key.section)}
                              disabled={translatingKeys.has(key.key_name)}
                              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                            >
                              {translatingKeys.has(key.key_name) ? '⏳' : '🇮🇹'} Solo Italiano
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => deleteTranslation(key.key_name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          🗑️ Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredKeys.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nessuna traduzione trovata
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 