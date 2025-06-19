// file: src/app/reserved/widgets/page.tsx

"use client";

import React, { useState, useEffect } from "react";

// Lingue supportate: Italiano + le 47 lingue specificate
const ALL_LANGUAGES = [
  'it', 'en', 'fr', 'es', 'pt', 'de', 'nl', 'ro', 'sv', 'pl', 'vi', 'id', 'el', 'uk', 'ru', 'bn', 
  'zh', 'hi', 'ar', 'fa', 'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk', 'sl', 
  'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk', 'az', 'ka', 'hy', 'is', 'sw', 'zh-tw', 'tk', 'hu'
];

// Nomi delle lingue per display
const LANGUAGE_NAMES: Record<string, string> = {
  'it': 'Italian',
  'en': 'English',
  'fr': 'French', 
  'es': 'Spanish',
  'pt': 'Portuguese',
  'de': 'German',
  'nl': 'Dutch',
  'ro': 'Romanian',
  'sv': 'Swedish',
  'pl': 'Polish',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'el': 'Greek',
  'uk': 'Ukrainian',
  'ru': 'Russian',
  'bn': 'Bengali',
  'zh': 'Chinese (Simplified)',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'fa': 'Persian',
  'ur': 'Urdu',
  'ja': 'Japanese',
  'ko': 'Korean',
  'am': 'Amharic',
  'cs': 'Czech',
  'da': 'Danish',
  'fi': 'Finnish',
  'af': 'Afrikaans',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sr': 'Serbian',
  'th': 'Thai',
  'ms': 'Malay',
  'tl': 'Tagalog',
  'he': 'Hebrew',
  'ca': 'Catalan',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'sw': 'Swahili',
  'zh-tw': 'Chinese (Traditional)',
  'tk': 'Turkmen',
  'hu': 'Hungarian'
};

interface Destination {
  id: string;
  slug: string;
  slugMap: { [key: string]: string };
  name: string;
  type: string;
}

interface Company {
  id: string;
  slug: string;
  name: string;
}

