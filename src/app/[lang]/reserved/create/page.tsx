"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import directusClient from "../../../../lib/directus";

interface Category {
  id: number;
  nome_categoria: string;
  translations: Array<{
    nome_categoria: string;
  }>;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    titolo_articolo: '',
    description: '',
    seo_title: '',
    seo_summary: '',
    slug_permalink: '',
    category: '',
    featured_status: 'none' as 'none' | 'homepage' | 'top' | 'editor' | 'trending'
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  // Carica le categorie all'avvio
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await directusClient.getCategories('it');
        setCategories(categoriesData);
      } catch (error) {
        console.error('Errore caricamento categorie:', error);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-genera slug se si sta modificando il titolo
    if (name === 'titolo_articolo' && value) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug_permalink: autoSlug }));
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

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAdditionalImages(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAdditionalImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creazione articolo...');
      
      let imageId = null;
      
      // Upload immagine featured se presente
      if (selectedImage) {
        console.log('Upload immagine featured...');
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
          },
          body: formDataImage,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Errore upload immagine featured');
        }
        
        const uploadResult = await uploadResponse.json();
        imageId = uploadResult.data.id;
        console.log('Immagine featured caricata con ID:', imageId);
      }

      // Upload immagini aggiuntive
      const additionalImageIds: string[] = [];
      if (additionalImages.length > 0) {
        console.log('Upload immagini aggiuntive...');
        for (const image of additionalImages) {
          const formDataImage = new FormData();
          formDataImage.append('file', image);
          
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/files`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
            },
            body: formDataImage,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            additionalImageIds.push(uploadResult.data.id);
            console.log('Immagine aggiuntiva caricata con ID:', uploadResult.data.id);
          }
        }
      }

      // Crea l'articolo principale
      const articlePayload: Record<string, unknown> = {
        date_created: new Date().toISOString(),
        featured_status: formData.featured_status,
        category: formData.category ? parseInt(formData.category) : null
      };

      if (imageId) {
        articlePayload.image = imageId;
      }

      const articleResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articlePayload),
      });

      if (!articleResponse.ok) {
        const errorData = await articleResponse.json();
        console.error('Errore API articolo:', errorData);
        throw new Error('Errore creazione articolo');
      }

      const article = await articleResponse.json();
      console.log('Articolo creato:', article.data);

      // Crea la traduzione italiana
      const translationPayload = {
        articles_id: article.data.id,
        languages_code: 'it',
        titolo_articolo: formData.titolo_articolo,
        description: formData.description,
        seo_title: formData.seo_title,
        seo_summary: formData.seo_summary,
        slug_permalink: formData.slug_permalink
      };

      const translationResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/articles_translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(translationPayload),
      });

      if (!translationResponse.ok) {
        const errorData = await translationResponse.json();
        console.error('Errore API traduzione:', errorData);
        throw new Error('Errore creazione traduzione');
      }

      const translation = await translationResponse.json();
      console.log('Traduzione italiana creata:', translation.data);

      // Crea le relazioni per le immagini aggiuntive
      if (additionalImageIds.length > 0) {
        console.log('Creazione relazioni immagini aggiuntive...');
        for (const imageId of additionalImageIds) {
          try {
            const relationPayload = {
              articles_id: article.data.id,
              directus_files_id: imageId
            };

            const relationResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/articles_files`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(relationPayload),
            });

            if (relationResponse.ok) {
              console.log('Relazione immagine creata per ID:', imageId);
            } else {
              console.error('Errore creazione relazione per immagine:', imageId);
            }
          } catch (err) {
            console.error('Errore nella creazione relazione immagine:', err);
          }
        }
      }
      
      alert('✅ Articolo creato con successo!');
      router.push('/it/reserved');
      
    } catch (error) {
      console.error('Errore durante la creazione:', error);
      alert(`❌ Errore durante la creazione dell'articolo: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                📝 Nuovo Articolo
              </h1>
              <p className="text-gray-600 text-lg">
                Crea un nuovo articolo per il magazine
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

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informazioni Articolo</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titolo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo Articolo *
              </label>
              <input
                type="text"
                name="titolo_articolo"
                value={formData.titolo_articolo}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Es. Scopri le meraviglie della Toscana..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug Permalink *
              </label>
              <input
                type="text"
                name="slug_permalink"
                value={formData.slug_permalink}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="scopri-le-meraviglie-della-toscana"
              />
              <p className="text-sm text-gray-500 mt-1">
                Si genera automaticamente dal titolo, ma puoi modificarlo
              </p>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleziona una categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.translations?.[0]?.nome_categoria || category.nome_categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato Featured
              </label>
              <select
                name="featured_status"
                value={formData.featured_status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="none">Nessuno</option>
                <option value="homepage">Homepage</option>
                <option value="top">Top</option>
                <option value="editor">Editor&apos;s Choice</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Titolo per motori di ricerca"
              />
            </div>

            {/* SEO Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Summary
              </label>
              <textarea
                name="seo_summary"
                value={formData.seo_summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Breve descrizione per motori di ricerca (160 caratteri)"
              />
            </div>

            {/* Contenuto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenuto Articolo
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Scrivi qui il contenuto dell'articolo in Markdown..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Puoi usare sintassi Markdown per formattare il testo
              </p>
            </div>

            {/* Immagine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immagine Articolo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {imagePreview && (
                <div className="mt-4">
                  <Image
                    src={imagePreview}
                    alt="Anteprima"
                    width={192}
                    height={128}
                    className="object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immagini Aggiuntive
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {additionalImagePreviews.map((preview, index) => (
                <div key={index} className="mt-4">
                  <Image
                    src={preview}
                    alt={`Anteprima ${index + 1}`}
                    width={192}
                    height={128}
                    className="object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="text-red-500 text-sm mt-2"
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Creazione...' : 'Crea Articolo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 