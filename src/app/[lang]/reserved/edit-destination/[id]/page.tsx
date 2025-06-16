"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import directusClient from "../../../../../lib/directus";

export default function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [destinationId, setDestinationId] = useState<string>('');
  const [destination, setDestination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Error loading destination:', error);
      alert('Errore nel caricamento della destinazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    try {
      const response = await fetch(`/it/api/translate-destinations/${destinationId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('✅ Traduzione avviata con successo!');
      } else {
        throw new Error('Errore nella traduzione');
      }
    } catch (error) {
      console.error('Error translating:', error);
      alert('❌ Errore nella traduzione');
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

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
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

            {/* Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleTranslate}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚀 Traduci in Tutte le Lingue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 