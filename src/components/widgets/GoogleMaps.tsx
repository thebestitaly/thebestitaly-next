"use client";

import React from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapsProps {
  lat: number | string;
  lng: number | string;
  name: string;
  className?: string;
  height?: string;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  lat, 
  lng, 
  name, 
  className = '', 
  height = '300px' 
}) => {
  // Converti le coordinate in numeri e valida
  const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;

  // Verifica che le coordinate siano valide
  if (isNaN(numLat) || isNaN(numLng) || numLat === 0 || numLng === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        <div 
          className="p-8 text-center text-gray-900"
          style={{ height, minHeight: height }}
          role="img"
          aria-label="Mappa non disponibile"
        >
          <MapPin className="mx-auto mb-2 text-gray-300" size={40} aria-hidden="true" />
          <p>Coordinate non disponibili per questa destinazione</p>
        </div>
      </div>
    );
  }

  // URL per l'embed di Google Maps (senza API key per semplicità)
  const simpleEmbedUrl = `https://maps.google.com/maps?q=${numLat},${numLng}&hl=it&z=12&output=embed`;

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
      <div 
        className="relative" 
        style={{ height, minHeight: height }}
        role="application"
        aria-label={`Mappa interattiva che mostra la posizione di ${name}`}
      >
        <iframe
          src={simpleEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-b-lg"
          title={`Mappa di ${name}`}
          aria-label={`Mappa interattiva di ${name} alle coordinate ${numLat}, ${numLng}`}
        />
      </div>
      
      <div className="p-2 bg-gray-50 text-xs text-gray-900 text-center">
        <div className="flex items-center justify-center gap-4">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${numLat},${numLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={`Apri ${name} in Google Maps in una nuova finestra`}
          >
            Visualizza su Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleMaps; 