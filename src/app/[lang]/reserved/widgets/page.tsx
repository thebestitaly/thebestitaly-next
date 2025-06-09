// file: src/app/reserved/widgets/page.tsx

"use client";

import React, { useState, useEffect } from "react";

const languages = [
  "it", "en", "fr", "de", "es", "pt", "zh", "ja", "ar", "ru",
];

interface Destination {
  id: string;
  slug: string;
  name: string;
}

export default function WidgetGeneratorPage() {
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("destination");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

  // Carica destinazioni da Directus
  useEffect(() => {
    if (type === "destination") {
      fetchDestinations();
    }
  }, [type]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/directus/destinations');
      const data = await response.json();
      setDestinations(data.data || []);
    } catch (error) {
      console.error('Errore nel caricamento destinazioni:', error);
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
            <div>
              <label className="block font-semibold mb-2">Destinazione:</label>
              {loading ? (
                <p>Caricamento destinazioni...</p>
              ) : (
                <select
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Seleziona una destinazione</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.slug}>
                      {dest.name}
                    </option>
                  ))}
                </select>
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
                {languages.slice(0, 3).map(lang => (
                  <div key={lang}>
                    <strong>{lang.toUpperCase()}:</strong> https://thebestitaly.eu/{lang}/{type}/{slug}
                  </div>
                ))}
                <div className="text-xs text-gray-500">+ altre {languages.length - 3} lingue</div>
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