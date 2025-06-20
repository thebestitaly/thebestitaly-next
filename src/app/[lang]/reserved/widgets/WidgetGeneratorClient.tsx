"use client";

import React, { useState, useEffect } from "react";
import { Copy, Download, Eye, Code, Settings, Sparkles } from "lucide-react";

interface WidgetGeneratorClientProps {
  lang: string;
}

interface WidgetConfig {
  slug: string;
  type: 'destination' | 'company' | 'article';
  size: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark';
  languages: string[];
  customization: {
    showRating: boolean;
    showDescription: boolean;
    showLanguages: boolean;
    borderRadius: number;
    primaryColor: string;
  };
}

const AVAILABLE_LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function WidgetGeneratorClient({ lang }: WidgetGeneratorClientProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    slug: 'roma',
    type: 'destination',
    size: 'medium',
    theme: 'light',
    languages: ['it', 'en', 'fr'],
    customization: {
      showRating: true,
      showDescription: true,
      showLanguages: true,
      borderRadius: 8,
      primaryColor: '#0066cc'
    }
  });

  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'code'>('config');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Generate widget code
  useEffect(() => {
    const widgetId = `tbi-widget-${Date.now()}`;
    const languagesList = config.languages.join(',');
    
    const htmlCode = `<!-- TheBestItaly Widget -->
<div id="${widgetId}" 
     data-slug="${config.slug}" 
     data-type="${config.type}"
     data-size="${config.size}"
     data-theme="${config.theme}"
     data-languages="${languagesList}"
     data-show-rating="${config.customization.showRating}"
     data-show-description="${config.customization.showDescription}"
     data-show-languages="${config.customization.showLanguages}"
     data-border-radius="${config.customization.borderRadius}"
     data-primary-color="${config.customization.primaryColor}">
</div>

<script>
  (function() {
    if (!window.TBIWidgetLoaded) {
      const script = document.createElement('script');
      script.src = 'https://thebestitaly.eu/widgets/widget.js';
      script.onload = function() {
        window.TBIWidgetLoaded = true;
        new TheBestItalyWidget('${widgetId}');
      };
      document.head.appendChild(script);
    } else {
      new TheBestItalyWidget('${widgetId}');
    }
  })();
</script>`;

    setGeneratedCode(htmlCode);
  }, [config]);

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateCustomization = (key: keyof WidgetConfig['customization'], value: any) => {
    setConfig(prev => ({
      ...prev,
      customization: { ...prev.customization, [key]: value }
    }));
  };

  const toggleLanguage = (langCode: string) => {
    setConfig(prev => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter(l => l !== langCode)
        : [...prev.languages, langCode]
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thebestitaly-widget-${config.slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWidgetPreview = () => {
    const baseClasses = "border rounded-lg overflow-hidden shadow-lg transition-all duration-300";
    const themeClasses = config.theme === 'dark' 
      ? "bg-gray-900 text-white border-gray-700" 
      : "bg-white text-gray-900 border-gray-200";
    
    const sizeStyles = {
      small: "w-64 h-32",
      medium: "w-80 h-48", 
      large: "w-96 h-64"
    };

    return (
      <div className={`${baseClasses} ${themeClasses} ${sizeStyles[config.size]}`}
           style={{ borderRadius: `${config.customization.borderRadius}px` }}>
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">TBI</span>
              </div>
              <span className="font-semibold text-sm">TheBestItaly</span>
            </div>
            {config.customization.showRating && (
              <div className="flex text-yellow-400 text-xs">
                {'★'.repeat(5)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex-1">
          <h3 className="font-bold text-lg mb-1 capitalize">
            {config.slug.replace(/-/g, ' ')}
          </h3>
          {config.customization.showDescription && (
            <p className="text-sm opacity-75 mb-3">
              {config.type === 'destination' ? 'Scopri questa destinazione italiana' :
               config.type === 'company' ? 'Eccellenza italiana' : 'Articolo dal magazine'}
            </p>
          )}
          
          {config.customization.showLanguages && config.size !== 'small' && (
            <div className="flex flex-wrap gap-1 mb-3">
              {config.languages.slice(0, 4).map(langCode => {
                const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
                return (
                  <span key={langCode} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {lang?.flag} {lang?.name}
                  </span>
                );
              })}
              {config.languages.length > 4 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  +{config.languages.length - 4}
                </span>
              )}
            </div>
          )}
          
          <button 
            className="text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: config.customization.primaryColor }}
          >
            Scopri di più
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Widget Generator</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Crea widget personalizzati per integrare TheBestItaly nel tuo sito web. 
              Scegli tra 3 dimensioni e personalizza l'aspetto secondo le tue esigenze.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              {[
                { id: 'config', label: 'Configurazione', icon: Settings },
                { id: 'preview', label: 'Anteprima', icon: Eye },
                { id: 'code', label: 'Codice', icon: Code }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Configuration Panel */}
            {activeTab === 'config' && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurazione Widget</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Impostazioni Base</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug/ID</label>
                        <input
                          type="text"
                          value={config.slug}
                          onChange={(e) => updateConfig('slug', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="es. roma, firenze, azienda-123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select
                          value={config.type}
                          onChange={(e) => updateConfig('type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="destination">🏛️ Destinazione</option>
                          <option value="company">🏢 Azienda/POI</option>
                          <option value="article">📰 Articolo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensione</label>
                        <select
                          value={config.size}
                          onChange={(e) => updateConfig('size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="small">📱 Small (256x128px)</option>
                          <option value="medium">💻 Medium (320x192px)</option>
                          <option value="large">🖥️ Large (384x256px)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                        <select
                          value={config.theme}
                          onChange={(e) => updateConfig('theme', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">☀️ Chiaro</option>
                          <option value="dark">🌙 Scuro</option>
                        </select>
                      </div>
                    </div>

                    {/* Customization */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personalizzazione</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={config.customization.showRating}
                            onChange={(e) => updateCustomization('showRating', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Mostra valutazione</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={config.customization.showDescription}
                            onChange={(e) => updateCustomization('showDescription', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Mostra descrizione</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={config.customization.showLanguages}
                            onChange={(e) => updateCustomization('showLanguages', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Mostra lingue</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Raggio bordi: {config.customization.borderRadius}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={config.customization.borderRadius}
                          onChange={(e) => updateCustomization('borderRadius', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Colore primario</label>
                        <input
                          type="color"
                          value={config.customization.primaryColor}
                          onChange={(e) => updateCustomization('primaryColor', e.target.value)}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Languages Selection */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Lingue Supportate</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {AVAILABLE_LANGUAGES.map(lang => (
                        <label key={lang.code} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.languages.includes(lang.code)}
                            onChange={() => toggleLanguage(lang.code)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">{lang.flag}</span>
                          <span className="text-sm font-medium">{lang.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Panel */}
            {activeTab === 'preview' && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Anteprima Widget</h2>
                  <div className="flex justify-center items-center min-h-96">
                    {getWidgetPreview()}
                  </div>
                </div>
              </div>
            )}

            {/* Code Panel */}
            {activeTab === 'code' && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Codice Widget</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                          isCopied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                        <span>{isCopied ? 'Copiato!' : 'Copia'}</span>
                      </button>
                      <button
                        onClick={downloadCode}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Scarica</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                    <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                      {generatedCode}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Anteprima Live</h3>
                <div className="flex justify-center mb-4">
                  {getWidgetPreview()}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="font-medium capitalize">{config.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensione:</span>
                    <span className="font-medium capitalize">{config.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tema:</span>
                    <span className="font-medium capitalize">{config.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lingue:</span>
                    <span className="font-medium">{config.languages.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Istruzioni per l'integrazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-semibold mb-2">1. Copia il codice</h4>
                <p>Usa il tab "Codice" per copiare il codice HTML generato automaticamente.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Incolla nel tuo sito</h4>
                <p>Inserisci il codice nella pagina del tuo sito dove vuoi mostrare il widget.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Personalizza</h4>
                <p>Il widget si adatterà automaticamente e caricherà i contenuti in tempo reale.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 