/**
 * TheBestItaly Widget v4.0
 * Clean, Modern, Beautiful
 * Supports all 50+ languages
 */

class TheBestItalyWidget {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`TheBestItaly Widget: Container #${containerId} not found`);
            return;
        }

        // Get configuration from data attributes
        this.config = {
            type: this.container.dataset.type || 'destination',
            id: this.container.dataset.id || 'roma',
            size: this.container.dataset.size || 'medium',
            theme: this.container.dataset.theme || 'light',
            language: this.container.dataset.language || 'it',
            showSelector: this.container.dataset.showSelector === 'true'
        };

        this.baseUrl = 'https://thebestitaly.eu';
        this.apiUrl = `${this.baseUrl}/api/directus`;
        
        // All supported languages
        this.languages = [
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

        this.currentLanguage = this.config.language;
        this.content = null;
        this.isLoading = true;
        this.error = null;

        this.init();
    }

    async init() {
        this.injectStyles();
        this.render();
        await this.loadContent();
    }

    injectStyles() {
        if (document.getElementById('tbi-widget-styles')) return;

        const styles = `
            <style id="tbi-widget-styles">
                .tbi-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    position: relative;
                }
                
                .tbi-widget:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }

                .tbi-widget-small { width: 320px; height: 128px; }
                .tbi-widget-medium { width: 384px; height: 192px; }
                .tbi-widget-large { width: 100%; height: 256px; }

                .tbi-widget-light { background: white; color: #1f2937; border: 1px solid #e5e7eb; }
                .tbi-widget-dark { background: #1f2937; color: white; border: 1px solid #374151; }
                .tbi-widget-auto { background: white; color: #1f2937; border: 1px solid #e5e7eb; }

                @media (prefers-color-scheme: dark) {
                    .tbi-widget-auto { background: #1f2937; color: white; border: 1px solid #374151; }
                }

                .tbi-widget-header {
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .tbi-widget-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 18px;
                }

                .tbi-widget-logo-icon {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .tbi-widget-lang-selector {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 4px 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                    position: relative;
                }

                .tbi-widget-lang-selector:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .tbi-widget-lang-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    min-width: 200px;
                    display: none;
                }

                .tbi-widget-lang-dropdown.show {
                    display: block;
                }

                .tbi-widget-lang-option {
                    padding: 8px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #1f2937;
                    transition: background 0.2s;
                }

                .tbi-widget-lang-option:hover {
                    background: #f3f4f6;
                }

                .tbi-widget-lang-option.active {
                    background: #3b82f6;
                    color: white;
                }

                .tbi-widget-content {
                    padding: 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .tbi-widget-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    line-height: 1.2;
                }

                .tbi-widget-description {
                    font-size: 14px;
                    opacity: 0.75;
                    margin-bottom: 16px;
                    flex: 1;
                    line-height: 1.4;
                }

                .tbi-widget-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .tbi-widget-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .tbi-widget-status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                }

                .tbi-widget-button {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-decoration: none;
                    display: inline-block;
                }

                .tbi-widget-button:hover {
                    background: #2563eb;
                }

                .tbi-widget-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-size: 14px;
                    opacity: 0.7;
                }

                .tbi-widget-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-size: 14px;
                    color: #ef4444;
                    text-align: center;
                    padding: 16px;
                }

                .tbi-widget-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e5e7eb;
                    border-top: 2px solid #3b82f6;
                    border-radius: 50%;
                    animation: tbi-spin 1s linear infinite;
                    margin-right: 8px;
                }

                @keyframes tbi-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .tbi-widget-small .tbi-widget-header {
                    padding: 12px;
                }

                .tbi-widget-small .tbi-widget-logo {
                    font-size: 16px;
                }

                .tbi-widget-small .tbi-widget-logo-icon {
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                }

                .tbi-widget-small .tbi-widget-content {
                    padding: 12px;
                }

                .tbi-widget-small .tbi-widget-title {
                    font-size: 16px;
                }

                .tbi-widget-small .tbi-widget-description {
                    font-size: 12px;
                    margin-bottom: 12px;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    async loadContent() {
        this.isLoading = true;
        this.error = null;
        this.render();

        try {
            let endpoint = '';
            let fields = [];

            switch (this.config.type) {
                case 'destination':
                    endpoint = `items/destinations/${this.config.id}`;
                    fields = [
                        'id', 'type', 'image',
                        'translations.destination_name',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.slug_permalink',
                        'translations.languages_code'
                    ];
                    break;

                case 'company':
                    endpoint = `items/companies/${this.config.id}`;
                    fields = [
                        'id', 'company_name', 'image', 'slug_permalink',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.description',
                        'translations.languages_code'
                    ];
                    break;

                case 'article':
                    endpoint = `items/articles/${this.config.id}`;
                    fields = [
                        'id', 'image', 'status',
                        'translations.titolo_articolo',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.slug_permalink',
                        'translations.languages_code'
                    ];
                    break;
            }

            const languageCodes = this.languages.map(l => l.code).join(',');
            const url = `${this.apiUrl}/${endpoint}?fields=${fields.join(',')}&deep[translations][_filter][languages_code][_in]=${languageCodes}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.content = data.data;
            this.isLoading = false;
            this.render();

        } catch (error) {
            console.warn('Widget API error, using fallback:', error);
            this.createFallbackContent();
            this.isLoading = false;
            this.render();
        }
    }

    createFallbackContent() {
        const fallbackTranslations = this.languages.map(lang => {
            switch (this.config.type) {
                case 'destination':
                    return {
                        languages_code: lang.code,
                        destination_name: this.getFallbackDestinationName(lang.code),
                        seo_title: `Discover ${this.config.id} - TheBestItaly`,
                        seo_summary: `Explore the beauty and culture of ${this.config.id} with our premium travel guide.`,
                        slug_permalink: this.config.id
                    };

                case 'company':
                    return {
                        languages_code: lang.code,
                        seo_title: `${this.config.id} - Italian Excellence`,
                        seo_summary: `Discover authentic Italian craftsmanship and tradition.`,
                        description: `Premium Italian company specializing in excellence.`
                    };

                case 'article':
                    return {
                        languages_code: lang.code,
                        titolo_articolo: this.getFallbackArticleTitle(lang.code),
                        seo_title: `${this.config.id} - TheBestItaly Magazine`,
                        seo_summary: `Read our latest insights about Italian culture, travel, and lifestyle.`,
                        slug_permalink: this.config.id
                    };
            }
        });

        this.content = {
            id: this.config.id,
            image: null,
            translations: fallbackTranslations
        };
    }

    getFallbackDestinationName(langCode) {
        const translations = {
            'it': 'Destinazione Italiana',
            'en': 'Italian Destination',
            'fr': 'Destination Italienne',
            'es': 'Destino Italiano',
            'de': 'Italienisches Reiseziel',
            'pt': 'Destino Italiano',
            'ru': 'Итальянское направление',
            'zh': '意大利目的地',
            'ja': 'イタリアの目的地',
            'ar': 'وجهة إيطالية'
        };
        return translations[langCode] || translations['en'];
    }

    getFallbackArticleTitle(langCode) {
        const translations = {
            'it': 'Articolo Italiano',
            'en': 'Italian Article',
            'fr': 'Article Italien',
            'es': 'Artículo Italiano',
            'de': 'Italienischer Artikel',
            'pt': 'Artigo Italiano',
            'ru': 'Итальянская статья',
            'zh': '意大利文章',
            'ja': 'イタリアの記事',
            'ar': 'مقال إيطالي'
        };
        return translations[langCode] || translations['en'];
    }

    getTranslation(field) {
        if (!this.content?.translations) return '';
        
        const translation = this.content.translations.find(t => t.languages_code === this.currentLanguage);
        return translation?.[field] || '';
    }

    getTitle() {
        switch (this.config.type) {
            case 'destination':
                return this.getTranslation('destination_name') || this.config.id.charAt(0).toUpperCase() + this.config.id.slice(1);
            case 'company':
                return this.content?.company_name || this.getTranslation('seo_title') || this.config.id;
            case 'article':
                return this.getTranslation('titolo_articolo') || this.getTranslation('seo_title') || this.config.id;
            default:
                return this.config.id;
        }
    }

    getDescription() {
        switch (this.config.type) {
            case 'destination':
                return this.getTranslation('seo_summary') || 'Discover this beautiful Italian destination';
            case 'company':
                return this.getTranslation('description') || this.getTranslation('seo_summary') || 'Italian excellence and craftsmanship';
            case 'article':
                return this.getTranslation('seo_summary') || 'Read our latest article about Italian culture';
            default:
                return 'Discover more on TheBestItaly';
        }
    }

    getUrl() {
        const slug = this.getTranslation('slug_permalink') || this.config.id;
        const langPrefix = this.currentLanguage === 'it' ? '' : `/${this.currentLanguage}`;
        
        switch (this.config.type) {
            case 'destination':
                return `${this.baseUrl}${langPrefix}/${slug}`;
            case 'company':
                return `${this.baseUrl}${langPrefix}/poi/${slug}`;
            case 'article':
                return `${this.baseUrl}${langPrefix}/magazine/${slug}`;
            default:
                return this.baseUrl;
        }
    }

    getCurrentLanguage() {
        return this.languages.find(l => l.code === this.currentLanguage) || this.languages[0];
    }

    changeLanguage(langCode) {
        this.currentLanguage = langCode;
        this.render();
    }

    toggleLanguageDropdown() {
        const dropdown = this.container.querySelector('.tbi-widget-lang-dropdown');
        dropdown.classList.toggle('show');
    }

    render() {
        const sizeClass = `tbi-widget-${this.config.size}`;
        const themeClass = `tbi-widget-${this.config.theme}`;
        const currentLang = this.getCurrentLanguage();

        if (this.isLoading) {
            this.container.innerHTML = `
                <div class="tbi-widget ${sizeClass} ${themeClass}">
                    <div class="tbi-widget-loading">
                        <div class="tbi-widget-spinner"></div>
                        Loading...
                    </div>
                </div>
            `;
            return;
        }

        if (this.error) {
            this.container.innerHTML = `
                <div class="tbi-widget ${sizeClass} ${themeClass}">
                    <div class="tbi-widget-error">
                        ⚠️ Unable to load content<br>
                        <small>${this.error}</small>
                    </div>
                </div>
            `;
            return;
        }

        const languageSelector = this.config.showSelector ? `
            <div class="tbi-widget-lang-selector" onclick="window.tbiWidget_${this.containerId}.toggleLanguageDropdown()">
                <span>🌍</span>
                <span>${currentLang.flag}</span>
                <div class="tbi-widget-lang-dropdown">
                    ${this.languages.map(lang => `
                        <div class="tbi-widget-lang-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                             onclick="window.tbiWidget_${this.containerId}.changeLanguage('${lang.code}'); event.stopPropagation();">
                            <span>${lang.flag}</span>
                            <span>${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        this.container.innerHTML = `
            <div class="tbi-widget ${sizeClass} ${themeClass}">
                <div class="tbi-widget-header">
                    <div class="tbi-widget-logo">
                        <div class="tbi-widget-logo-icon">✨</div>
                        <span>TheBestItaly</span>
                    </div>
                    ${languageSelector}
                </div>
                <div class="tbi-widget-content">
                    <div class="tbi-widget-title">${this.getTitle()}</div>
                    <div class="tbi-widget-description">${this.getDescription()}</div>
                    <div class="tbi-widget-footer">
                        <div class="tbi-widget-status">
                            <div class="tbi-widget-status-dot"></div>
                            <span>Available in 50+ languages</span>
                        </div>
                        <a href="${this.getUrl()}" target="_blank" class="tbi-widget-button">
                            Discover more
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Store reference for global access
        window[`tbiWidget_${this.containerId}`] = this;
    }
}

// Auto-initialize widgets
document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('[data-tbi-widget]');
    widgets.forEach(widget => {
        if (widget.id) {
            new TheBestItalyWidget(widget.id);
        }
    });
});

// Global constructor for manual initialization
window.TheBestItalyWidget = TheBestItalyWidget;
