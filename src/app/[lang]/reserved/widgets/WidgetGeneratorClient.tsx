"use client";

import React, { useState, useEffect } from "react";
import { Copy, Download, Eye, Code, Settings, Sparkles, Globe } from "lucide-react";

interface WidgetGeneratorClientProps {
  lang: string;
}

interface WidgetConfig {
  type: 'destination' | 'company' | 'article';
  id: string;
  size: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  showLanguageSelector: boolean;
}

const AVAILABLE_LANGUAGES = [
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'tk', name: 'Türkmençe', flag: '🇹🇲' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼' }
];

export default function WidgetGeneratorClient({ lang }: WidgetGeneratorClientProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    type: 'destination',
    id: 'roma',
    size: 'medium',
    theme: 'light',
    language: 'it',
    showLanguageSelector: true
  });

  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'code'>('config');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Generate widget code
  useEffect(() => {
    const widgetId = `tbi-widget-${Date.now()}`;
    
    const htmlCode = `<!-- TheBestItaly Widget -->
<div id="${widgetId}" 
     data-tbi-widget
     data-type="${config.type}"
     data-id="${config.id}"
     data-size="${config.size}"
     data-theme="${config.theme}"
     data-language="${config.language}"
     data-show-selector="${config.showLanguageSelector}">
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
    a.download = `thebestitaly-widget-${config.type}-${config.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPreviewWidget = () => {
    const sizeClasses = {
      small: 'w-80 h-32',
      medium: 'w-96 h-48',
      large: 'w-full h-64'
    };

    const themeClasses = {
      light: 'bg-white text-gray-900 border-gray-200',
      dark: 'bg-gray-900 text-white border-gray-700',
      auto: 'bg-white text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700'
    };

    return (
      <div className={`${sizeClasses[config.size]} ${themeClasses[config.theme]} border rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg">TheBestItaly</span>
            </div>
            {config.showLanguageSelector && (
              <div className="flex items-center space-x-1 bg-white/20 rounded-lg px-2 py-1">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {AVAILABLE_LANGUAGES.find(l => l.code === config.language)?.flag}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          <h3 className="font-bold text-xl mb-2 capitalize">
            {config.id.replace(/-/g, ' ')}
          </h3>
          <p className="text-sm opacity-75 mb-4">
            {config.type === 'destination' ? 'Scopri questa meravigliosa destinazione italiana' :
             config.type === 'company' ? 'Eccellenza del Made in Italy' : 
             'Articolo dal nostro magazine'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">Disponibile in 50+ lingue</span>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Scopri di più
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Widget Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Crea widget personalizzati per il tuo sito web con supporto per tutte le 50+ lingue disponibili
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            {[
              { id: 'config', label: 'Configurazione', icon: Settings },
              { id: 'preview', label: 'Anteprima', icon: Eye },
              { id: 'code', label: 'Codice', icon: Code }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          {activeTab === 'config' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurazione Widget</h2>
              
              <div className="space-y-6">
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di Contenuto</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'destination', label: 'Destinazione', icon: '🏛️' },
                      { value: 'company', label: 'Azienda', icon: '🏢' },
                      { value: 'article', label: 'Articolo', icon: '📰' }
                    ].map(type => (
                      <button
                        key={type.value}
                        onClick={() => setConfig(prev => ({ ...prev, type: type.value as any }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          config.type === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Contenuto</label>
                  <input
                    type="text"
                    value={config.id}
                    onChange={(e) => setConfig(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. roma, firenze, 123"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Dimensione</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'small', label: 'Piccolo', size: '320px' },
                      { value: 'medium', label: 'Medio', size: '384px' },
                      { value: 'large', label: 'Grande', size: '100%' }
                    ].map(size => (
                      <button
                        key={size.value}
                        onClick={() => setConfig(prev => ({ ...prev, size: size.value as any }))}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          config.size === size.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{size.label}</div>
                        <div className="text-xs text-gray-500">{size.size}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Chiaro', icon: '☀️' },
                      { value: 'dark', label: 'Scuro', icon: '🌙' },
                      { value: 'auto', label: 'Auto', icon: '🔄' }
                    ].map(theme => (
                      <button
                        key={theme.value}
                        onClick={() => setConfig(prev => ({ ...prev, theme: theme.value as any }))}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          config.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg mb-1">{theme.icon}</div>
                        <div className="font-medium">{theme.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lingua Iniziale</label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Selettore Lingue</label>
                    <p className="text-xs text-gray-500">Mostra il menu per cambiare lingua</p>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, showLanguageSelector: !prev.showLanguageSelector }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.showLanguageSelector ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.showLanguageSelector ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {activeTab === 'preview' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Anteprima Widget</h2>
              <div className="flex justify-center">
                {getPreviewWidget()}
              </div>
            </div>
          )}

          {/* Code Panel */}
          {activeTab === 'code' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Codice HTML</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isCopied
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>{isCopied ? 'Copiato!' : 'Copia'}</span>
                  </button>
                  <button
                    onClick={downloadCode}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Scarica</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              </div>
            </div>
          )}

          {/* Right Column - Always show current preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview Live</h2>
            <div className="flex justify-center">
              {getPreviewWidget()}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-blue-800">Lingue Supportate</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-green-800">Responsive</div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">📝 Note Importanti</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li><strong>URL Aziende:</strong> Tutte le aziende usano il formato <code className="bg-yellow-100 px-1 rounded">/poi/slug</code> indipendentemente dall'ID</li>
                <li><strong>Dropdown Lingue:</strong> Sempre visibile per default - niente pulsante "Scopri di più", solo selezione diretta delle lingue</li>
                <li><strong>Contenuto Integrato:</strong> I widget grandi caricano il contenuto completo della pagina direttamente dal database</li>
                <li><strong>Dati Real-time:</strong> Tutti i contenuti vengono caricati live dall'API di TheBestItaly</li>
                <li><strong>Grafica Migliorata:</strong> Widget piccoli non più tagliati, dimensioni ottimizzate per tutti i formati</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 