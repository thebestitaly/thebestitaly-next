"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import directusClient from "../../../../../lib/directus";
import StagingTranslationManager from "@/components/translations/StagingTranslationManager";

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
  'no': 'Norwegian',
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
  'me': 'Montenegrin',
  'tk': 'Turkmen'
};

interface TranslationFormData {
  destinationName: string;
  seoTitle: string;
  seoSummary: string;
  description: string;
  slugPermalink: string;
  translations: Record<string, {
    destinationName: string;
    seoTitle: string;
    seoSummary: string;
    description: string;
    slugPermalink: string;
  }>;
}

export default function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [destinationId, setDestinationId] = useState<string>('');
  const [destination, setDestination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'translations'>('info');
  const [translationData, setTranslationData] = useState<TranslationFormData>({
    destinationName: '',
    seoTitle: '',
    seoSummary: '',
    description: '',
    slugPermalink: '',
    translations: {}
  });
  const [translatingLanguages, setTranslatingLanguages] = useState<Set<string>>(new Set());
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setDestinationId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (destinationId) {
      loadDestination();
    }
  }, [destinationId]);

  const loadDestination = async () => {
    try {
      setIsLoading(true);
      const destinationData = await directusClient.getDestinationById(destinationId, 'it');
      setDestination(destinationData);
      
      // Carica le traduzioni esistenti
      await loadTranslations(destinationData);
    } catch (error) {
      console.error('Error loading destination:', error);
      alert('Errore nel caricamento della destinazione');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslations = async (dest: any) => {
    try {
      const translation = dest.translations?.[0];
      if (!translation) return;

      // Imposta i dati inglesi come base
      const baseData = {
        destinationName: translation.destination_name || '',
        seoTitle: translation.seo_title || '',
        seoSummary: translation.seo_summary || '',
        description: translation.description || '',
        slugPermalink: translation.slug_permalink || ''
      };

      // Carica traduzioni per tutte le lingue
      const allTranslations: Record<string, any> = {};
      
      for (const lang of ALL_LANGUAGES) {
        try {
          const response = await fetch(`/api/admin/translations?language=${lang}&section=destinations&keyName=destination_${destinationId}`);
          const data = await response.json();
          
          if (data.success && data.translations) {
            allTranslations[lang] = {
              destinationName: data.translations[`destination_${destinationId}_name`] || '',
              seoTitle: data.translations[`destination_${destinationId}_seo_title`] || '',
              seoSummary: data.translations[`destination_${destinationId}_seo_summary`] || '',
              description: data.translations[`destination_${destinationId}_description`] || '',
              slugPermalink: data.translations[`destination_${destinationId}_slug`] || ''
            };
          } else {
            allTranslations[lang] = {
              destinationName: '',
              seoTitle: '',
              seoSummary: '',
              description: '',
              slugPermalink: ''
            };
          }
        } catch (error) {
          console.warn(`Error loading ${lang} translations:`, error);
          allTranslations[lang] = {
            destinationName: '',
            seoTitle: '',
            seoSummary: '',
            description: '',
            slugPermalink: ''
          };
        }
      }

      setTranslationData({
        ...baseData,
        translations: allTranslations
      });
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  const saveEnglishTranslations = async () => {
    try {
      // Salva tutte le traduzioni inglesi
      const translations = {
        [`destination_${destinationId}_name`]: translationData.destinationName,
        [`destination_${destinationId}_seo_title`]: translationData.seoTitle,
        [`destination_${destinationId}_seo_summary`]: translationData.seoSummary,
        [`destination_${destinationId}_description`]: translationData.description,
        [`destination_${destinationId}_slug`]: translationData.slugPermalink
      };

      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyName: `destination_${destinationId}`,
          section: 'destinations',
          translations: { en: translations },
          description: `Destination ${destinationId} translations`
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Traduzioni inglesi salvate con successo!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving English translations:', error);
      alert('❌ Errore nel salvare le traduzioni inglesi');
    }
  };

  const autoTranslateLanguage = async (targetLang: string) => {
    if (!translationData.destinationName.trim()) {
      alert('❌ Inserisci prima il contenuto inglese');
      return;
    }

    setTranslatingLanguages(prev => new Set(prev).add(targetLang));

    try {
      // Traduci ogni campo
      const fields = [
        { key: 'destinationName', value: translationData.destinationName },
        { key: 'seoTitle', value: translationData.seoTitle },
        { key: 'seoSummary', value: translationData.seoSummary },
        { key: 'description', value: translationData.description },
        { key: 'slugPermalink', value: translationData.slugPermalink }
      ];

      const translations: Record<string, string> = {};

      for (const field of fields) {
        if (field.value.trim()) {
          const response = await fetch('/api/admin/translations/auto-translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keyName: `destination_${destinationId}_${field.key}`,
              section: 'destinations',
              englishText: field.value,
              translationType: 'single',
              targetLanguage: targetLang
            })
          });

          const data = await response.json();
          if (data.success && data.translations[targetLang]) {
            translations[field.key] = data.translations[targetLang];
          }
        }
      }

      // Aggiorna lo stato locale
      setTranslationData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [targetLang]: {
            destinationName: translations.destinationName || '',
            seoTitle: translations.seoTitle || '',
            seoSummary: translations.seoSummary || '',
            description: translations.description || '',
            slugPermalink: translations.slugPermalink || ''
          }
        }
      }));

      alert(`✅ Traduzione in ${LANGUAGE_NAMES[targetLang]} completata!`);
    } catch (error) {
      console.error(`Error translating to ${targetLang}:`, error);
      alert(`❌ Errore nella traduzione in ${LANGUAGE_NAMES[targetLang]}`);
    } finally {
      setTranslatingLanguages(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetLang);
        return newSet;
      });
    }
  };

  const autoTranslateAll = async () => {
    if (!translationData.destinationName.trim()) {
      alert('❌ Inserisci prima il contenuto inglese');
      return;
    }

    const confirmTranslate = window.confirm('🚀 Vuoi tradurre automaticamente in tutte le 50 lingue? Questo potrebbe richiedere alcuni minuti.');
    if (!confirmTranslate) return;

    setIsTranslatingAll(true);

    try {
      // Salva prima le traduzioni inglesi
      await saveEnglishTranslations();

      // Traduci ogni campo in tutte le lingue
      const fields = [
        { key: 'name', value: translationData.destinationName },
        { key: 'seo_title', value: translationData.seoTitle },
        { key: 'seo_summary', value: translationData.seoSummary },
        { key: 'description', value: translationData.description },
        { key: 'slug', value: translationData.slugPermalink }
      ];

      let successCount = 0;
      let errorCount = 0;

      for (const field of fields) {
        if (field.value.trim()) {
          try {
            const response = await fetch('/api/admin/translations/auto-translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                keyName: `destination_${destinationId}_${field.key}`,
                section: 'destinations',
                englishText: field.value,
                translationType: 'all'
              })
            });

            const data = await response.json();
            if (data.success) {
              successCount++;
              
              // Aggiorna lo stato locale con le nuove traduzioni
              setTranslationData(prev => {
                const newTranslations = { ...prev.translations };
                Object.keys(data.translations).forEach(lang => {
                  if (!newTranslations[lang]) {
                    newTranslations[lang] = {
                      destinationName: '',
                      seoTitle: '',
                      seoSummary: '',
                      description: '',
                      slugPermalink: ''
                    };
                  }
                  const fieldKey = field.key === 'name' ? 'destinationName' 
                    : field.key === 'seo_title' ? 'seoTitle'
                    : field.key === 'seo_summary' ? 'seoSummary'
                    : field.key === 'slug' ? 'slugPermalink'
                    : field.key;
                  newTranslations[lang][fieldKey as keyof typeof newTranslations[string]] = data.translations[lang];
                });
                return { ...prev, translations: newTranslations };
              });
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`Error translating field ${field.key}:`, error);
            errorCount++;
          }
        }
      }

      alert(`🎉 Traduzione automatica completata!\n✅ ${successCount} campi tradotti\n❌ ${errorCount} errori`);
      
      // Ricarica le traduzioni
      await loadTranslations(destination);
    } catch (error) {
      console.error('Error in auto-translate all:', error);
      alert('❌ Errore nella traduzione automatica');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">Caricamento destinazione...</div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Destinazione non trovata</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            ← Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  const translation = destination.translations?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                🏛️ Modifica Destinazione
              </h1>
              <p className="text-gray-600 text-lg">
                ID: {destinationId} - {translation?.destination_name || 'Nome non disponibile'}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              ← Indietro
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-md">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'info'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Informazioni
            </button>
            <button
              onClick={() => setActiveTab('translations')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'translations'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌐 Traduzioni
            </button>
          </div>
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informazioni Destinazione</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Destinazione</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {translation?.destination_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {destination.type || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug Permalink</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {translation?.slug_permalink || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {translation?.seo_title || 'N/A'}
                  </div>
                </div>
              </div>

              {translation?.seo_summary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Summary</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {translation.seo_summary}
                  </div>
                </div>
              )}

              {translation?.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 max-h-40 overflow-y-auto">
                    {translation.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'translations' && (
          <div className="space-y-8">
            {/* English Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">🇬🇧 Contenuto Inglese (Base per Traduzioni)</h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Destinazione</label>
                  <textarea
                    value={translationData.destinationName}
                    onChange={(e) => setTranslationData(prev => ({ ...prev, destinationName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Inserisci il nome della destinazione in inglese..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <textarea
                    value={translationData.seoTitle}
                    onChange={(e) => setTranslationData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Inserisci il titolo SEO in inglese..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Summary</label>
                  <textarea
                    value={translationData.seoSummary}
                    onChange={(e) => setTranslationData(prev => ({ ...prev, seoSummary: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Inserisci il riassunto SEO in inglese..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                  <textarea
                    value={translationData.description}
                    onChange={(e) => setTranslationData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Inserisci la descrizione in inglese..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug Permalink</label>
                  <input
                    type="text"
                    value={translationData.slugPermalink}
                    onChange={(e) => setTranslationData(prev => ({ ...prev, slugPermalink: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="esempio-destinazione"
                  />
                </div>

                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={saveEnglishTranslations}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    💾 Salva Inglese
                  </button>
                  <button
                    onClick={autoTranslateAll}
                    disabled={isTranslatingAll}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isTranslatingAll ? '🔄 Traducendo...' : '🚀 Traduci in Tutte le Lingue (50)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Translations Grid */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">🌍 Traduzioni (50 Lingue)</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ALL_LANGUAGES.filter(lang => lang !== 'en').map((lang) => (
                    <div key={lang} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {LANGUAGE_NAMES[lang]} ({lang})
                        </h3>
                        <button
                          onClick={() => autoTranslateLanguage(lang)}
                          disabled={translatingLanguages.has(lang)}
                          className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                        >
                          {translatingLanguages.has(lang) ? '🔄' : '🤖'}
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Nome:</strong>
                          <div className="bg-gray-50 p-2 rounded mt-1 text-xs">
                            {translationData.translations[lang]?.destinationName || 'Non tradotto'}
                          </div>
                        </div>
                        <div>
                          <strong>SEO Title:</strong>
                          <div className="bg-gray-50 p-2 rounded mt-1 text-xs">
                            {translationData.translations[lang]?.seoTitle || 'Non tradotto'}
                          </div>
                        </div>
                        <div>
                          <strong>Riassunto:</strong>
                          <div className="bg-gray-50 p-2 rounded mt-1 text-xs max-h-16 overflow-y-auto">
                            {translationData.translations[lang]?.seoSummary || 'Non tradotto'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                         </div>
           </div>
         )}

         {/* Staging Translation Manager */}
         {destination && (
           <div className="mt-8">
             <StagingTranslationManager
               itemId={destination.id}
               itemType="destination"
               itemTitle={translation?.destination_name || `Destinazione ${destinationId}`}
             />
           </div>
         )}
       </div>
     </div>
   );
 } 