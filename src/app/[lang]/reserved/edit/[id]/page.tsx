"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import directusClient from '../../../../../lib/directus';

// Lista delle 50 lingue supportate
const ALL_LANGS = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw'
];

// Mapping nomi lingue per visualizzazione (allineato con le API)
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

interface ArticleData {
  id: string | number;
  status: string;
  featured_status?: string;
  category_id?: number;
  destination_id?: number;
  titolo_articolo: string;
  seo_summary: string;
  description: string;
  slug_permalink: string;
  image?: string;
}

// Stato di traduzione per ogni lingua
interface TranslationStatus {
  language: string;
  status: 'idle' | 'translating' | 'completed' | 'error';
  progress?: number;
}

const EditArticlePage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDeletingTranslations, setIsDeletingTranslations] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<TranslationStatus[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const router = useRouter();

  // Carica i dati dell'articolo
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/articles/${id}`);
        
        if (!response.ok) {
          throw new Error('Errore nel caricamento dell\'articolo');
        }
        
        const result = await response.json();

        if (result && result.data) {
          const articleData = result.data;
          const translation = articleData.translations?.find((t: any) => t.languages_code === 'it');
          
          if (translation) {
            const articleState = {
              id: articleData.id,
              status: articleData.status,
              featured_status: articleData.featured_status,
              category_id: articleData.category_id,
              destination_id: articleData.destination_id,
              titolo_articolo: translation.titolo_articolo || '',
              seo_summary: translation.seo_summary || '',
              description: translation.description || '',
              slug_permalink: translation.slug_permalink || '',
              image: articleData.image
            };
            setArticle(articleState);
            
            // Set image preview if exists
            if (articleData.image) {
              setImagePreview(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${articleData.image}`);
            }
          } else {
            setError('Traduzione italiana non trovata');
          }
        } else {
          setError('Articolo non trovato');
        }
      } catch (error) {
        console.error('Errore nel caricamento articolo:', error);
        setError('Errore nel caricamento dell\'articolo');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Carica categorie e destinazioni
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carica categorie
        const categoriesResponse = await fetch('/api/directus/items/categories?fields=id,translations.nome_categoria&deep[translations][_filter][languages_code][_eq]=it');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.data || []);
        }

        // Carica destinazioni
        const destinationsResponse = await fetch('/api/directus/items/destinations?fields=id,translations.destination_name&deep[translations][_filter][languages_code][_eq]=it&limit=100');
        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json();
          setDestinations(destinationsData.data || []);
        }
      } catch (error) {
        console.error('Errore caricamento dati:', error);
      }
    };
    loadData();
  }, []);

  // Gestione cambio immagine
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

  // Funzione per salvare le modifiche
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    
    setLoading(true);
    try {
      let imageId = article.image;

      // Upload nuova immagine se selezionata
      if (selectedImage) {
        console.log('Upload nuova immagine tramite API...');
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        
        const uploadResponse = await fetch('/api/admin/files/upload', {
          method: 'POST',
          body: formDataImage,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageId = uploadResult.file.id;
          console.log('Nuova immagine caricata con ID:', imageId);
        } else {
          throw new Error('Errore upload immagine');
        }
      }

      // Aggiorna l'articolo tramite API route
      const updateData = {
        titolo_articolo: article.titolo_articolo,
        seo_summary: article.seo_summary,
        description: article.description,
        slug_permalink: article.slug_permalink,
        featured_status: article.featured_status || 'none',
        category_id: article.category_id,
        destination_id: article.destination_id,
        image: imageId
      };

      const updateResponse = await fetch(`/api/admin/articles/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Errore aggiornamento articolo');
      }

      alert('✅ Articolo aggiornato con successo!');
      router.push('/it/reserved');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento:', error);
      alert(`❌ Errore durante l'aggiornamento: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per tradurre tutti i campi nelle 50 lingue
  const handleTranslateAll = async () => {
    if (!article || isTranslating) return;
    
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
      const response = await fetch(`/api/translate-articles/${id}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Errore traduzione: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Traduzione avviata:", result);
      alert(`✅ Traduzione di tutti i campi completata per articolo ${id}`);
    } catch (err) {
      console.error("Errore traduzione:", err);
      alert(`❌ Errore nel tradurre articolo ${id}`);
      
      // Segna tutto come errore
      setTranslationProgress(prev => prev.map(item => ({
        ...item,
        status: 'error'
      })));
    } finally {
      setIsTranslating(false);
    }
  };

  // Funzione per tradurre un singolo campo
  const handleTranslateSingleField = async (field: 'titolo_articolo' | 'seo_summary' | 'description') => {
    if (!article || isTranslating) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(`/api/translate-articles/${id}/field`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: field,
          value: article[field]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Errore traduzione: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Traduzione campo ${field} avviata:`, result);
      alert(`✅ Traduzione del campo "${field}" completata per articolo ${id}`);
    } catch (err) {
      console.error(`Errore traduzione campo ${field}:`, err);
      alert(`❌ Errore nel tradurre il campo ${field}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Funzione per eliminare tutte le traduzioni
  const handleDeleteAllTranslations = async () => {
    if (!article || isDeletingTranslations) return;
    
    const confirm = window.confirm('⚠️ Sei sicuro di voler eliminare TUTTE le traduzioni di questo articolo? (Verrà mantenuta solo la versione italiana)');
    if (!confirm) return;
    
    setIsDeletingTranslations(true);
    try {
      const response = await fetch(`/api/translate-articles/${id}/delete-all`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Errore eliminazione: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Eliminazione traduzioni:", result);
      alert(`✅ ${result.message}`);
      setTranslationProgress([]); // Reset progress
    } catch (err) {
      console.error("Errore eliminazione traduzioni:", err);
      alert(`❌ Errore nell'eliminare le traduzioni`);
    } finally {
      setIsDeletingTranslations(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">Caricamento articolo...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl font-semibold text-red-600 mb-2">Errore</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Modifica Articolo #{article.id}</h1>
          <button
            onClick={() => router.push('/it/reserved')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ← Torna alla lista
          </button>
        </div>

        {/* Informazioni articolo */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="flex items-center space-x-4">
            {imagePreview && (
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <Image 
                  src={imagePreview}
                  alt={article.titolo_articolo}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600">
                <strong>Status:</strong> {article.status}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Featured:</strong> {article.featured_status || 'none'}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Slug:</strong> {article.slug_permalink}
              </div>
            </div>
          </div>
        </div>

        {/* Indicatori stato traduzione */}
        {translationProgress.length > 0 && (
          <div className="bg-white border rounded-lg p-4 mb-6">
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

        {/* Form di modifica */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Featured Status */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Status
            </label>
            <select
              value={article.featured_status || 'none'}
              onChange={(e) => setArticle({...article, featured_status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Nessuno</option>
              <option value="homepage">Homepage</option>
              <option value="top">Top</option>
              <option value="editor">Editor&apos;s Choice</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Categoria */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={article.category_id || ''}
              onChange={(e) => setArticle({...article, category_id: e.target.value ? parseInt(e.target.value) : undefined})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona una categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.translations?.[0]?.nome_categoria || `Categoria ${category.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Destinazione */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinazione
            </label>
            <select
              value={article.destination_id || ''}
              onChange={(e) => setArticle({...article, destination_id: e.target.value ? parseInt(e.target.value) : undefined})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona una destinazione</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.translations?.[0]?.destination_name || `Destinazione ${destination.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Immagine Articolo */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immagine Articolo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            {imagePreview && (
              <div className="mt-3">
                <Image
                  src={imagePreview}
                  alt="Anteprima"
                  width={200}
                  height={150}
                  className="object-cover rounded-lg border"
                />
                {selectedImage && (
                  <p className="text-sm text-blue-600 mt-2">✨ Nuova immagine selezionata</p>
                )}
              </div>
            )}
          </div>

          {/* Titolo Articolo */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Titolo Articolo
              </label>
              <button
                type="button"
                onClick={() => handleTranslateSingleField('titolo_articolo')}
                disabled={isTranslating}
                className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded"
              >
                {isTranslating ? 'Traducendo...' : 'Traduci solo questo campo'}
              </button>
            </div>
            <input
              type="text"
              value={article.titolo_articolo}
              onChange={(e) => setArticle({...article, titolo_articolo: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci il titolo dell'articolo"
            />
          </div>

          {/* SEO Summary */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                SEO Summary
              </label>
              <button
                type="button"
                onClick={() => handleTranslateSingleField('seo_summary')}
                disabled={isTranslating}
                className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded"
              >
                {isTranslating ? 'Traducendo...' : 'Traduci solo questo campo'}
              </button>
            </div>
            <textarea
              value={article.seo_summary}
              onChange={(e) => setArticle({...article, seo_summary: e.target.value})}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci il riassunto SEO"
            />
          </div>

          {/* Description/Content */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contenuto (Markdown)
              </label>
              <button
                type="button"
                onClick={() => handleTranslateSingleField('description')}
                disabled={isTranslating}
                className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded"
              >
                {isTranslating ? 'Traducendo...' : 'Traduci solo questo campo'}
              </button>
            </div>
            <textarea
              value={article.description}
              onChange={(e) => setArticle({...article, description: e.target.value})}
              rows={12}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Inserisci il contenuto dell'articolo in formato Markdown"
            />
          </div>

          {/* Slug Permalink */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug Permalink
            </label>
            <input
              type="text"
              value={article.slug_permalink}
              onChange={(e) => setArticle({...article, slug_permalink: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="slug-dell-articolo"
            />
          </div>

          {/* Pulsanti di azione */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-md font-medium"
            >
              {loading ? '💾 Salvando...' : '💾 Salva Modifiche'}
            </button>
            
            <button
              type="button"
              onClick={handleTranslateAll}
              disabled={isTranslating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium"
            >
              {isTranslating ? '🔄 Traducendo...' : '🌍 Traduci tutti i campi nelle 50 lingue'}
            </button>

            <button
              type="button"
              onClick={handleDeleteAllTranslations}
              disabled={isDeletingTranslations}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-md font-medium"
            >
              {isDeletingTranslations ? '🗑️ Eliminando...' : '🗑️ Elimina tutte le traduzioni'}
            </button>

            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border">
              <strong>💡 Funzionalità Traduzione:</strong><br/>
              • <strong>Traduci singolo campo:</strong> Usa i pulsantini blu accanto a ogni campo<br/>
              • <strong>Traduci tutto:</strong> Usa il pulsante "Traduci tutti i campi nelle 50 lingue"<br/>
              • <strong>Elimina traduzioni:</strong> Rimuove tutte le traduzioni tranne l'italiano<br/>
              • Lingue supportate: {ALL_LANGS.length} lingue ({ALL_LANGS.slice(0, 10).join(', ')}...)
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticlePage; 