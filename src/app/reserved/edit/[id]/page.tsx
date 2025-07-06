"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import directusClient from '@/lib/directus';
import StagingTranslationManager from '@/components/translations/StagingTranslationManager';

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

const EditArticlePage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      // Carica categorie (gestione errori separata)
      try {
        const categoriesResponse = await directusClient.get('/items/categorias', {
          params: {
            fields: 'id,translations.nome_categoria,translations.languages_code',
            'filter[visible][_eq]': true
          }
        });
        setCategories(categoriesResponse.data.data || []);
      } catch (error) {
        console.warn('⚠️ Categorie non disponibili (errore permessi):', error);
        setCategories([]); // Imposta array vuoto per evitare crash
      }

      // Carica destinazioni (gestione errori separata)
      try {
        const destinationsResponse = await directusClient.get('/items/destinations', {
          params: {
            fields: 'id,translations.destination_name,translations.languages_code'
          }
        });
        setDestinations(destinationsResponse.data.data || []);
      } catch (error) {
        console.warn('⚠️ Destinazioni non disponibili (errore permessi):', error);
        setDestinations([]); // Imposta array vuoto per evitare crash
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
        status: article.status || 'draft',
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
      router.push('/reserved');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento:', error);
      alert(`❌ Errore durante l'aggiornamento: ${error}`);
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Modifica Articolo #{article.id}</h1>
          <button
            onClick={() => router.push('/reserved')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ← Torna alla lista
          </button>
        </div>

        {/* Avviso Permessi Directus */}
        {(categories.length === 0 || destinations.length === 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-blue-400 text-xl">ℹ️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informazione sui Permessi
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Alcuni campi (categorie/destinazioni) non sono disponibili a causa di restrizioni nei permessi Directus. 
                    <strong className="block mt-1">
                      ✅ Il sistema di traduzione funziona correttamente e non è influenzato da questo problema.
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Form di modifica */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Articolo */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Articolo
            </label>
            <select
              value={article.status || 'draft'}
              onChange={(e) => setArticle({...article, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Bozza</option>
              <option value="published">Pubblicato</option>
              <option value="archived">Archiviato</option>
            </select>
          </div>

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
            {categories.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Categorie non disponibili (problema permessi Directus)
                </p>
              </div>
            )}
            <select
              value={article.category_id || ''}
              onChange={(e) => setArticle({...article, category_id: e.target.value ? parseInt(e.target.value) : undefined})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={categories.length === 0}
            >
              <option value="">
                {categories.length === 0 ? 'Categorie non disponibili' : 'Seleziona una categoria'}
              </option>
              {categories.map((category) => {
                const italianTranslation = category.translations?.find((trans: any) => trans.languages_code === 'it');
                return (
                  <option key={category.id} value={category.id}>
                    {italianTranslation?.nome_categoria || `Categoria ${category.id}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Destinazione */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinazione
            </label>
            {destinations.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Destinazioni non disponibili (problema permessi Directus)
                </p>
              </div>
            )}
            <select
              value={article.destination_id || ''}
              onChange={(e) => setArticle({...article, destination_id: e.target.value ? parseInt(e.target.value) : undefined})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={destinations.length === 0}
            >
              <option value="">
                {destinations.length === 0 ? 'Destinazioni non disponibili' : 'Seleziona una destinazione'}
              </option>
              {destinations.map((destination) => {
                const italianTranslation = destination.translations?.find((trans: any) => trans.languages_code === 'it');
                return (
                  <option key={destination.id} value={destination.id}>
                    {italianTranslation?.destination_name || `Destinazione ${destination.id}`}
                  </option>
                );
              })}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo Articolo
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Summary
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenuto (Markdown)
            </label>
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
          </div>
        </form>

        {/* Sistema di Staging per Traduzioni */}
        {article && (
          <div className="mt-8">
            <StagingTranslationManager 
              itemType="article"
              itemId={parseInt(article.id.toString())}
              itemTitle={article.titolo_articolo}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditArticlePage; 