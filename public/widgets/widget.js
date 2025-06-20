(function() {
  'use strict';

  const CONFIG = {
    baseUrl: 'https://thebestitaly.eu',
    apiUrl: 'https://thebestitaly.eu/api',
    logoUrl: 'https://thebestitaly.eu/images/logo-black.webp',
    version: '3.0'
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
      this.currentLang = this.config.languages[0] || 'it';
      this.data = null;
      this.languageUrls = {};
      
      if (!this.element) {
        console.error('TheBestItaly Widget: Element not found:', elementId);
        return;
      }

      this.init();
    }

    parseConfig() {
      const el = this.element;
      const languages = el.dataset.languages ? el.dataset.languages.split(',') : ['it', 'en'];
      
      return {
        slug: el.dataset.slug || '',
        type: el.dataset.type || 'destination', // destination, company, article
        size: el.dataset.size || 'medium', // small, medium, large
        theme: el.dataset.theme || 'light',
        languages: languages,
        height: el.dataset.height || 'auto' // for large widget
      };
    }

    async init() {
      try {
        this.injectStyles();
        this.showLoading();
        await this.fetchData();
        this.render();
      } catch (error) {
        console.error('TheBestItaly Widget Error:', error);
        this.showError();
      }
    }

    async fetchData() {
      try {
        let endpoint = '';
        let fields = [];
        
        if (this.config.type === 'destination') {
          // For destinations: get translations with slug_permalink
          endpoint = 'destinations';
          fields = [
            'id', 'image', 'region_id', 'province_id',
            'translations.languages_code',
            'translations.destination_name',
            'translations.seo_title', 
            'translations.seo_summary',
            'translations.slug_permalink',
            'region_id.translations.slug_permalink',
            'province_id.translations.slug_permalink'
          ];
        } else if (this.config.type === 'company') {
          // For companies: slug_permalink is unique (not in translations)
          endpoint = 'companies';
          fields = [
            'id', 'company_name', 'slug_permalink', 'featured_image',
            'translations.languages_code',
            'translations.seo_title',
            'translations.seo_summary', 
            'translations.descrizione_breve'
          ];
        } else if (this.config.type === 'article') {
          // For articles: get translations
          endpoint = 'articles';
          fields = [
            'id', 'image',
            'translations.languages_code',
            'translations.titolo_articolo',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ];
        }

        const apiUrl = `${CONFIG.baseUrl}/api/directus/items/${endpoint}?filter[slug_permalink][_eq]=${this.config.slug}&fields[]=${fields.join('&fields[]=')}&deep[translations][_filter][languages_code][_in]=${this.config.languages.join(',')}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();
        const item = result.data && result.data.length > 0 ? result.data[0] : null;
        
        if (!item) {
          throw new Error('Item not found');
        }

        this.data = {
          id: item.id,
          image: item.image || item.featured_image,
          translations: item.translations || [],
          // For companies, use the main slug_permalink (not in translations)
          mainSlug: item.slug_permalink,
          regionSlug: item.region_id?.translations?.[0]?.slug_permalink,
          provinceSlug: item.province_id?.translations?.[0]?.slug_permalink
        };

        // Build language URLs
        this.buildLanguageUrls();

        // Set initial content for current language
        this.updateCurrentContent();

      } catch (error) {
        console.warn('TheBestItaly Widget: Could not fetch data, using fallback', error);
        this.createFallbackData();
      }
    }

    buildLanguageUrls() {
      this.languageUrls = {};
      
      this.config.languages.forEach(lang => {
        let url = `${CONFIG.baseUrl}/${lang}`;
        
        if (this.config.type === 'destination') {
          // For destinations: /{lang}/{region}/{province}/{municipality}
          const translation = this.data.translations.find(t => t.languages_code === lang);
          if (translation && this.data.regionSlug && this.data.provinceSlug) {
            url += `/${this.data.regionSlug}/${this.data.provinceSlug}/${translation.slug_permalink}`;
          } else {
            url += `/${this.config.slug}`;
          }
        } else if (this.config.type === 'company') {
          // For companies: /{lang}/poi/{slug} (slug is unique, not translated)
          url += `/poi/${this.data.mainSlug || this.config.slug}`;
        } else if (this.config.type === 'article') {
          // For articles: /{lang}/magazine/{slug}
          const translation = this.data.translations.find(t => t.languages_code === lang);
          if (translation && translation.slug_permalink) {
            url += `/magazine/${translation.slug_permalink}`;
          } else {
            url += `/magazine/${this.config.slug}`;
          }
        }
        
        this.languageUrls[lang] = url;
      });
    }

    createFallbackData() {
      this.data = {
        id: null,
        image: null,
        translations: [],
        mainSlug: this.config.slug
      };

      // Create fallback URLs
      this.languageUrls = {};
      this.config.languages.forEach(lang => {
        let url = `${CONFIG.baseUrl}/${lang}`;
        if (this.config.type === 'destination') {
          url += `/${this.config.slug}`;
        } else if (this.config.type === 'company') {
          url += `/poi/${this.config.slug}`;
        } else if (this.config.type === 'article') {
          url += `/magazine/${this.config.slug}`;
        }
        this.languageUrls[lang] = url;
      });

      this.updateCurrentContent();
    }

    updateCurrentContent() {
      const translation = this.data.translations.find(t => t.languages_code === this.currentLang);
      
      this.currentContent = {
        name: translation?.destination_name || translation?.titolo_articolo || this.config.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        seoTitle: translation?.seo_title || '',
        description: translation?.seo_summary || translation?.descrizione_breve || '',
        url: this.languageUrls[this.currentLang] || `${CONFIG.baseUrl}/${this.currentLang}`
      };
    }

    showLoading() {
      this.element.innerHTML = '<div class="tbi-widget tbi-loading"><div class="tbi-spinner"></div><span>Caricamento...</span></div>';
    }

    showError() {
      this.element.innerHTML = '<div class="tbi-widget tbi-error"><span>⚠️ Errore nel caricamento del widget</span></div>';
    }

    render() {
      switch (this.config.size) {
        case 'small':
          this.renderSmall();
          break;
        case 'medium':
          this.renderMedium();
          break;
        case 'large':
          this.renderLarge();
          break;
        default:
          this.renderMedium();
      }
      
      this.attachEventListeners();
    }

    renderSmall() {
      // Small: Logo + Name + Language Dropdown + Visit Button
      const languageOptions = this.config.languages.map(lang => {
        const langData = LANGUAGES[lang] || { name: lang, flag: '🏳️' };
        return `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${langData.flag} ${langData.name}</option>`;
      }).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-small ${this.config.theme}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
          </div>
          <div class="tbi-content">
            <h3 class="tbi-name">${this.currentContent.name}</h3>
          </div>
          <div class="tbi-actions">
            <div class="tbi-language-selector">
              <select class="tbi-language-select">
                ${languageOptions}
              </select>
            </div>
            <a href="${this.currentContent.url}" target="_blank" class="tbi-visit-btn" title="Visita ${this.currentContent.name}">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      `;
    }

    renderMedium() {
      // Medium: Logo + Name + SEO Title + Language Dropdown + Visit Button
      const languageOptions = this.config.languages.map(lang => {
        const langData = LANGUAGES[lang] || { name: lang, flag: '🏳️' };
        return `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${langData.flag} ${langData.name}</option>`;
      }).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-medium ${this.config.theme}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
          </div>
          <div class="tbi-content">
            <h3 class="tbi-name">${this.currentContent.name}</h3>
            ${this.currentContent.seoTitle ? `<p class="tbi-seo-title">${this.currentContent.seoTitle}</p>` : ''}
          </div>
          <div class="tbi-actions">
            <div class="tbi-language-selector">
              <select class="tbi-language-select">
                ${languageOptions}
              </select>
            </div>
            <a href="${this.currentContent.url}" target="_blank" class="tbi-visit-btn" title="Visita ${this.currentContent.name}">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      `;
    }

    renderLarge() {
      // Large: Full width, adjustable height, with description and link to our site
      const languageOptions = this.config.languages.map(lang => {
        const langData = LANGUAGES[lang] || { name: lang, flag: '🏳️' };
        return `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${langData.flag} ${langData.name}</option>`;
      }).join('');

      const height = this.config.height !== 'auto' ? `height: ${this.config.height}px;` : '';

      this.element.innerHTML = `
        <div class="tbi-widget tbi-large ${this.config.theme}" style="width: 100%; ${height}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
            <div class="tbi-language-selector">
              <select class="tbi-language-select">
                ${languageOptions}
              </select>
            </div>
          </div>
          <div class="tbi-content">
            <h2 class="tbi-name">${this.currentContent.name}</h2>
            ${this.currentContent.seoTitle ? `<h3 class="tbi-seo-title">${this.currentContent.seoTitle}</h3>` : ''}
            ${this.currentContent.description ? `<div class="tbi-description">${this.currentContent.description}</div>` : ''}
          </div>
          <div class="tbi-footer">
            <a href="${this.currentContent.url}" target="_blank" class="tbi-visit-btn">
              Visita ${this.currentContent.name}
            </a>
            <a href="${CONFIG.baseUrl}/${this.currentLang}" target="_blank" class="tbi-site-btn">
              Scopri TheBestItaly
            </a>
          </div>
        </div>
      `;
    }

    attachEventListeners() {
      const languageSelect = this.element.querySelector('.tbi-language-select');
      if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
          this.currentLang = e.target.value;
          this.updateCurrentContent();
          this.render();
        });
      }
    }

    injectStyles() {
      if (document.getElementById('tbi-widget-styles')) return;

      const styles = `
        .tbi-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 16px;
          box-sizing: border-box;
          position: relative;
        }
        
        .tbi-widget.dark {
          background: #1f2937;
          border-color: #374151;
          color: white;
        }

        /* Loading State */
        .tbi-widget.tbi-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
        }
        
        .tbi-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Error State */
        .tbi-widget.tbi-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          color: #dc2626;
        }

        /* Small Widget */
        .tbi-widget.tbi-small {
          width: 280px;
          min-height: 140px;
        }
        
        .tbi-widget.tbi-small .tbi-header {
          text-align: center;
          margin-bottom: 12px;
        }
        
        .tbi-widget.tbi-small .tbi-logo {
          height: 32px;
          width: auto;
        }
        
        .tbi-widget.tbi-small .tbi-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
          text-align: center;
          color: #111827;
        }
        
        .tbi-widget.dark .tbi-name {
          color: white;
        }
        
        .tbi-widget.tbi-small .tbi-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Medium Widget */
        .tbi-widget.tbi-medium {
          width: 350px;
          min-height: 180px;
        }
        
        .tbi-widget.tbi-medium .tbi-header {
          text-align: center;
          margin-bottom: 16px;
        }
        
        .tbi-widget.tbi-medium .tbi-logo {
          height: 40px;
          width: auto;
        }
        
        .tbi-widget.tbi-medium .tbi-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          text-align: center;
          color: #111827;
        }
        
        .tbi-widget.tbi-medium .tbi-seo-title {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 16px 0;
          text-align: center;
          line-height: 1.4;
        }
        
        .tbi-widget.dark .tbi-seo-title {
          color: #9ca3af;
        }
        
        .tbi-widget.tbi-medium .tbi-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Large Widget */
        .tbi-widget.tbi-large {
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }
        
        .tbi-widget.tbi-large .tbi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
        }
        
        .tbi-widget.dark .tbi-header {
          border-bottom-color: #374151;
        }
        
        .tbi-widget.tbi-large .tbi-logo {
          height: 48px;
          width: auto;
        }
        
        .tbi-widget.tbi-large .tbi-content {
          flex: 1;
          margin-bottom: 20px;
        }
        
        .tbi-widget.tbi-large .tbi-name {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #111827;
        }
        
        .tbi-widget.tbi-large .tbi-seo-title {
          font-size: 18px;
          font-weight: 500;
          color: #374151;
          margin: 0 0 16px 0;
        }
        
        .tbi-widget.dark .tbi-seo-title {
          color: #d1d5db;
        }
        
        .tbi-widget.tbi-large .tbi-description {
          font-size: 16px;
          line-height: 1.6;
          color: #6b7280;
        }
        
        .tbi-widget.dark .tbi-description {
          color: #9ca3af;
        }
        
        .tbi-widget.tbi-large .tbi-footer {
          display: flex;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }
        
        .tbi-widget.dark .tbi-footer {
          border-top-color: #374151;
        }

        /* Language Selector */
        .tbi-language-selector {
          flex: 1;
        }
        
        .tbi-language-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 8px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 32px;
        }
        
        .tbi-widget.dark .tbi-language-select {
          background: #374151;
          border-color: #4b5563;
          color: white;
        }
        
        .tbi-language-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Visit Button */
        .tbi-visit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
          white-space: nowrap;
        }
        
        .tbi-visit-btn:hover {
          background: #2563eb;
        }
        
        .tbi-widget.tbi-small .tbi-visit-btn {
          width: 40px;
          height: 40px;
          padding: 0;
        }
        
        .tbi-widget.tbi-small .tbi-visit-btn svg {
          width: 16px;
          height: 16px;
        }
        
        .tbi-widget.tbi-large .tbi-visit-btn {
          flex: 1;
          justify-content: center;
        }

        /* Site Button (Large widget only) */
        .tbi-site-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
          flex: 1;
        }
        
        .tbi-site-btn:hover {
          background: #059669;
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.id = 'tbi-widget-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }

  // Auto-initialize widgets
  window.TheBestItalyWidget = TheBestItalyWidget;
  
  // Initialize widgets on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgets);
  } else {
    initializeWidgets();
  }

  function initializeWidgets() {
    const widgets = document.querySelectorAll('[data-slug][data-type]');
    widgets.forEach(widget => {
      if (!widget.id) {
        widget.id = `tbi-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      new TheBestItalyWidget(widget.id);
    });
  }

})();