export default function WidgetGeneratorPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("destination");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['it', 'en', 'fr', 'de', 'es']);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [widgetSize, setWidgetSize] = useState("medium");
  const [widgetTheme, setWidgetTheme] = useState("light");
  const [testMode, setTestMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        if (type === "destination") {
          searchDestinations(searchQuery);
        } else {
          searchCompanies(searchQuery);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDestinations([]);
      setCompanies([]);
      setShowDropdown(false);
    }
  }, [searchQuery, type]);

  const searchDestinations = async (query: string) => {
    setLoading(true);
    try {
      const searchUrl = `/api/directus/items/destinations?` + new URLSearchParams({
        'filter[translations][destination_name][_icontains]': query,
        'fields[]': [
          'id', 'type',
          'region_id.translations.slug_permalink', 'region_id.translations.languages_code',
          'province_id.translations.slug_permalink', 'province_id.translations.languages_code',
          'translations.destination_name', 'translations.slug_permalink', 'translations.languages_code'
        ].join(','),
        'limit': '10',
        'sort': 'translations.destination_name'
      });
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      const mappedDestinations = (data.data || []).map((dest: any) => {
        const italianTranslation = dest.translations?.find((t: any) => t.languages_code === 'it');
        const displayName = italianTranslation?.destination_name || 
                           dest.translations?.[0]?.destination_name || 
                           'Nome non disponibile';
        
        const slugMap: { [key: string]: string } = {};
        dest.translations?.forEach((translation: any) => {
          if (translation.slug_permalink && translation.languages_code) {
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
          slugMap,
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

  const searchCompanies = async (query: string) => {
    setLoading(true);
    try {
      const searchUrl = `/api/directus/items/companies?` + new URLSearchParams({
        'filter[company_name][_icontains]': query,
        'fields[]': ['id', 'company_name', 'slug_permalink'].join(','),
        'limit': '10',
        'sort': 'company_name'
      });
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      const mappedCompanies = (data.data || []).map((company: any) => ({
        id: company.id,
        slug: company.slug_permalink || '',
        name: company.company_name || 'Nome non disponibile'
      }));
      
      setCompanies(mappedCompanies);
      setShowDropdown(true);
    } catch (error) {
      console.error('Errore nella ricerca aziende:', error);
      setCompanies([]);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    const widgetCode = document.getElementById("widget-code")?.textContent;
    if (widgetCode) {
      await navigator.clipboard.writeText(widgetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const renderWidgetCode = () => {
    if (!slug) return "";
    
    const widgetId = `tbi-widget-${Date.now()}`;
    const baseUrl = `https://thebestitaly.eu`;
    
    return `<!-- TheBestItaly Widget -->
<div id="${widgetId}" 
     data-slug="${slug}" 
     data-type="${type}"
     data-size="${widgetSize}"
     data-theme="${widgetTheme}"
     data-languages="${selectedLanguages.join(',')}"
     style="max-width: 100%; margin: 20px 0;">
</div>
<script>
(function() {
  const script = document.createElement('script');
  script.src = '${baseUrl}/widgets/widget.js?v=2.0';
  script.async = true;
  script.onload = function() {
    if (window.TheBestItalyWidget) {
      window.TheBestItalyWidget.init('${widgetId}');
    }
  };
  document.head.appendChild(script);
})();
</script>
<!-- End TheBestItaly Widget -->`;
  };

  const renderTestWidget = () => {
    if (!slug || !testMode) return null;
    
    const baseUrl = "https://thebestitaly.eu";
    const logoUrl = "/images/logo-black.webp";
    
    // Widget Small
    const SmallWidget = () => (
      <div className="bg-white border rounded-lg p-3 shadow-sm max-w-sm">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="TheBestItaly" className="h-6 w-auto" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {searchQuery}
            </div>
          </div>
          <select className="text-xs border rounded px-2 py-1 bg-white">
            {selectedLanguages.slice(0, 5).map(lang => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    );

    // Widget Medium
    const MediumWidget = () => (
      <div className="bg-white border rounded-xl p-4 shadow-md max-w-md">
        <div className="flex items-center gap-4 mb-3">
          <img src={logoUrl} alt="TheBestItaly" className="h-8 w-auto" />
          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900">
              {searchQuery}
            </div>
            <div className="text-xs text-gray-500">
              {type === 'destination' ? 'Destinazione' : 'Eccellenza'} italiana
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Scegli lingua:</span>
          <div className="flex gap-1">
            {selectedLanguages.slice(0, 6).map(lang => (
              <button key={lang} className="w-6 h-6 rounded border bg-gray-50 hover:bg-blue-50 text-xs font-medium">
                {lang.toUpperCase().slice(0, 2)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    // Widget Full
    const FullWidget = () => (
      <div className="bg-white border rounded-2xl shadow-lg max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4 mb-4">
            <img src={logoUrl} alt="TheBestItaly" className="h-10 w-auto" />
            <div className="flex-1">
              <div className="text-xl font-bold text-gray-900">
                {searchQuery}
              </div>
              <div className="text-sm text-gray-600">
                Scopri le eccellenze italiane con TheBestItaly
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Lingue disponibili:</span>
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.slice(0, 8).map(lang => (
                <span key={lang} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {LANGUAGE_NAMES[lang]}
                </span>
              ))}
              {selectedLanguages.length > 8 && (
                <span className="text-xs text-gray-500">+{selectedLanguages.length - 8} altre</span>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Articoli in Evidenza</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Articolo di esempio {i}
                  </div>
                  <div className="text-xs text-gray-600">
                    Breve descrizione dell'articolo correlato...
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Vedi tutti gli articoli →
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Anteprima Widget - {widgetSize.charAt(0).toUpperCase() + widgetSize.slice(1)}
          </h3>
          <p className="text-sm text-blue-600">
            {type === 'destination' ? 'Destinazione' : 'Azienda'}: <strong>{searchQuery}</strong> | 
            Tema: {widgetTheme} | Lingue: {selectedLanguages.length}
          </p>
        </div>

        <div className="flex justify-center">
          {widgetSize === 'small' && <SmallWidget />}
          {widgetSize === 'medium' && <MediumWidget />}
          {widgetSize === 'large' && <FullWidget />}
        </div>

        {/* Link al confronto dimensioni */}
        <div className="mt-6 text-center">
          <a 
            href={`/${lang}/reserved/widgets/compare`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            Confronta Dimensioni Widget
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Generatore Widget TheBestItaly
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Crea widget personalizzati per il tuo sito web e condividi le bellezze d'Italia con i tuoi visitatori
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{ALL_LANGUAGES.length} Lingue</h3>
                <p className="text-gray-600">Supporto multilingue completo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <p className="text-gray-600">Caricamento veloce e ottimizzato</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Responsive</h3>
                <p className="text-gray-600">Adatto a tutti i dispositivi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurazione Widget
            </h2>

            <div className="space-y-6">
              {/* Tipo Widget */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo di Widget:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setType("destination")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      type === "destination" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="font-medium">Destinazione</div>
                      <div className="text-xs text-gray-500">Regioni, Province, Città</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setType("companies")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      type === "companies" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="font-medium">Azienda</div>
                      <div className="text-xs text-gray-500">Eccellenze italiane</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {type === "destination" ? "Cerca Destinazione:" : "Cerca Azienda:"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length < 2) {
                        setSlug("");
                      }
                    }}
                    placeholder={`Cerca ${type === "destination" ? "destinazione" : "azienda"} (min. 2 caratteri)...`}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onFocus={() => {
                      if ((type === "destination" ? destinations : companies).length > 0) setShowDropdown(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowDropdown(false), 200);
                    }}
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {loading && (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {showDropdown && (type === "destination" ? destinations : companies).length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1">
                    {(type === "destination" ? destinations : companies).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        onClick={() => {
                          if (type === "destination") {
                            const dest = item as Destination;
                            setSlug(dest.slugMap.it || dest.slug);
                          } else {
                            setSlug(item.slug);
                          }
                          setSearchQuery(item.name);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.slug}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Widget Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensione:</label>
                  <select
                    value={widgetSize}
                    onChange={(e) => setWidgetSize(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Small - Logo + Nome + Lingue</option>
                    <option value="medium">Medium - Logo + Info + Bandiere</option>
                    <option value="large">Large/Full - Completo + Articoli</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tema:</label>
                  <select
                    value={widgetTheme}
                    onChange={(e) => setWidgetTheme(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Chiaro</option>
                    <option value="dark">Scuro</option>
                    <option value="auto">Automatico</option>
                  </select>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Lingue Supportate ({selectedLanguages.length}/{ALL_LANGUAGES.length}):
                  </label>
                  <button
                    onClick={() => setShowAllLanguages(!showAllLanguages)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showAllLanguages ? 'Mostra meno' : 'Mostra tutte'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {(showAllLanguages ? ALL_LANGUAGES : ALL_LANGUAGES.slice(0, 12)).map(lang => (
                    <label key={lang} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {lang.toUpperCase()} - {LANGUAGE_NAMES[lang]}
                      </span>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedLanguages(ALL_LANGUAGES)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                  >
                    Seleziona tutte
                  </button>
                  <button
                    onClick={() => setSelectedLanguages(['it', 'en'])}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                  >
                    Solo IT/EN
                  </button>
                  <button
                    onClick={() => setSelectedLanguages([])}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200"
                  >
                    Deseleziona tutte
                  </button>
                </div>
              </div>

              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Modalità Test</div>
                  <div className="text-sm text-gray-600">Visualizza anteprima del widget</div>
                </div>
                <button
                  onClick={() => setTestMode(!testMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    testMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    testMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {/* Preview */}
            {slug && testMode && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Anteprima Widget
                </h3>
                {renderTestWidget()}
              </div>
            )}

            {/* URLs Preview */}
            {slug && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  URL di Esempio
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedLanguages.slice(0, 8).map(lang => {
                    let url = '';
                    if (type === "destination") {
                      const selectedDestination = destinations.find(d => d.slugMap.it === slug || d.slug === slug);
                      const langSlug = selectedDestination?.slugMap[lang] || slug;
                      url = `https://thebestitaly.eu/${lang}/${langSlug}/`;
                    } else {
                      url = `https://thebestitaly.eu/${lang}/poi/${slug}/`;
                    }
                    
                    return (
                      <div key={lang} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-blue-600">{lang.toUpperCase()}</span>
                          <span className="text-gray-500 ml-2">{LANGUAGE_NAMES[lang]}</span>
                        </div>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs"
                        >
                          {url}
                        </a>
                      </div>
                    );
                  })}
                  {selectedLanguages.length > 8 && (
                    <div className="text-center text-gray-500 text-sm py-2">
                      + altre {selectedLanguages.length - 8} lingue
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Widget Code */}
            {slug && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Codice HTML
                  </h3>
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      copied 
                        ? "bg-green-500 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copiato!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copia Codice
                      </>
                    )}
                  </button>
                </div>
                
                <pre
                  id="widget-code"
                  className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono max-h-64 border"
                >
                  {renderWidgetCode()}
                </pre>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Istruzioni per l'uso:
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Copia il codice HTML sopra</li>
                    <li>Incollalo nella tua pagina web dove vuoi mostrare il widget</li>
                    <li>Il widget si caricherà automaticamente</li>
                    <li>I visitatori potranno navigare nelle {selectedLanguages.length} lingue selezionate</li>
                    <li>Il widget è completamente responsive e si adatta a tutti i dispositivi</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}