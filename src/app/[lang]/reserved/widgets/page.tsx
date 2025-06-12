// file: src/app/reserved/widgets/page.tsx

"use client";

import React, { useState, useEffect } from "react";

const languages = [
  "it", "en", "fr", "de", "es", "pt", "zh", "ja", "ar", "ru",
];

interface Destination {
  id: string;
  slug: string;
  slugMap: { [key: string]: string };
  name: string;
  type: string;
}

export default function WidgetGeneratorPage() {
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("destination");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce search
  useEffect(() => {
    if (type === "destination" && searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchDestinations(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDestinations([]);
      setShowDropdown(false);
    }
  }, [searchQuery, type]);

  const searchDestinations = async (query: string) => {
    setLoading(true);
    try {
      // Use Directus search filter - get all translations
      const searchUrl = `/api/directus/items/destinations?` + new URLSearchParams({
        'filter[translations][destination_name][_icontains]': query,
        'fields[]': [
          'id',
          'type',
          'region_id.translations.slug_permalink',
          'region_id.translations.languages_code',
          'province_id.translations.slug_permalink', 
          'province_id.translations.languages_code',
          'translations.destination_name',
          'translations.slug_permalink',
          'translations.languages_code'
        ].join(','),
        'limit': '10',
        'sort': 'translations.destination_name'
      });
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      // Map the data to our expected format with all translations
      const mappedDestinations = (data.data || []).map((dest: any) => {
        // Get Italian name for display
        const italianTranslation = dest.translations?.find((t: any) => t.languages_code === 'it');
        const displayName = italianTranslation?.destination_name || 
                           dest.translations?.[0]?.destination_name || 
                           'Nome non disponibile';
        
        // Create slug map for all languages
        const slugMap: { [key: string]: string } = {};
        dest.translations?.forEach((translation: any) => {
          if (translation.slug_permalink && translation.languages_code) {
            // Build full path based on destination type
            let fullSlug = translation.slug_permalink;
            
            if (dest.type === 'province' && dest.region_id?.translations) {
              const regionTranslation = dest.region_id.translations.find(
                (t: any) => t.languages_code === translation.languages_code
              );
              if (regionTranslation?.slug_permalink) {
                fullSlug = `${regionTranslation.slug_permalink}/${translation.slug_permalink}`;
              }
            } else if (dest.type === 'municipality' && dest.region_id?.translations && dest.province_id?.translations) {
              const regionTranslation = dest.region_id.translations.find(
                (t: any) => t.languages_code === translation.languages_code
              );
              const provinceTranslation = dest.province_id.translations.find(
                (t: any) => t.languages_code === translation.languages_code
              );
              if (regionTranslation?.slug_permalink && provinceTranslation?.slug_permalink) {
                fullSlug = `${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${translation.slug_permalink}`;
              }
            }
            
            slugMap[translation.languages_code] = fullSlug;
          }
        });
        
        return {
          id: dest.id,
          slug: slugMap.it || dest.translations?.[0]?.slug_permalink || '',
          slugMap, // All slugs for all languages
          name: displayName,
          type: dest.type
        };
      });
      
      setDestinations(mappedDestinations);
      setShowDropdown(true);
    } catch (error) {
      console.error('Errore nella ricerca destinazioni:', error);
      setDestinations([]);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    const widgetCode = document.getElementById("widget-code")?.textContent;
    if (widgetCode) {
      await navigator.clipboard.writeText(widgetCode);
      alert("Codice widget copiato negli appunti!");
    }
  };

  const renderWidgetCode = () => {
    if (!slug) return "";
    
    const widgetId = `tbi-widget-${Date.now()}`;
    const baseUrl = `https://thebestitaly.eu`;
    
    return `<!-- TheBestItaly Widget -->
<div id="${widgetId}" data-slug="${slug}" data-type="${type}"></div>
<script>
(function() {
  const script = document.createElement('script');
  script.src = '${baseUrl}/widgets/widget.js';
  script.async = true;
  script.onload = function() {
    if (window.TheBestItalyWidget) {
      window.TheBestItalyWidget.init('${widgetId}');
    }
  };
  document.head.appendChild(script);
})();
</script>
<!-- End Widget -->`;
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Generatore Widget TheBestItaly</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Tipo:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="destination">Destinazione</option>
              <option value="companies">Azienda</option>
            </select>
          </div>

          {type === "destination" ? (
            <div className="relative">
              <label className="block font-semibold mb-2">Destinazione:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length < 2) {
                    setSlug("");
                  }
                }}
                placeholder="Cerca destinazione (min. 2 caratteri)..."
                className="border p-2 rounded w-full"
                onFocus={() => {
                  if (destinations.length > 0) setShowDropdown(true);
                }}
                onBlur={() => {
                  // Delay hiding dropdown to allow clicks
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              />
              
              {loading && (
                <div className="absolute right-3 top-11 text-gray-900">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
              )}
              
              {showDropdown && destinations.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-48 overflow-y-auto">
                  {destinations.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                      onClick={() => {
                        setSlug(dest.slugMap.it || dest.slug);
                        setSearchQuery(dest.name);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="font-medium">{dest.name}</div>
                      <div className="text-sm text-gray-900">{dest.slug}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && !loading && destinations.length === 0 && (
                <div className="text-sm text-gray-900 mt-1">
                  Nessuna destinazione trovata per "{searchQuery}"
                </div>
              )}
              
              {searchQuery.length > 0 && searchQuery.length < 2 && (
                <div className="text-sm text-gray-900 mt-1">
                  Digita almeno 2 caratteri per cercare
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block font-semibold mb-2">Slug azienda:</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="es. nome-azienda"
                className="border p-2 rounded w-full"
              />
            </div>
          )}

          {slug && (
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Anteprima URL:</h3>
              <div className="text-sm text-green-600 space-y-1">
                {type === "destination" ? (
                  // For destinations, use the correct slugs for each language
                  (() => {
                    const selectedDestination = destinations.find(d => d.slugMap.it === slug || d.slug === slug);
                    if (selectedDestination?.slugMap) {
                      return languages.slice(0, 5).map(lang => {
                        const langSlug = selectedDestination.slugMap[lang];
                        return langSlug ? (
                          <div key={lang}>
                            <strong>{lang.toUpperCase()}:</strong> https://thebestitaly.eu/{lang}/{langSlug}/
                          </div>
                        ) : null;
                      }).filter(Boolean);
                    }
                    return languages.slice(0, 3).map(lang => (
                      <div key={lang}>
                        <strong>{lang.toUpperCase()}:</strong> https://thebestitaly.eu/{lang}/poi/{slug}/
                      </div>
                    ));
                  })()
                ) : (
                  // For companies, use the simple structure
                  languages.slice(0, 3).map(lang => (
                    <div key={lang}>
                      <strong>{lang.toUpperCase()}:</strong> https://thebestitaly.eu/{lang}/poi/{slug}/
                    </div>
                  ))
                )}
                {languages.length > 5 && (
                  <div className="text-xs text-gray-900">+ altre {languages.length - 5} lingue</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          {slug && (
            <>
              <h2 className="text-lg font-semibold mb-2">Codice HTML del widget:</h2>
              <pre
                id="widget-code"
                className="bg-gray-100 p-4 rounded overflow-auto text-sm mb-4 max-h-64"
              >
                {renderWidgetCode()}
              </pre>
              <button
                onClick={handleCopy}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                📋 Copia codice widget
              </button>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold text-yellow-800 mb-2">Come usare:</h3>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Copia il codice sopra</li>
                  <li>2. Incollalo nel tuo sito web</li>
                  <li>3. Il widget si caricherà automaticamente</li>
                  <li>4. Gli utenti potranno scegliere la lingua</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}