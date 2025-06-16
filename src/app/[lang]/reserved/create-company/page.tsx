"use client";

import React, { useState, useEffect } from "react";
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
    slug_permalink: '',
    category_id: '',
    destination_id: '',
    lat: '',
    long: '',
    address: '' // Nuovo campo per l'indirizzo
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([]);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Carica categorie e destinazioni all'avvio
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carica categorie companies
        const categoriesResponse = await directusClient.getCompanyCategories('it');
        setCategories(categoriesResponse);

        // Carica TUTTE le destinazioni (non solo municipalities)
        const [regionsResponse, provincesResponse, municipalitiesResponse] = await Promise.all([
          directusClient.getDestinations({ type: 'region', lang: 'it' }),
          directusClient.getDestinations({ type: 'province', lang: 'it' }),
          directusClient.getDestinations({ type: 'municipality', lang: 'it' })
        ]);
        
        // Combina tutte le destinazioni con etichette per tipo
        const allDestinations = [
          ...regionsResponse.map(d => ({ ...d, typeLabel: 'Regione' })),
          ...provincesResponse.map(d => ({ ...d, typeLabel: 'Provincia' })),
          ...municipalitiesResponse.map(d => ({ ...d, typeLabel: 'Comune' }))
        ];
        
        setDestinations(allDestinations);
        setFilteredDestinations(allDestinations);
      } catch (error) {
        console.error('Errore caricamento dati:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.destination-dropdown')) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtro destinazioni in base alla ricerca
  useEffect(() => {
    if (!destinationSearch.trim()) {
      setFilteredDestinations(destinations.slice(0, 100)); // Mostra solo prime 100 se non c'è ricerca
      return;
    }

    // Inizia la ricerca solo da 3 caratteri
    if (destinationSearch.trim().length < 3) {
      setFilteredDestinations([]);
      return;
    }

    const searchLower = destinationSearch.toLowerCase();
    const filtered = destinations.filter(destination => {
      const name = destination.translations?.[0]?.destination_name || '';
      return name.toLowerCase().includes(searchLower);
    });
    
    // Ordina per rilevanza: prima quelli che iniziano con la ricerca, poi quelli che la contengono
    const sorted = filtered.sort((a, b) => {
      const nameA = a.translations?.[0]?.destination_name?.toLowerCase() || '';
      const nameB = b.translations?.[0]?.destination_name?.toLowerCase() || '';
      
      const aStarts = nameA.startsWith(searchLower);
      const bStarts = nameB.startsWith(searchLower);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return nameA.localeCompare(nameB);
    });
    
    // MOSTRA TUTTI i risultati filtrati, non limitare
    console.log(`🔍 Ricerca "${destinationSearch}": trovati ${sorted.length} risultati su ${destinations.length} totali`);
    setFilteredDestinations(sorted);
  }, [destinationSearch, destinations]);

  // Geocoding automatico dall'indirizzo
  const handleAddressGeocoding = async (address: string) => {
    if (!address.trim()) return;
    
    setGeocodingLoading(true);
    try {
      // Usa Nominatim con headers appropriati e User-Agent
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Italy')}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TheBestItaly/1.0 (https://thebestitaly.com)',
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setFormData(prev => ({
            ...prev,
            lat: parseFloat(lat).toFixed(6),
            long: parseFloat(lon).toFixed(6)
          }));
          alert(`✅ Coordinate trovate: ${lat}, ${lon}`);
          console.log(`📍 Coordinate trovate: ${lat}, ${lon}`);
        } else {
          alert('❌ Nessuna coordinata trovata per questo indirizzo. Prova con un indirizzo più specifico.');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Errore geocoding:', error);
      alert(`❌ Errore nel geocoding: ${error instanceof Error ? error.message : 'Errore sconosciuto'}. Prova con un indirizzo più specifico o inserisci le coordinate manualmente.`);
    } finally {
      setGeocodingLoading(false);
    }
  };

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

  const handleDestinationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationSearch(value);
    setShowDestinationDropdown(true);
    
    // Reset selezione se l'utente sta digitando
    if (selectedDestination && value !== selectedDestination.translations?.[0]?.destination_name) {
      setSelectedDestination(null);
      setFormData(prev => ({ ...prev, destination_id: '' }));
    }
  };

  const selectDestination = (destination: any) => {
    setSelectedDestination(destination);
    setDestinationSearch(destination.translations?.[0]?.destination_name || '');
    setFormData(prev => ({ ...prev, destination_id: destination.id.toString() }));
    setShowDestinationDropdown(false);
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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creazione company tramite API...');
      
      let imageId = null;
      
      // Upload immagine se presente
      if (selectedImage) {
        console.log('Upload immagine...');
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        
        const uploadResponse = await fetch('/api/admin/files/upload', {
          method: 'POST',
          body: formDataImage,
        });

        if (!uploadResponse.ok) {
          throw new Error('Errore upload immagine');
        }

        const uploadResult = await uploadResponse.json();
        imageId = uploadResult.file.id;
        console.log('Immagine caricata con ID:', imageId);
      }

      // Prepara i dati per l'API
      const createData = {
        nome_azienda: formData.company_name, // Mapping del campo
        description: formData.description,
        seo_title: formData.seo_title,
        seo_summary: formData.seo_summary,
        slug_permalink: formData.slug_permalink,
        featured_status: 'none', // Default
        category: formData.category_id ? parseInt(formData.category_id) : null,
        image: imageId,
        // Campi aggiuntivi specifici per companies
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        active: formData.active,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        destination_id: formData.destination_id ? parseInt(formData.destination_id) : null,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        long: formData.long ? parseFloat(formData.long) : null
      };

      // Crea la company tramite API route
      const response = await fetch('/api/admin/companies/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la creazione');
      }

      const result = await response.json();
      console.log('Company creata con successo:', result);
      
      alert('✅ Company creata con successo!');
      router.push('/it/reserved');
      
    } catch (error) {
      console.error('Errore durante la creazione:', error);
      alert(`❌ Errore durante la creazione della company: ${error}`);
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

            {/* Categoria e Destinazione */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                {loadingData ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                    Caricamento categorie...
                  </div>
                ) : (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleziona categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.translations?.[0]?.name || category.name || `Categoria ${category.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinazione * 
                  {selectedDestination && (
                    <span className="text-xs text-purple-600 ml-2">
                      (ID: {selectedDestination.id} - {selectedDestination.typeLabel})
                    </span>
                  )}
                </label>
                {loadingData ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                    Caricamento destinazioni...
                  </div>
                ) : (
                  <div className="relative destination-dropdown">
                    <input
                      type="text"
                      value={destinationSearch}
                      onChange={handleDestinationSearch}
                      onFocus={() => setShowDestinationDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Cerca destinazione... (minimo 3 caratteri)"
                      required={!selectedDestination}
                    />
                    
                    {showDestinationDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {destinationSearch.trim().length > 0 && destinationSearch.trim().length < 3 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Digita almeno 3 caratteri per iniziare la ricerca...
                          </div>
                        ) : filteredDestinations.length > 0 ? (
                          <>
                            {/* Header con conteggio risultati */}
                            <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-b border-gray-200 sticky top-0">
                              {filteredDestinations.length} risultati trovati
                            </div>
                            
                            {filteredDestinations.map((destination) => (
                              <button
                                key={destination.id}
                                type="button"
                                onClick={() => selectDestination(destination)}
                                className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                              >
                                <span>
                                  {destination.translations?.[0]?.destination_name || `Destinazione ${destination.id}`}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {destination.typeLabel} - ID: {destination.id}
                                </span>
                              </button>
                            ))}
                            
                            {/* Footer con info */}
                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200 sticky bottom-0">
                              Scorri per vedere tutti i {filteredDestinations.length} risultati
                            </div>
                          </>
                        ) : destinationSearch.trim().length >= 3 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Nessun risultato trovato per "{destinationSearch}"
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Indirizzo per Geocoding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo (per calcolo automatico coordinate)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Es. Via Roma 123, Milano"
                />
                <button
                  type="button"
                  onClick={() => handleAddressGeocoding(formData.address)}
                  disabled={!formData.address.trim() || geocodingLoading}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {geocodingLoading ? '🔄' : '📍'} Trova Coordinate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Inserisci l'indirizzo e clicca "Trova Coordinate" per calcolare automaticamente latitudine e longitudine
              </p>
            </div>

            {/* Coordinate GPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitudine
                </label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Es. 45.4642"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitudine
                </label>
                <input
                  type="number"
                  step="any"
                  name="long"
                  value={formData.long}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Es. 9.1900"
                />
              </div>
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
              <div className="space-y-4">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imagePreview && (
                  <div className="flex items-center space-x-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      🗑️ Rimuovi
                    </button>
                  </div>
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
              <p className="text-sm text-gray-900 mt-1">
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