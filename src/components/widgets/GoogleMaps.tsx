"use client";

import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapsProps {
  lat: number | string;
  lng: number | string;
  name: string;
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  lat, 
  lng, 
  name, 
  className = '', 
  height = '400px' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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
        <div className="p-8 text-center text-gray-500">
          <MapPin className="mx-auto mb-2 text-gray-300" size={40} />
          <p>Coordinate non disponibili per questa destinazione</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Carica l'API di Google Maps se non è già caricata
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeMap();
        };
        
        script.onerror = () => {
          console.error('Errore nel caricamento di Google Maps');
        };
        
        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapOptions = {
        center: { lat: numLat, lng: numLng },
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }]
          }
        ]
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Aggiungi un marker per la destinazione
      const marker = new window.google.maps.Marker({
        position: { lat: numLat, lng: numLng },
        map: map,
        title: name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="4"/>
              <path d="M20 10C16.134 10 13 13.134 13 17C13 21.5 20 30 20 30S27 21.5 27 17C27 13.134 23.866 10 20 10ZM20 20C18.343 20 17 18.657 17 17S18.343 14 20 14S23 15.343 23 17S21.657 20 20 20Z" fill="white"/>
            </svg>
          `)
        }
      });

      // Info window con informazioni sulla destinazione
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${name}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Coordinate: ${numLat.toFixed(6)}, ${numLng.toFixed(6)}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    };

    loadGoogleMaps();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        // Google Maps non ha un metodo di cleanup diretto
        // ma possiamo resettare il contenitore
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
      }
    };
  }, [numLat, numLng, name]);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <MapPin className="mr-2 text-blue-600" size={20} />
          Mappa di {name}
        </h3>
      </div>
      
      <div 
        ref={mapRef}
        style={{ height }}
        className="w-full"
      >
        {/* Fallback content mentre la mappa si carica */}
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 text-gray-400" size={40} />
            <p className="text-gray-500">Caricamento mappa...</p>
          </div>
        </div>
      </div>
      
      <div className="p-2 bg-gray-50 text-xs text-gray-500 text-center">
        Coordinate: {numLat.toFixed(6)}, {numLng.toFixed(6)}
      </div>
    </div>
  );
};

export default GoogleMaps; 