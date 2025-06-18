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
        `<option value="${lang}" ${lang === this.currentLang ? 'selected' : ''}>${LANGUAGES[lang]?.flag || ''} ${lang.toUpperCase()}</option>`
      ).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-small ${this.config.theme}">
          <div class="tbi-content">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
            <div class="tbi-info">
              <div class="tbi-name">${this.data.name}</div>
            </div>
            <select class="tbi-lang-select" onchange="this.closest('.tbi-widget').dispatchEvent(new CustomEvent('langChange', {detail: this.value}))">
              ${langOptions}
            </select>
          </div>
        </div>
      `;

      this.attachEventListeners();
    }

    renderMedium() {
      const langButtons = this.config.languages.slice(0, 6).map(lang => 
        `<button class="tbi-lang-btn ${lang === this.currentLang ? 'active' : ''}" data-lang="${lang}" title="${LANGUAGES[lang]?.name || lang}">
          ${LANGUAGES[lang]?.flag || lang.toUpperCase().slice(0, 2)}
        </button>`
      ).join('');

      this.element.innerHTML = `
        <div class="tbi-widget tbi-medium ${this.config.theme}">
          <div class="tbi-header">
            <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
            <div class="tbi-info">
              <div class="tbi-name">${this.data.name}</div>
              <div class="tbi-subtitle">${this.config.type === 'destination' ? 'Destinazione' : 'Eccellenza'} italiana</div>
            </div>
          </div>
          <div class="tbi-footer">
            <span class="tbi-lang-label">Scegli lingua:</span>
            <div class="tbi-lang-buttons">${langButtons}</div>
          </div>
        </div>
      `;

      this.attachEventListeners();
    }

    renderLarge() {
      const langTags = this.config.languages.slice(0, 8).map(lang => 
        `<span class="tbi-lang-tag ${lang === this.currentLang ? 'active' : ''}" data-lang="${lang}">${LANGUAGES[lang]?.name || lang}</span>`
      ).join('');

      const moreLanguages = this.config.languages.length > 8 
        ? `<span class="tbi-lang-more">+${this.config.languages.length - 8} altre</span>` 
        : '';

      this.element.innerHTML = `
        <div class="tbi-widget tbi-large ${this.config.theme}">
          <div class="tbi-header">
            <div class="tbi-title-section">
              <img src="${CONFIG.logoUrl}" alt="TheBestItaly" class="tbi-logo" />
              <div class="tbi-info">
                <div class="tbi-name">${this.data.name}</div>
                <div class="tbi-subtitle">Scopri le eccellenze italiane con TheBestItaly</div>
              </div>
            </div>
            <div class="tbi-lang-section">
              <span class="tbi-lang-label">Lingue disponibili:</span>
              <div class="tbi-lang-tags">${langTags}${moreLanguages}</div>
            </div>
          </div>
          <div class="tbi-articles">
            <h3 class="tbi-articles-title">Articoli in Evidenza</h3>
            <div class="tbi-articles-list" id="tbi-articles-${this.elementId}">
              <div class="tbi-loading-articles">Caricamento articoli...</div>
            </div>
            <div class="tbi-articles-footer">
              <a href="${CONFIG.baseUrl}/${this.currentLang}/magazine/" target="_blank" class="tbi-view-all">Vedi tutti gli articoli →</a>
            </div>
          </div>
        </div>
      `;

      this.attachEventListeners();
      this.loadArticles();
    }

    async loadArticles() {
      const mockArticles = [
        { title: 'Le meraviglie di Roma', summary: 'Scopri la capitale eterna...', image: null },
        { title: 'Cucina toscana autentica', summary: 'I sapori della tradizione...', image: null },
        { title: 'Arte e cultura italiana', summary: 'Un patrimonio senza tempo...', image: null }
      ];
      this.renderArticles(mockArticles);
    }

    renderArticles(articles) {
      const container = document.getElementById(`tbi-articles-${this.elementId}`);
      if (!container) return;

      const articlesHtml = articles.slice(0, 3).map(article => `
        <div class="tbi-article">
          <div class="tbi-article-image">
            <div class="tbi-article-placeholder"></div>
          </div>
          <div class="tbi-article-content">
            <div class="tbi-article-title">${article.title}</div>
            <div class="tbi-article-summary">${article.summary}</div>
          </div>
        </div>
      `).join('');

      container.innerHTML = articlesHtml;
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
      this.element.querySelectorAll('.tbi-lang-btn, .tbi-lang-tag').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
      });

      const select = this.element.querySelector('.tbi-lang-select');
      if (select) {
        select.value = this.currentLang;
      }

      if (this.config.size === 'large' || this.config.size === 'full') {
        this.loadArticles();
      }

      const viewAllLink = this.element.querySelector('.tbi-view-all');
      if (viewAllLink) {
        viewAllLink.href = `${CONFIG.baseUrl}/${this.currentLang}/magazine/`;
      }
    }

    injectStyles() {
      if (document.getElementById('tbi-widget-styles')) return;

      const styles = `
        .tbi-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          max-width: 100%;
          box-sizing: border-box;
        }
        .tbi-widget * { box-sizing: border-box; }
        .tbi-widget.dark { background: #1f2937; border-color: #374151; color: white; }
        .tbi-small { padding: 12px; border-radius: 6px; }
        .tbi-small .tbi-content { display: flex; align-items: center; gap: 12px; }
        .tbi-small .tbi-logo { height: 24px; width: auto; }
        .tbi-small .tbi-info { flex: 1; min-width: 0; }
        .tbi-small .tbi-name { font-size: 14px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tbi-small.dark .tbi-name { color: white; }
        .tbi-small .tbi-lang-select { font-size: 12px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; background: white; }
        .tbi-medium { padding: 16px; border-radius: 12px; max-width: 400px; }
        .tbi-medium .tbi-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .tbi-medium .tbi-logo { height: 32px; width: auto; }
        .tbi-medium .tbi-name { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 2px; }
        .tbi-medium.dark .tbi-name { color: white; }
        .tbi-medium .tbi-subtitle { font-size: 12px; color: #6b7280; }
        .tbi-medium.dark .tbi-subtitle { color: #9ca3af; }
        .tbi-medium .tbi-footer { display: flex; align-items: center; justify-content: space-between; }
        .tbi-medium .tbi-lang-label { font-size: 12px; color: #6b7280; }
        .tbi-medium .tbi-lang-buttons { display: flex; gap: 4px; }
        .tbi-lang-btn { width: 24px; height: 24px; border: 1px solid #d1d5db; border-radius: 4px; background: #f9fafb; font-size: 10px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .tbi-lang-btn:hover { background: #dbeafe; border-color: #3b82f6; }
        .tbi-lang-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
        .tbi-large { border-radius: 16px; max-width: 600px; }
        .tbi-large .tbi-header { padding: 24px; border-bottom: 1px solid #e5e7eb; }
        .tbi-large.dark .tbi-header { border-bottom-color: #374151; }
        .tbi-large .tbi-title-section { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tbi-large .tbi-logo { height: 40px; width: auto; }
        .tbi-large .tbi-name { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .tbi-large.dark .tbi-name { color: white; }
        .tbi-large .tbi-subtitle { font-size: 14px; color: #6b7280; }
        .tbi-large .tbi-lang-section { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .tbi-large .tbi-lang-label { font-size: 14px; font-weight: 500; color: #374151; }
        .tbi-large .tbi-lang-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tbi-lang-tag { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background: #dbeafe; color: #1e40af; cursor: pointer; transition: all 0.2s; }
        .tbi-lang-tag:hover { background: #bfdbfe; }
        .tbi-lang-tag.active { background: #3b82f6; color: white; }
        .tbi-lang-more { font-size: 12px; color: #6b7280; }
        .tbi-articles { padding: 24px; }
        .tbi-articles-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0; }
        .tbi-large.dark .tbi-articles-title { color: white; }
        .tbi-article { display: flex; gap: 12px; padding: 12px; border-radius: 8px; background: #f9fafb; transition: background 0.2s; margin-bottom: 12px; }
        .tbi-article:hover { background: #f3f4f6; }
        .tbi-large.dark .tbi-article { background: #374151; }
        .tbi-large.dark .tbi-article:hover { background: #4b5563; }
        .tbi-article-image { width: 64px; height: 48px; flex-shrink: 0; }
        .tbi-article-placeholder { width: 100%; height: 100%; background: #e5e7eb; border-radius: 4px; }
        .tbi-article-content { flex: 1; min-width: 0; }
        .tbi-article-title { font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px; line-height: 1.3; }
        .tbi-large.dark .tbi-article-title { color: white; }
        .tbi-article-summary { font-size: 12px; color: #6b7280; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tbi-articles-footer { margin-top: 16px; text-align: center; }
        .tbi-view-all { color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .tbi-view-all:hover { color: #1d4ed8; }
        .tbi-loading, .tbi-error { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .tbi-spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f4f6; border-radius: 50%; border-top-color: #3b82f6; animation: tbi-spin 1s ease-in-out infinite; margin-bottom: 8px; }
        .tbi-loading-articles { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
        @keyframes tbi-spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .tbi-large .tbi-lang-section { flex-direction: column; align-items: flex-start; }
          .tbi-medium .tbi-footer { flex-direction: column; gap: 8px; align-items: flex-start; }
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
