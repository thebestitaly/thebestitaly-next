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
  height = '400px' 
}) => {
  // Converti le coordinate in numeri e valida
  const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;

  // Verifica che le coordinate siano valide
  if (isNaN(numLat) || isNaN(numLng) || numLat === 0 || numLng === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <MapPin className="mr-2 text-gray-400" size={20} />
            Mappa di {name}
          </h3>
        </div>
        <div className="p-8 text-center text-gray-900">
          <MapPin className="mx-auto mb-2 text-gray-300" size={40} />
          <p>Coordinate non disponibili per questa destinazione</p>
        </div>
      </div>
    );
  }

  // URL per l'embed di Google Maps
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=&q=${numLat},${numLng}&zoom=12&maptype=roadmap`;
  
  // URL alternativo senza API key (più semplice)
  const simpleEmbedUrl = `https://maps.google.com/maps?q=${numLat},${numLng}&hl=it&z=12&output=embed`;

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <MapPin className="mr-2 text-blue-600" size={20} />
          Mappa di {name}
        </h3>
      </div>
      
      <div className="relative" style={{ height }}>
        <iframe
          src={simpleEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mappa di ${name}`}
          className="rounded-b-lg"
        />
      </div>
      
      <div className="p-2 bg-gray-50 text-xs text-gray-900 text-center">
        <div className="flex items-center justify-center gap-4">
          <span>Coordinate: {numLat.toFixed(6)}, {numLng.toFixed(6)}</span>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${numLat},${numLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Visualizza su Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleMaps; 