(function() {
  'use strict';

  const CONFIG = {
    baseUrl: 'https://thebestitaly.eu',
    apiUrl: 'https://thebestitaly.eu/api',
    logoUrl: 'https://thebestitaly.eu/images/logo-black.webp',
    version: '2.0'
  };

  const LANGUAGES = {
    'af': { name: 'Afrikaans', flag: '🇿🇦' },
    'am': { name: 'Amharic', flag: '🇪🇹' },
    'ar': { name: 'العربية', flag: '🇸🇦' },
    'az': { name: 'Azərbaycan', flag: '🇦🇿' },
    'bg': { name: 'Български', flag: '🇧🇬' },
    'bn': { name: 'বাংলা', flag: '🇧🇩' },
    'ca': { name: 'Català', flag: '🇪🇸' },
    'cs': { name: 'Čeština', flag: '🇨🇿' },
    'da': { name: 'Dansk', flag: '🇩🇰' },
    'de': { name: 'Deutsch', flag: '🇩🇪' },
    'el': { name: 'Ελληνικά', flag: '🇬🇷' },
    'en': { name: 'English', flag: '🇬🇧' },
    'es': { name: 'Español', flag: '🇪🇸' },
    'et': { name: 'Eesti', flag: '🇪🇪' },
    'fa': { name: 'فارسی', flag: '🇮🇷' },
    'fi': { name: 'Suomi', flag: '🇫🇮' },
    'fr': { name: 'Français', flag: '🇫🇷' },
    'he': { name: 'עברית', flag: '🇮🇱' },
    'hi': { name: 'हिन्दी', flag: '🇮🇳' },
    'hr': { name: 'Hrvatski', flag: '🇭🇷' },
    'hu': { name: 'Magyar', flag: '🇭🇺' },
    'hy': { name: 'Հայերեն', flag: '🇦🇲' },
    'id': { name: 'Bahasa Indonesia', flag: '🇮🇩' },
    'is': { name: 'Íslenska', flag: '🇮🇸' },
    'it': { name: 'Italiano', flag: '🇮🇹' },
    'ja': { name: '日本語', flag: '🇯🇵' },
    'ka': { name: 'ქართული', flag: '🇬🇪' },
    'ko': { name: '한국어', flag: '🇰🇷' },
    'lt': { name: 'Lietuvių', flag: '🇱🇹' },
    'lv': { name: 'Latviešu', flag: '🇱🇻' },
    'mk': { name: 'Македонски', flag: '🇲🇰' },
    'ms': { name: 'Bahasa Melayu', flag: '🇲🇾' },
    'nl': { name: 'Nederlands', flag: '🇳🇱' },
    'no': { name: 'Norsk', flag: '🇳🇴' },
    'pl': { name: 'Polski', flag: '🇵🇱' },
    'pt': { name: 'Português', flag: '🇵🇹' },
    'ro': { name: 'Română', flag: '🇷🇴' },
    'ru': { name: 'Русский', flag: '🇷🇺' },
    'sk': { name: 'Slovenčina', flag: '🇸🇰' },
    'sl': { name: 'Slovenščina', flag: '🇸🇮' },
    'sr': { name: 'Српски', flag: '🇷🇸' },
    'sv': { name: 'Svenska', flag: '🇸🇪' },
    'sw': { name: 'Kiswahili', flag: '🇹🇿' },
    'th': { name: 'ไทย', flag: '🇹🇭' },
    'tk': { name: 'Türkmençe', flag: '🇹🇲' },
    'tl': { name: 'Filipino', flag: '🇵🇭' },
    'tr': { name: 'Türkçe', flag: '🇹🇷' },
    'uk': { name: 'Українська', flag: '🇺🇦' },
    'ur': { name: 'اردو', flag: '🇵🇰' },
    'vi': { name: 'Tiếng Việt', flag: '🇻🇳' },
    'zh': { name: '中文', flag: '🇨🇳' }
  };

  class TheBestItalyWidget {
    constructor(elementId) {
      this.elementId = elementId;
      this.element = document.getElementById(elementId);
      this.config = this.parseConfig();
      this.currentLang = 'it';
      this.data = null;
      
      if (!this.element) {
        console.error('TheBestItaly Widget: Element not found:', elementId);
        return;
      }

      this.init();
    }

    parseConfig() {
      const el = this.element;
      return {
        slug: el.dataset.slug || '',
        type: el.dataset.type || 'destination',
        size: el.dataset.size || 'medium',
        theme: el.dataset.theme || 'light',
        languages: el.dataset.languages ? el.dataset.languages.split(',') : ['it', 'en']
      };
    }

    async init() {
      try {
        this.showLoading();
        await this.fetchData();
        this.render();
      } catch (error) {
        console.error('TheBestItaly Widget Error:', error);
        this.showError();
      }
    }

    async fetchData() {
      this.data = {
        name: this.config.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: 'Scopri questa eccellenza italiana',
        image: null
      };
    }

    showLoading() {
      this.element.innerHTML = '<div class="tbi-widget tbi-loading"><div class="tbi-spinner"></div><span>Caricamento...</span></div>';
    }

    showError() {
      this.element.innerHTML = '<div class="tbi-widget tbi-error"><span>⚠️ Errore nel caricamento del widget</span></div>';
    }

    render() {
      this.injectStyles();
      
      switch (this.config.size) {
        case 'small':
          this.renderSmall();
          break;
        case 'medium':
          this.renderMedium();
          break;
        case 'large':
        case 'full':
          this.renderLarge();
          break;
        default:
          this.renderMedium();
      }
    }

    renderSmall() {
      const langOptions = this.config.languages.map(lang => 
        `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${LANGUAGES[lang]?.name || lang}</option>`
      ).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-small ${this.config.theme}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
          </div>
          <div class="tbi-rating">
            <div class="tbi-stars">★★★★★</div>
          </div>
          <div class="tbi-name">${this.data.name}</div>
          <div class="tbi-lang-dropdown-container">
            <div class="tbi-lang-dropdown">
              <img src="${CONFIG.baseUrl}/images/flags/${this.currentLang}.svg" alt="${this.currentLang}" class="tbi-dropdown-flag" />
              <span class="tbi-dropdown-text">${LANGUAGES[this.currentLang]?.name || this.currentLang}</span>
              <svg class="tbi-dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <select class="tbi-lang-select" onchange="this.closest('.tbi-widget').dispatchEvent(new CustomEvent('langChange', {detail: this.value}))">
                ${langOptions}
              </select>
            </div>
            <button class="tbi-action-btn">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      `;

      this.attachEventListeners();
    }

    renderMedium() {
      const langOptions = this.config.languages.map(lang => 
        `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${LANGUAGES[lang]?.name || lang}</option>`
      ).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-medium ${this.config.theme}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
          </div>
          <div class="tbi-rating">
            <div class="tbi-stars">★★★★★</div>
          </div>
          <div class="tbi-name">${this.data.name}</div>
          <div class="tbi-subtitle">Scopri ${this.config.type === 'destination' ? 'questa destinazione' : 'questa eccellenza'} italiana</div>
          <div class="tbi-lang-dropdown-container">
            <div class="tbi-lang-dropdown">
              <img src="${CONFIG.baseUrl}/images/flags/${this.currentLang}.svg" alt="${this.currentLang}" class="tbi-dropdown-flag" />
              <span class="tbi-dropdown-text">${LANGUAGES[this.currentLang]?.name || this.currentLang}</span>
              <svg class="tbi-dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <select class="tbi-lang-select" onchange="this.closest('.tbi-widget').dispatchEvent(new CustomEvent('langChange', {detail: this.value}))">
                ${langOptions}
              </select>
            </div>
            <button class="tbi-action-btn">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      `;

      this.attachEventListeners();
    }

    renderLarge() {
      const langOptions = this.config.languages.map(lang => 
        `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${LANGUAGES[lang]?.name || lang}</option>`
      ).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-large ${this.config.theme}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
          </div>
          <div class="tbi-rating">
            <div class="tbi-stars">★★★★★</div>
          </div>
          <div class="tbi-name">${this.data.name}</div>
          <div class="tbi-subtitle">Scopri le meraviglie di ${this.config.type === 'destination' ? 'questa destinazione' : 'questa eccellenza'} italiana</div>
          
          <div class="tbi-content">
            <h3 class="tbi-content-title">Contenuto Principale</h3>
            <div class="tbi-content-text" id="tbi-content-${this.elementId}">
              <div class="tbi-loading-content">Caricamento contenuto...</div>
            </div>
          </div>
          
          <div class="tbi-lang-dropdown-container">
            <div class="tbi-lang-dropdown">
              <img src="${CONFIG.baseUrl}/images/flags/${this.currentLang}.svg" alt="${this.currentLang}" class="tbi-dropdown-flag" />
              <span class="tbi-dropdown-text">${LANGUAGES[this.currentLang]?.name || this.currentLang}</span>
              <svg class="tbi-dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <select class="tbi-lang-select" onchange="this.closest('.tbi-widget').dispatchEvent(new CustomEvent('langChange', {detail: this.value}))">
                ${langOptions}
              </select>
            </div>
            <button class="tbi-action-btn">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      `;

      this.attachEventListeners();
      this.loadContent();
    }

    async loadContent() {
      const container = document.getElementById(`tbi-content-${this.elementId}`);
      if (!container) return;

      try {
        // Simulazione caricamento contenuto per la lingua corrente
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const content = this.getContentForLanguage(this.currentLang);
        container.innerHTML = `
          <div class="tbi-content-body">
            <p>${content.description}</p>
            ${content.highlights ? `
              <div class="tbi-highlights">
                <h4>Punti di interesse:</h4>
                <ul>
                  ${content.highlights.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      } catch (error) {
        container.innerHTML = '<div class="tbi-error-content">Errore nel caricamento del contenuto</div>';
      }
    }

    getContentForLanguage(lang) {
      const contentMap = {
        'it': {
          description: `Questo è il contenuto principale dell'${this.config.type === 'destination' ? 'destinazione' : 'eccellenza'} in italiano. Include descrizioni dettagliate, informazioni turistiche e tutto quello che serve per scoprire le bellezze italiane.`,
          highlights: ['Storia e cultura', 'Gastronomia locale', 'Attrazioni principali', 'Tradizioni locali']
        },
        'en': {
          description: `This is the main content of the ${this.config.type === 'destination' ? 'destination' : 'excellence'} in English. It includes detailed descriptions, tourist information and everything you need to discover Italian beauties.`,
          highlights: ['History and culture', 'Local gastronomy', 'Main attractions', 'Local traditions']
        },
        'fr': {
          description: `Ceci est le contenu principal de la ${this.config.type === 'destination' ? 'destination' : 'excellence'} en français. Il comprend des descriptions détaillées, des informations touristiques et tout ce dont vous avez besoin pour découvrir les beautés italiennes.`,
          highlights: ['Histoire et culture', 'Gastronomie locale', 'Attractions principales', 'Traditions locales']
        },
        'es': {
          description: `Este es el contenido principal del ${this.config.type === 'destination' ? 'destino' : 'excelencia'} en español. Incluye descripciones detalladas, información turística y todo lo que necesitas para descubrir las bellezas italianas.`,
          highlights: ['Historia y cultura', 'Gastronomía local', 'Atracciones principales', 'Tradiciones locales']
        },
        'de': {
          description: `Dies ist der Hauptinhalt des ${this.config.type === 'destination' ? 'Reiseziels' : 'Exzellenz'} auf Deutsch. Es enthält detaillierte Beschreibungen, touristische Informationen und alles, was Sie brauchen, um italienische Schönheiten zu entdecken.`,
          highlights: ['Geschichte und Kultur', 'Lokale Gastronomie', 'Hauptattraktionen', 'Lokale Traditionen']
        }
      };

      return contentMap[lang] || contentMap['it'];
    }

    attachEventListeners() {
      const widget = this.element.querySelector('.tbi-widget');
      
      widget.addEventListener('langChange', (e) => {
        this.currentLang = e.detail;
        this.updateLanguage();
      });

      widget.addEventListener('click', (e) => {
        if (e.target.matches('.tbi-lang-btn, .tbi-lang-tag')) {
          const lang = e.target.dataset.lang;
          if (lang) {
            this.currentLang = lang;
            this.updateLanguage();
          }
        }
      });
    }

    updateLanguage() {
      // Aggiorna il dropdown select
      const select = this.element.querySelector('.tbi-lang-select');
      if (select) {
        select.value = this.currentLang;
      }

      // Aggiorna bandiera e testo del dropdown
      const dropdownFlag = this.element.querySelector('.tbi-dropdown-flag');
      const dropdownText = this.element.querySelector('.tbi-dropdown-text');
      
      if (dropdownFlag) {
        dropdownFlag.src = `${CONFIG.baseUrl}/images/flags/${this.currentLang}.svg`;
        dropdownFlag.alt = this.currentLang;
      }
      
      if (dropdownText) {
        dropdownText.textContent = LANGUAGES[this.currentLang]?.name || this.currentLang;
      }

      // Ricarica contenuto per widget large
      if (this.config.size === 'large' || this.config.size === 'full') {
        this.loadContent();
      }
    }

    injectStyles() {
      if (document.getElementById('tbi-widget-styles')) return;

      const styles = `
        .tbi-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 100%;
          box-sizing: border-box;
          padding: 20px;
          text-align: center;
        }
        .tbi-widget * { box-sizing: border-box; }
        .tbi-widget.dark { background: #1f2937; border-color: #374151; color: white; }

        /* Header with Logo */
        .tbi-header {
          margin-bottom: 16px;
        }
        .tbi-logo {
          height: 60px;
          width: auto;
          margin: 0 auto;
          display: block;
        }

        /* Rating Stars */
        .tbi-rating {
          margin-bottom: 16px;
        }
        .tbi-stars {
          font-size: 24px;
          color: #fbbf24;
          letter-spacing: 2px;
        }

        /* Name/Title */
        .tbi-name {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        .tbi-widget.dark .tbi-name { color: white; }

        /* Subtitle */
        .tbi-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .tbi-widget.dark .tbi-subtitle { color: #9ca3af; }

        /* Content Section (Large widget only) */
        .tbi-content {
          margin-bottom: 20px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          text-align: left;
        }
        .tbi-widget.dark .tbi-content { background: #374151; }
        .tbi-content-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }
        .tbi-widget.dark .tbi-content-title { color: white; }
        .tbi-content-body p {
          color: #374151;
          line-height: 1.6;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .tbi-widget.dark .tbi-content-body p { color: #d1d5db; }
        .tbi-highlights h4 {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }
        .tbi-widget.dark .tbi-highlights h4 { color: white; }
        .tbi-highlights ul {
          margin: 0;
          padding-left: 20px;
        }
        .tbi-highlights li {
          color: #6b7280;
          margin-bottom: 4px;
          font-size: 13px;
        }
        .tbi-widget.dark .tbi-highlights li { color: #9ca3af; }

        /* Language Dropdown Container */
        .tbi-lang-dropdown-container {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }

        /* Language Dropdown */
        .tbi-lang-dropdown {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          cursor: pointer;
          min-width: 160px;
          transition: all 0.2s;
        }
        .tbi-lang-dropdown:hover {
          background: #e0f2fe;
          border-color: #0284c7;
          transform: translateY(-1px);
        }
        .tbi-widget.dark .tbi-lang-dropdown {
          background: #1e3a8a;
          border-color: #3b82f6;
        }
        .tbi-widget.dark .tbi-lang-dropdown:hover {
          background: #1e40af;
          border-color: #60a5fa;
        }

        /* Dropdown Flag */
        .tbi-dropdown-flag {
          width: 24px;
          height: 18px;
          object-fit: cover;
          border-radius: 3px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Dropdown Text */
        .tbi-dropdown-text {
          font-size: 14px;
          font-weight: 600;
          color: #0c4a6e;
          flex: 1;
        }
        .tbi-widget.dark .tbi-dropdown-text { color: white; }

        /* Dropdown Arrow */
        .tbi-dropdown-arrow {
          width: 16px;
          height: 16px;
          color: #0c4a6e;
          transition: transform 0.2s;
        }
        .tbi-widget.dark .tbi-dropdown-arrow { color: white; }
        .tbi-lang-dropdown:hover .tbi-dropdown-arrow {
          transform: rotate(180deg);
        }

        /* Hidden Select */
        .tbi-lang-select {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        /* Action Button */
        .tbi-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #10b981;
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }
        .tbi-action-btn:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
        }
        .tbi-action-btn svg {
          width: 20px;
          height: 20px;
        }

        /* Size Variations */
        .tbi-small {
          max-width: 350px;
          padding: 16px;
        }
        .tbi-small .tbi-logo { height: 45px; }
        .tbi-small .tbi-name { font-size: 18px; }
        .tbi-small .tbi-stars { font-size: 20px; }

        .tbi-medium {
          max-width: 450px;
          padding: 20px;
        }
        .tbi-medium .tbi-logo { height: 55px; }
        .tbi-medium .tbi-name { font-size: 22px; }

        .tbi-large {
          max-width: 600px;
          padding: 24px;
        }
        .tbi-large .tbi-logo { height: 65px; }
        .tbi-large .tbi-name { font-size: 24px; }

        /* Loading and Error States */
        .tbi-loading, .tbi-error { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .tbi-spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f4f6; border-radius: 50%; border-top-color: #3b82f6; animation: tbi-spin 1s ease-in-out infinite; margin-bottom: 8px; }
        .tbi-loading-content, .tbi-error-content { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
        
        @keyframes tbi-spin { to { transform: rotate(360deg); } }
        
        /* Responsive Design */
        @media (max-width: 640px) {
          .tbi-lang-dropdown-container { flex-direction: column; gap: 12px; }
          .tbi-lang-dropdown { min-width: 200px; }
          .tbi-action-btn { width: 200px; height: 44px; }
        }
      `;

      const styleElement = document.createElement('style');
      styleElement.id = 'tbi-widget-styles';
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }
  }

  window.TheBestItalyWidget = {
    init: function(elementId) {
      return new TheBestItalyWidget(elementId);
    },
    
    initAll: function() {
      const widgets = document.querySelectorAll('[data-slug][data-type]');
      const instances = [];
      
      widgets.forEach((widget, index) => {
        if (!widget.id) {
          widget.id = `tbi-widget-${Date.now()}-${index}`;
        }
        instances.push(new TheBestItalyWidget(widget.id));
      });
      
      return instances;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.TheBestItalyWidget.initAll();
    });
  } else {
    window.TheBestItalyWidget.initAll();
  }

})();
