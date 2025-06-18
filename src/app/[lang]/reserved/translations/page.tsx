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
  translations: Record<string, string>;
}

const SUPPORTED_LANGUAGES = [
  'it', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ar'
];

export default function TranslationsManagementPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<TranslationKey[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<TranslationFormData>({
    keyName: '',
    section: '',
    description: '',
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

      // Carica traduzioni
      const translationsResponse = await fetch('/api/admin/translations?language=it');
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

  // Ottieni sezioni uniche
  const sections = Array.from(new Set(keys.map(key => key.section)));

  // Filtra chiavi per sezione
  const filteredKeys = selectedSection 
    ? keys.filter(key => key.section === selectedSection)
    : keys;

  // Inizia modifica
  const startEdit = (key: TranslationKey) => {
    setEditingKey(key.key_name);
    setFormData({
      keyName: key.key_name,
      section: key.section,
      description: key.description || '',
      translations: {}
    });

    // Carica traduzioni per tutte le lingue
    loadTranslationsForKey(key.key_name);
  };

  const loadTranslationsForKey = async (keyName: string) => {
    const translationValues: Record<string, string> = {};
    
    for (const lang of SUPPORTED_LANGUAGES) {
      try {
        const response = await fetch(`/api/admin/translations?language=${lang}&section=${formData.section}`);
        const data = await response.json();
        
        if (data.success && data.translations[keyName]) {
          translationValues[lang] = data.translations[keyName];
        }
      } catch (error) {
        console.warn(`Error loading ${lang} for ${keyName}`);
      }
    }
    
    setFormData(prev => ({ ...prev, translations: translationValues }));
  };

  // Salva traduzione
  const saveTranslation = async () => {
    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyName: formData.keyName,
          section: formData.section,
          translations: formData.translations,
          description: formData.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Traduzione salvata');
        setEditingKey(null);
        loadData();
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('❌ Errore salvando traduzione');
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
          <h1 className="text-3xl font-bold">🌍 Gestione Traduzioni</h1>
          <div className="flex gap-3">
            <button
              onClick={refreshCache}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🔄 Refresh Cache
            </button>
            <button
              onClick={() => router.push('/it/reserved')}
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
            <p className="text-2xl font-bold text-purple-600">{SUPPORTED_LANGUAGES.length}</p>
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

        {/* Form di modifica */}
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

            <div className="mb-4">
              <label className="block font-medium mb-2">Traduzioni</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <div key={lang}>
                    <label className="block text-sm font-medium mb-1">
                      {lang.toUpperCase()}
                    </label>
                    <input
                      type="text"
                      value={formData.translations[lang] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        translations: { ...prev.translations, [lang]: e.target.value }
                      }))}
                      className="w-full border rounded px-3 py-2"
                      placeholder={`Traduzione in ${lang}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveTranslation}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                💾 Salva
              </button>
              <button
                onClick={() => setEditingKey(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                ❌ Annulla
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
                  <th className="px-4 py-3 text-left">Valore (IT)</th>
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(key)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          ✏️ Modifica
                        </button>
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