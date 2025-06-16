"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// Lista delle 50 lingue supportate
const ALL_LANGS = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw'
];

// Mapping nomi lingue per visualizzazione
const LANG_NAMES: { [key: string]: string } = {
  'en': 'English',
  'fr': 'French', 
  'es': 'Spanish',
  'pt': 'Portuguese',
  'de': 'German',
  'nl': 'Dutch',
  'ro': 'Romanian',
  'sv': 'Swedish',
  'pl': 'Polish',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'el': 'Greek',
  'uk': 'Ukrainian',
  'ru': 'Russian',
  'bn': 'Bengali',
  'zh': 'Chinese (Simplified)',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'fa': 'Persian',
  'ur': 'Urdu',
  'ja': 'Japanese',
  'ko': 'Korean',
  'am': 'Amharic',
  'cs': 'Czech',
  'da': 'Danish',
  'fi': 'Finnish',
  'af': 'Afrikaans',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sr': 'Serbian',
  'th': 'Thai',
  'ms': 'Malay',
  'tl': 'Filipino',
  'he': 'Hebrew',
  'ca': 'Catalan',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'sw': 'Swahili',
  'zh-tw': 'Chinese (Traditional)'
};

// Stato di traduzione per ogni lingua
interface TranslationStatus {
  language: string;
  status: 'idle' | 'translating' | 'completed' | 'error';
  progress?: number;
}

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDeletingTranslations, setIsDeletingTranslations] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<TranslationStatus[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    email: '',
    phone: '',
    active: true,
    description: '',
    seo_title: '',
    seo_summary: '',
    slug_permalink: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchCompany = async () => {
      try {
        // Use proxy API to avoid CORS issues
        const response = await fetch(`/api/directus/items/companies?filter[id][_eq]=${id}&fields=id,company_name,website,email,phone,active,featured_image,slug_permalink,translations.*&deep[translations][_filter][languages_code][_eq]=it`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Errore nel caricamento company');
        }

        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          const companyData = result.data[0];
          const italianTranslation = companyData.translations?.[0];
          
          setCompany(companyData);
          setCurrentImageId(companyData.featured_image);
          
          setFormData({
            company_name: companyData.company_name || '',
            website: companyData.website || '',
            email: companyData.email || '',
            phone: companyData.phone || '',
            active: companyData.active || false,
            description: italianTranslation?.description || '',
            seo_title: italianTranslation?.seo_title || '',
            seo_summary: italianTranslation?.seo_summary || '',
            slug_permalink: companyData.slug_permalink || '' // Leggi dal campo principale, non dalla traduzione
          });

          // Imposta preview immagine esistente
          if (companyData.featured_image) {
            setImagePreview(`/api/directus/assets/${companyData.featured_image}`);
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento company:', error);
        alert(`❌ Errore nel caricamento della company: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // NON auto-generare slug in modalità edit - mantieni quello esistente
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageId = currentImageId;
      
      // Upload nuova immagine se presente
      if (selectedImage) {
        console.log('Upload nuova immagine tramite API admin...');
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        
        const uploadResult = await fetch(`/api/admin/files/upload`, {
          method: 'POST',
          body: formDataImage,
        });

        if (!uploadResult.ok) {
          throw new Error('Errore nell\'upload dell\'immagine');
        }

        const uploadResponse = await uploadResult.json();
        imageId = uploadResponse.file.id;
        console.log('Nuova immagine caricata con ID:', imageId);
      }

      // Aggiorna la company tramite API admin
      const updateData = {
        company_name: formData.company_name,
        website: formData.website || null,
        email: formData.email || null,
        phone: formData.phone || null,
        active: formData.active,
        slug_permalink: formData.slug_permalink, // Mantieni lo slug esistente (non modificabile dall'utente)
        description: formData.description,
        seo_title: formData.seo_title,
        seo_summary: formData.seo_summary,
        featured_image: imageId
      };

      const updateResult = await fetch(`/api/admin/companies/update/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResult.ok) {
        const errorData = await updateResult.json();
        throw new Error(errorData.error || 'Errore durante l\'aggiornamento della company');
      }

      console.log('Company aggiornata tramite API admin');
      
      alert('✅ Company aggiornata con successo!');
      router.push('/it/reserved');
      
    } catch (error) {
      console.error('Errore durante l\'aggiornamento:', error);
      alert('❌ Errore durante l\'aggiornamento della company');
    } finally {
      setIsSaving(false);
    }
  };

  // Funzione per tradurre tutti i campi nelle 50 lingue
  const handleTranslateAll = async () => {
    if (!company || isTranslating) return;
    
    setIsTranslating(true);
    
    // Inizializza stato di traduzione per tutte le lingue
    const initialProgress = ALL_LANGS.map(lang => ({
      language: lang,
      status: 'idle' as const,
      progress: 0
    }));
    setTranslationProgress(initialProgress);

    try {
      // Simula aggiornamento progressivo dello stato
      for (let i = 0; i < ALL_LANGS.length; i++) {
        const lang = ALL_LANGS[i];
        
        // Aggiorna stato a "traducendo"
        setTranslationProgress(prev => prev.map(item => 
          item.language === lang 
            ? { ...item, status: 'translating', progress: 50 }
            : item
        ));

        // Simula delay per effetto visivo
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // Aggiorna stato a "completato"
        setTranslationProgress(prev => prev.map(item => 
          item.language === lang 
            ? { ...item, status: 'completed', progress: 100 }
            : item
        ));
      }

      // Chiamata API effettiva
      const response = await fetch(`/api/translate-companies/${id}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Errore traduzione: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Traduzioni completate:', result);
      
      alert('🌍 ✅ Traduzioni completate con successo in tutte le 50 lingue!');
      
    } catch (error) {
      console.error('❌ Errore durante la traduzione:', error);
      alert(`❌ Errore durante la traduzione: ${error}`);
      
      // Segna tutte le traduzioni come errore
      setTranslationProgress(prev => prev.map(item => ({
        ...item,
        status: 'error' as const
      })));
    } finally {
      setIsTranslating(false);
    }
  };

  // Funzione per eliminare tutte le traduzioni
  const handleDeleteAllTranslations = async () => {
    if (!company || isDeletingTranslations) return;
    
    const confirm = window.confirm('⚠️ Sei sicuro di voler eliminare TUTTE le traduzioni di questa company? (Verrà mantenuta solo la versione italiana)');
    if (!confirm) return;
    
    setIsDeletingTranslations(true);
    try {
      const response = await fetch(`/api/translate-companies/${id}/delete-all`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Errore eliminazione: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Eliminazione traduzioni company:", result);
      alert(`✅ ${result.message}`);
    } catch (err) {
      console.error("Errore eliminazione traduzioni company:", err);
      alert(`❌ Errore nell'eliminare le traduzioni`);
    } finally {
      setIsDeletingTranslations(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">Caricamento company...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl font-semibold text-red-600 mb-2">Errore</div>
          <div className="text-gray-600">Company non trovata</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                ✏️ Modifica Company
              </h1>
              <p className="text-gray-600">
                ID: {company.id} • {formData.company_name}
              </p>
            </div>
            <button
              onClick={() => router.push('/it/reserved')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ← Torna alla lista
            </button>
          </div>

          {/* Anteprima immagine corrente */}
          {imagePreview && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">🖼️ Immagine Company</h3>
              <div className="flex items-center space-x-4">
                <Image
                  src={imagePreview}
                  alt={formData.company_name || "Company image"}
                  width={150}
                  height={150}
                  className="object-cover rounded-xl border shadow-md"
                />
                <div className="flex-1">
                  {selectedImage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-blue-700 font-semibold">✨ Nuova immagine selezionata</div>
                      <div className="text-blue-600 text-sm">{selectedImage.name}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Indicatori stato traduzione */}
          {translationProgress.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3">🌍 Stato Traduzioni</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {translationProgress.map((progress) => (
                  <div key={progress.language} className="text-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                        progress.status === 'idle' ? 'bg-gray-200 text-gray-600' :
                        progress.status === 'translating' ? 'bg-yellow-400 animate-pulse text-white' :
                        progress.status === 'completed' ? 'bg-green-500 text-white' :
                        'bg-red-500 text-white'
                      }`}
                    >
                      {progress.status === 'idle' ? '⏳' :
                       progress.status === 'translating' ? '🔄' :
                       progress.status === 'completed' ? '✅' : '❌'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {progress.language.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-900">
                      {LANG_NAMES[progress.language]?.slice(0, 6) || progress.language}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Informazioni Company</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nome Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Company *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome della company"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://www.example.com"
                />
              </div>

              {/* Email e Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="info@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              {/* Company attiva */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Company attiva
                  </span>
                </label>
              </div>

              {/* Immagine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aggiorna Immagine Company
                </label>
                <div className="flex items-center space-x-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
                <p className="text-sm text-gray-900 mt-1">
                  Seleziona una nuova immagine per sostituire quella corrente
                </p>
              </div>

              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo SEO
                </label>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Titolo ottimizzato per i motori di ricerca"
                />
              </div>

              {/* SEO Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Riassunto SEO
                </label>
                <textarea
                  name="seo_summary"
                  value={formData.seo_summary}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Breve descrizione per i motori di ricerca (max 160 caratteri)"
                />
              </div>

              {/* Descrizione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Descrizione dettagliata della company (supporta Markdown)..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug Permalink (non modificabile)
                </label>
                <input
                  type="text"
                  name="slug_permalink"
                  value={formData.slug_permalink}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  placeholder="slug-della-company"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lo slug non può essere modificato per mantenere la coerenza degli URL
                </p>
              </div>

              {/* Pulsanti */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    '💾 Salva Modifiche'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTranslateAll}
                  disabled={isTranslating || isSaving}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isTranslating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traducendo in {ALL_LANGS.length} lingue...
                    </>
                  ) : (
                    `🌍 Traduci in ${ALL_LANGS.length} lingue`
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAllTranslations}
                  disabled={isDeletingTranslations}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isDeletingTranslations ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    '🗑️ Elimina tutte le traduzioni'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/it/reserved')}
                  className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Annulla
                </button>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-3 mt-1">💡</div>
                  <div className="text-sm text-blue-700">
                    <strong>Funzionalità disponibili:</strong><br/>
                    • <strong>Aggiorna immagine:</strong> Seleziona una nuova immagine per sostituire quella corrente<br/>
                    • <strong>Traduci in {ALL_LANGS.length} lingue:</strong> Traduce automaticamente tutti i campi testuali<br/>
                    • <strong>Elimina traduzioni:</strong> Rimuove tutte le traduzioni in altre lingue mantenendo solo l'italiano<br/>
                    • <strong>Auto-slug:</strong> Il permalink viene generato automaticamente dal nome della company<br/>
                    • <strong>Lingue supportate:</strong> {ALL_LANGS.length} lingue ({ALL_LANGS.slice(0, 10).join(', ')}...)
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 