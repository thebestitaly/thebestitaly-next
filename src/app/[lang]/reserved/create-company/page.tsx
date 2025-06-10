"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import directusClient from "../../../../lib/directus";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-genera slug se si sta modificando il nome
      if (name === 'company_name' && value) {
        const autoSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        setFormData(prev => ({ ...prev, slug_permalink: autoSlug }));
      }
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
    setIsLoading(true);

    try {
      console.log('Creazione company...');
      
      let imageId = null;
      
      // Upload immagine se presente
      if (selectedImage) {
        console.log('Upload immagine...');
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
          throw new Error('Errore upload immagine');
        }
        
        const uploadResult = await uploadResponse.json();
        imageId = uploadResult.data.id;
        console.log('Immagine caricata con ID:', imageId);
      }

      // Crea la company principale
      const companyPayload: any = {
        company_name: formData.company_name,
        website: formData.website || null,
        email: formData.email || null,
        phone: formData.phone || null,
        active: formData.active,
        slug_permalink: formData.slug_permalink
      };

      if (imageId) {
        companyPayload.featured_image = imageId;
      }

      const companyResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyPayload),
      });

      if (!companyResponse.ok) {
        throw new Error('Errore creazione company');
      }

      const company = await companyResponse.json();
      console.log('Company creata:', company.data);

      // Crea la traduzione italiana
      const translationPayload = {
        companies_id: company.data.id,
        languages_code: 'it',
        description: formData.description,
        seo_title: formData.seo_title,
        seo_summary: formData.seo_summary
      };

      const translationResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/companies_translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(translationPayload),
      });

      if (!translationResponse.ok) {
        throw new Error('Errore creazione traduzione');
      }

      const translation = await translationResponse.json();
      console.log('Traduzione italiana creata:', translation.data);
      
      alert('✅ Company creata con successo!');
      router.push('/it/reserved');
      
    } catch (error) {
      console.error('Errore durante la creazione:', error);
      alert('❌ Errore durante la creazione della company');
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
                🏢 Nuova Company
              </h1>
              <p className="text-gray-600 text-lg">
                Crea una nuova azienda/attività commerciale
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
            <h2 className="text-lg font-semibold text-gray-900">Informazioni Company</h2>
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
                placeholder="Es. Hotel Bella Vista, Ristorante Da Mario..."
              />
            </div>

            {/* Informazioni di contatto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="+39 xxx xxx xxxx"
                />
              </div>
            </div>

            {/* Stato attivo */}
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
                Immagine Company
              </label>
              <div className="flex items-center space-x-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  />
                )}
              </div>
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
                Slug URL *
              </label>
              <input
                type="text"
                name="slug_permalink"
                value={formData.slug_permalink}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="url-della-company"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL finale: /poi/{formData.slug_permalink}
              </p>
            </div>

            {/* Pulsanti */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? 'Creazione...' : '🏢 Crea Company'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 