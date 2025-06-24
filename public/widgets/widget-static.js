/**
 * TheBestItaly Widget - Static Version
 * Carica dati da file JSON statici invece di fare chiamate API
 * Versione ottimizzata per performance e uso cross-domain
 */

class TheBestItalyStaticWidget {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            type: options.type || 'azienda', // azienda, destinazione, articolo
            uuid: options.uuid || null,
            size: options.size || 'medium', // small, medium, large
            language: options.language || 'it',
            theme: options.theme || 'auto', // auto, light, dark
            showSelector: options.showSelector !== false,
            baseUrl: options.baseUrl || 'https://thebestitaly.eu',
            ...options
        };
        
        this.data = null;
        this.searchIndex = null;
        this.selectedLanguage = this.options.language;
        this.isDropdownOpen = false;
        
        console.log('🚀 TheBestItaly Static Widget initialized:', this.options);
        
        this.init();
    }

    async init() {
        try {
            this.showLoadingSkeleton();
            
            // Carica i dati statici
            await this.loadStaticData();
            
            if (this.options.uuid) {
                // Modalità widget specifico
                await this.loadSpecificContent();
            } else {
                // Modalità ricerca/selezione
                this.renderSearchInterface();
            }
            
        } catch (error) {
            console.error('❌ Widget initialization error:', error);
            this.handleError('Errore durante il caricamento del widget');
        }
    }

    async loadStaticData() {
        try {
            const lang = this.selectedLanguage;
            const indexUrl = `${this.options.baseUrl}/widget-data/${lang}-index.json`;
            
            console.log('📁 Loading static data from:', indexUrl);
            
            const response = await fetch(indexUrl);
            if (!response.ok) {
                throw new Error(`Failed to load static data: ${response.status}`);
            }
            
            const staticData = await response.json();
            this.data = staticData;
            this.searchIndex = staticData.searchIndex;
            
            console.log('✅ Static data loaded:', {
                companies: staticData.companies.length,
                destinations: staticData.destinations.length,
                articles: staticData.articles.length,
                totalItems: staticData.totalItems,
                lastUpdated: staticData.lastUpdated
            });
            
        } catch (error) {
            console.error('❌ Error loading static data:', error);
            throw error;
        }
    }

    async loadSpecificContent() {
        try {
            const content = this.findContentByUuid(this.options.uuid);
            if (content) {
                this.renderWidget(content);
            } else {
                this.handleError('Contenuto non trovato');
            }
        } catch (error) {
            console.error('❌ Error loading specific content:', error);
            this.handleError('Errore durante il caricamento del contenuto');
        }
    }

    findContentByUuid(uuid) {
        if (!this.data) return null;
        
        // Cerca in tutti i tipi di contenuto
        const allContent = [
            ...this.data.companies,
            ...this.data.destinations,
            ...this.data.articles
        ];
        
        return allContent.find(item => item.uuid === uuid);
    }

    renderWidget(content) {
        if (!content) {
            this.handleError('Nessun contenuto da visualizzare');
            return;
        }

        const { size, theme, showSelector } = this.options;
        const sizeClass = `tbi-widget-${size}`;
        const themeClass = theme === 'dark' ? 'tbi-widget-dark' : 
                          theme === 'light' ? 'tbi-widget-light' : 
                          'tbi-widget-auto';
        
        const isRTL = this.isRTLLanguage(this.selectedLanguage);
        const direction = isRTL ? 'rtl' : 'ltr';
        const directionClass = isRTL ? 'tbi-widget-rtl' : 'tbi-widget-ltr';

        const languageSelector = showSelector ? this.renderLanguageSelector() : '';
        const imageHtml = this.renderImage(content);
        const descriptionHtml = this.renderDescription(content);

        this.container.innerHTML = `
            ${this.getWidgetStyles()}
            <div class="tbi-widget ${sizeClass} ${themeClass} ${directionClass}" 
                 dir="${direction}"
                 style="${isRTL ? 'direction: rtl !important; text-align: right !important;' : ''}">
                <div class="tbi-widget-header" ${isRTL ? 'style="flex-direction: row-reverse !important;"' : ''}>
                    <div class="tbi-widget-logo">
                        <div class="tbi-widget-logo-icon">
                            <img src="${this.options.baseUrl}/_next/image?url=%2Fimages%2Flogo-black.webp&w=256&q=75" alt="TheBestItaly" />
                        </div>
                    </div>
                    ${languageSelector}
                </div>
                <div class="tbi-widget-content" ${isRTL ? 'style="text-align: right !important; direction: rtl !important;"' : ''}>
                    ${imageHtml}
                    <div class="tbi-widget-title" ${isRTL ? 'style="text-align: right !important; direction: rtl !important;"' : ''}>${content.title}</div>
                    <div class="tbi-widget-description" ${isRTL ? 'style="text-align: right !important; direction: rtl !important;"' : ''}>${descriptionHtml}</div>
                    <div class="tbi-widget-footer">
                        <div class="tbi-widget-meta">
                            ${content.location ? `<span class="tbi-widget-location">📍 ${content.location}</span>` : ''}
                            ${content.category ? `<span class="tbi-widget-category">${this.getCategoryIcon(content.type)} ${content.category}</span>` : ''}
                        </div>
                        <a href="${content.external_url}" target="_blank" class="tbi-widget-cta" data-view-content="${content.uuid}">
                            ${this.getTranslation('view_more')} →
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderSearchInterface() {
        // Per ora renderizza un placeholder
        this.container.innerHTML = `
            ${this.getWidgetStyles()}
            <div class="tbi-widget tbi-widget-medium tbi-widget-auto">
                <div class="tbi-widget-content">
                    <div class="tbi-widget-title">🔍 Cerca contenuti</div>
                    <div class="tbi-widget-description">
                        Utilizza il generatore di widget per selezionare il contenuto da visualizzare.
                    </div>
                    <div class="tbi-widget-footer">
                        <a href="${this.options.baseUrl}/api/widget/example.html" target="_blank" class="tbi-widget-cta">
                            Genera Widget →
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    renderImage(content) {
        if (!content.image || this.options.size === 'small') return '';
        
        const imageUrl = content.image.startsWith('http') ? 
            content.image : 
            `${this.options.baseUrl}/_next/image?url=${encodeURIComponent('/images/' + content.image)}&w=400&q=75`;
            
        return `<div class="tbi-widget-image">
            <img src="${imageUrl}" alt="${content.title}" loading="lazy" />
        </div>`;
    }

    renderDescription(content) {
        const { size } = this.options;
        
        if (size === 'small') {
            return content.seo_summary || content.description.substring(0, 100) + '...';
        } else if (size === 'large') {
            return content.full_description || content.description;
        } else {
            return content.description.length > 200 ? 
                content.description.substring(0, 200) + '...' : 
                content.description;
        }
    }

    renderLanguageSelector() {
        const languages = this.getSupportedLanguages();
        const currentLang = languages.find(lang => lang.code === this.selectedLanguage) || languages[0];
        
        return `
            <div class="tbi-widget-lang">
                <button class="tbi-widget-lang-current" data-dropdown-toggle>
                    <img src="${this.options.baseUrl}/images/flags/${currentLang.code}.svg" alt="${currentLang.name}" />
                    <span>${currentLang.name}</span>
                    <svg class="tbi-widget-lang-arrow" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="tbi-widget-lang-dropdown ${this.isDropdownOpen ? 'tbi-widget-lang-dropdown-open' : ''}">
                    ${languages.map(lang => `
                        <button class="tbi-widget-lang-option" data-lang-select="${lang.code}">
                            <img src="${this.options.baseUrl}/images/flags/${lang.code}.svg" alt="${lang.name}" />
                            <span>${lang.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async changeLanguage(langCode) {
        console.log('🌐 Changing language to:', langCode);
        this.selectedLanguage = langCode;
        this.isDropdownOpen = false;
        
        try {
            // Ricarica i dati nella nuova lingua
            await this.loadStaticData();
            
            if (this.options.uuid) {
                await this.loadSpecificContent();
            } else {
                this.renderSearchInterface();
            }
        } catch (error) {
            console.error('❌ Error changing language:', error);
        }
    }

    attachEventListeners() {
        // Language dropdown toggle
        const dropdownBtn = this.container.querySelector('[data-dropdown-toggle]');
        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        
        // Language selection
        const langButtons = this.container.querySelectorAll('[data-lang-select]');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeLanguage(btn.dataset.langSelect);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tbi-widget-lang') && this.isDropdownOpen) {
                this.isDropdownOpen = false;
                this.renderWidget(this.findContentByUuid(this.options.uuid));
            }
        });
    }

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
        const dropdown = this.container.querySelector('.tbi-widget-lang-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('tbi-widget-lang-dropdown-open', this.isDropdownOpen);
        }
    }

    showLoadingSkeleton() {
        this.container.innerHTML = `
            ${this.getWidgetStyles()}
            <div class="tbi-widget tbi-widget-${this.options.size} tbi-widget-loading">
                <div class="tbi-widget-header">
                    <div class="loading-skeleton" style="width: 120px; height: 20px;"></div>
                    <div class="loading-skeleton" style="width: 80px; height: 20px;"></div>
                </div>
                <div class="tbi-widget-content">
                    ${this.options.size !== 'small' ? '<div class="loading-skeleton" style="width: 100%; height: 200px; margin-bottom: 16px;"></div>' : ''}
                    <div class="loading-skeleton" style="width: 80%; height: 24px; margin-bottom: 12px;"></div>
                    <div class="loading-skeleton" style="width: 100%; height: 60px; margin-bottom: 16px;"></div>
                    <div class="loading-skeleton" style="width: 120px; height: 32px;"></div>
                </div>
            </div>
        `;
    }

    handleError(message) {
        this.container.innerHTML = `
            ${this.getWidgetStyles()}
            <div class="tbi-widget tbi-widget-${this.options.size} tbi-widget-error">
                <div class="tbi-widget-content">
                    <div class="tbi-widget-title">⚠️ Errore</div>
                    <div class="tbi-widget-description">${message}</div>
                    <div class="tbi-widget-footer">
                        <button onclick="location.reload()" class="tbi-widget-cta">
                            Riprova
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getSupportedLanguages() {
        return [
            { code: 'it', name: 'Italiano', rtl: false },
            { code: 'en', name: 'English', rtl: false },
            { code: 'fr', name: 'Français', rtl: false },
            { code: 'de', name: 'Deutsch', rtl: false },
            { code: 'es', name: 'Español', rtl: false },
            { code: 'ar', name: 'العربية', rtl: true },
            { code: 'he', name: 'עברית', rtl: true },
            { code: 'fa', name: 'فارسی', rtl: true },
            { code: 'ur', name: 'اردو', rtl: true }
        ];
    }

    isRTLLanguage(langCode) {
        const lang = this.getSupportedLanguages().find(l => l.code === langCode);
        return lang ? lang.rtl : false;
    }

    getCategoryIcon(type) {
        switch (type) {
            case 'azienda': return '🏢';
            case 'destinazione': return '🏛️';
            case 'articolo': return '📰';
            default: return '📍';
        }
    }

    getTranslation(key) {
        const translations = {
            'view_more': {
                'it': 'Scopri di più',
                'en': 'Learn more',
                'fr': 'En savoir plus',
                'de': 'Mehr erfahren',
                'es': 'Saber más',
                'ar': 'اعرف المزيد',
                'he': 'למד עוד',
                'fa': 'بیشتر بدانید',
                'ur': 'مزید جانیں'
            }
        };
        
        return translations[key]?.[this.selectedLanguage] || translations[key]?.['it'] || key;
    }

    getWidgetStyles() {
        return `
            <style>
                .tbi-widget {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    position: relative;
                    max-width: 100%;
                }
                
                .tbi-widget-small { width: 340px; min-height: 200px; }
                .tbi-widget-medium { width: 420px; min-height: 280px; }
                .tbi-widget-large { width: 100%; max-width: 600px; min-height: 400px; }
                
                .tbi-widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .tbi-widget-logo-icon img {
                    height: 24px;
                    width: auto;
                    filter: brightness(0) invert(1);
                }
                
                .tbi-widget-content {
                    padding: 16px;
                }
                
                .tbi-widget-image {
                    margin-bottom: 12px;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .tbi-widget-image img {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                }
                
                .tbi-widget-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 8px;
                    line-height: 1.4;
                }
                
                .tbi-widget-description {
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }
                
                .tbi-widget-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .tbi-widget-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 12px;
                    color: #9ca3af;
                }
                
                .tbi-widget-cta {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: transform 0.2s ease;
                    border: none;
                    cursor: pointer;
                }
                
                .tbi-widget-cta:hover {
                    transform: translateY(-1px);
                }
                
                /* Language Selector */
                .tbi-widget-lang {
                    position: relative;
                }
                
                .tbi-widget-lang-current {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    padding: 6px 10px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .tbi-widget-lang-current:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                
                .tbi-widget-lang-current img {
                    width: 16px;
                    height: 12px;
                    border-radius: 2px;
                }
                
                .tbi-widget-lang-arrow {
                    width: 12px;
                    height: 12px;
                    transition: transform 0.2s ease;
                }
                
                .tbi-widget-lang-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    min-width: 120px;
                    max-height: 200px;
                    overflow-y: auto;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                }
                
                .tbi-widget-lang-dropdown-open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .tbi-widget-lang-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    background: none;
                    color: #374151;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .tbi-widget-lang-option:hover {
                    background: #f3f4f6;
                }
                
                .tbi-widget-lang-option img {
                    width: 16px;
                    height: 12px;
                    border-radius: 2px;
                }
                
                /* Loading skeleton */
                .loading-skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }
                
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                /* RTL Support */
                .tbi-widget[dir="rtl"], .tbi-widget-rtl {
                    direction: rtl !important;
                    text-align: right !important;
                }
                
                .tbi-widget[dir="rtl"] .tbi-widget-header,
                .tbi-widget-rtl .tbi-widget-header {
                    flex-direction: row-reverse !important;
                }
                
                .tbi-widget[dir="rtl"] .tbi-widget-content,
                .tbi-widget-rtl .tbi-widget-content {
                    text-align: right !important;
                    direction: rtl !important;
                }
                
                .tbi-widget[dir="rtl"] .tbi-widget-title,
                .tbi-widget-rtl .tbi-widget-title {
                    text-align: right !important;
                    direction: rtl !important;
                }
                
                .tbi-widget[dir="rtl"] .tbi-widget-description,
                .tbi-widget-rtl .tbi-widget-description {
                    text-align: right !important;
                    direction: rtl !important;
                }
                
                .tbi-widget[dir="rtl"] .tbi-widget-lang-dropdown,
                .tbi-widget-rtl .tbi-widget-lang-dropdown {
                    left: 0;
                    right: auto;
                }
                
                /* Error state */
                .tbi-widget-error {
                    border: 2px solid #fecaca;
                    background: #fef2f2;
                }
                
                .tbi-widget-error .tbi-widget-title {
                    color: #dc2626;
                }
                
                .tbi-widget-error .tbi-widget-description {
                    color: #7f1d1d;
                }
                
                /* Dark theme */
                .tbi-widget-dark {
                    background: #1f2937;
                    color: #f9fafb;
                }
                
                .tbi-widget-dark .tbi-widget-title {
                    color: #f9fafb;
                }
                
                .tbi-widget-dark .tbi-widget-description {
                    color: #d1d5db;
                }
                
                /* Auto theme (follows system preference) */
                @media (prefers-color-scheme: dark) {
                    .tbi-widget-auto {
                        background: #1f2937;
                        color: #f9fafb;
                    }
                    
                    .tbi-widget-auto .tbi-widget-title {
                        color: #f9fafb;
                    }
                    
                    .tbi-widget-auto .tbi-widget-description {
                        color: #d1d5db;
                    }
                }
            </style>
        `;
    }
}

// Auto-initialize widgets on page load
document.addEventListener('DOMContentLoaded', function() {
    // Cerca tutti gli elementi con data-tbi-widget
    const widgets = document.querySelectorAll('[data-tbi-widget="true"]');
    
    widgets.forEach(element => {
        const options = {
            type: element.dataset.type || 'azienda',
            uuid: element.dataset.uuid || null,
            size: element.dataset.size || 'medium',
            language: element.dataset.language || 'it',
            theme: element.dataset.theme || 'auto',
            showSelector: element.dataset.showSelector !== 'false',
            baseUrl: element.dataset.baseUrl || 'https://thebestitaly.eu'
        };
        
        new TheBestItalyStaticWidget(element.id, options);
    });
});

// Esporta per uso globale
window.TheBestItalyStaticWidget = TheBestItalyStaticWidget;
