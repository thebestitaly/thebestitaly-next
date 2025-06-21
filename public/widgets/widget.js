/**
 * TheBestItaly Widget v4.3
 * Clean, Modern, Beautiful - PERFETTO COME L'IMMAGINE!
 * Supports all 50+ languages with BEAUTIFUL dropdown
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
            showSelector: this.container.dataset.showSelector !== 'false'
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
        this.dropdownOpen = false;

        this.init();
    }

    async init() {
        this.injectStyles();
        this.render();
        await this.loadContent();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }

    injectStyles() {
        if (document.getElementById('tbi-widget-styles')) return;

        const styles = `
            <style id="tbi-widget-styles">
                .tbi-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    border-radius: 12px;
                    overflow: visible;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                
                .tbi-widget:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }

                .tbi-widget-small { 
                    width: 320px; 
                    height: 160px; 
                }
                .tbi-widget-medium { 
                    width: 384px; 
                    height: 240px; 
                }
                .tbi-widget-large { 
                    width: 100%; 
                    min-height: 400px;
                    max-height: 600px;
                }

                .tbi-widget-light { background: white; color: #1f2937; border: 1px solid #e5e7eb; }
                .tbi-widget-dark { background: #1f2937; color: white; border: 1px solid #374151; }
                .tbi-widget-auto { background: white; color: #1f2937; border: 1px solid #e5e7eb; }

                @media (prefers-color-scheme: dark) {
                    .tbi-widget-auto { background: #1f2937; color: white; border: 1px solid #374151; }
                }

                .tbi-widget-header {
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                    border-radius: 12px 12px 0 0;
                    overflow: visible;
                }

                .tbi-widget-small .tbi-widget-header {
                    padding: 8px 12px;
                }

                .tbi-widget-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 16px;
                }

                .tbi-widget-small .tbi-widget-logo {
                    font-size: 14px;
                    gap: 6px;
                }

                .tbi-widget-logo-icon {
                    width: 24px;
                    height: 24px;
                    background: white;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .tbi-widget-small .tbi-widget-logo-icon {
                    width: 20px;
                    height: 20px;
                }

                .tbi-widget-logo-icon img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                /* NUOVO SELETTORE LINGUE COME NELL'IMMAGINE */
                .tbi-widget-lang-selector {
                    position: relative;
                    z-index: 1000;
                }

                .tbi-widget-lang-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.95);
                    border: 2px solid #60a5fa;
                    border-radius: 25px;
                    padding: 8px 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    font-weight: 500;
                    color: #1f2937;
                    min-width: 140px;
                    justify-content: space-between;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .tbi-widget-small .tbi-widget-lang-button {
                    padding: 6px 12px;
                    font-size: 12px;
                    min-width: 120px;
                    gap: 6px;
                }

                .tbi-widget-lang-button:hover {
                    background: white;
                    border-color: #3b82f6;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .tbi-widget-lang-current {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }

                .tbi-widget-small .tbi-widget-lang-current {
                    gap: 6px;
                }

                .tbi-widget-lang-flag {
                    font-size: 18px;
                    width: 24px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tbi-widget-small .tbi-widget-lang-flag {
                    font-size: 16px;
                    width: 20px;
                    height: 16px;
                }

                .tbi-widget-lang-name {
                    font-weight: 600;
                    color: #1f2937;
                }

                .tbi-widget-lang-arrow {
                    font-size: 12px;
                    color: #6b7280;
                    transition: transform 0.2s ease;
                    margin-left: 4px;
                }

                .tbi-widget-lang-button.open .tbi-widget-lang-arrow {
                    transform: rotate(180deg);
                }

                .tbi-widget-lang-dropdown {
                    position: absolute;
                    top: calc(100% + 4px);
                    right: 0;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    max-height: 250px;
                    overflow-y: auto;
                    z-index: 9999;
                    min-width: 200px;
                    display: none;
                    animation: fadeInDown 0.2s ease;
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .tbi-widget-lang-dropdown.show {
                    display: block;
                }

                .tbi-widget-lang-option {
                    padding: 12px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #1f2937;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    font-weight: 500;
                    border-bottom: 1px solid #f3f4f6;
                }

                .tbi-widget-lang-option:last-child {
                    border-bottom: none;
                    border-radius: 0 0 10px 10px;
                }

                .tbi-widget-lang-option:first-child {
                    border-radius: 10px 10px 0 0;
                }

                .tbi-widget-lang-option:hover {
                    background: #f8fafc;
                    color: #3b82f6;
                    transform: translateX(4px);
                }

                .tbi-widget-lang-option.active {
                    background: #eff6ff;
                    color: #3b82f6;
                    border-left: 4px solid #3b82f6;
                }

                .tbi-widget-lang-option-flag {
                    font-size: 18px;
                    width: 24px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tbi-widget-content {
                    padding: 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .tbi-widget-small .tbi-widget-content {
                    padding: 12px;
                }

                .tbi-widget-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    line-height: 1.2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .tbi-widget-small .tbi-widget-title {
                    font-size: 14px;
                    margin-bottom: 6px;
                }

                .tbi-widget-description {
                    font-size: 14px;
                    opacity: 0.75;
                    margin-bottom: 16px;
                    flex: 1;
                    line-height: 1.4;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                }

                .tbi-widget-small .tbi-widget-description {
                    font-size: 12px;
                    margin-bottom: 8px;
                    -webkit-line-clamp: 2;
                }

                .tbi-widget-large .tbi-widget-description {
                    -webkit-line-clamp: 8;
                    margin-bottom: 20px;
                }

                .tbi-widget-image {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 12px;
                }

                .tbi-widget-large .tbi-widget-image {
                    height: 200px;
                    margin-bottom: 16px;
                }

                .tbi-widget-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: auto;
                }

                .tbi-widget-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 500;
                    opacity: 0.7;
                }

                .tbi-widget-small .tbi-widget-status {
                    font-size: 9px;
                    gap: 4px;
                }

                .tbi-widget-status-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                }

                .tbi-widget-small .tbi-widget-status-dot {
                    width: 4px;
                    height: 4px;
                }

                .tbi-widget-visit-link {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-decoration: none;
                    display: inline-block;
                }

                .tbi-widget-small .tbi-widget-visit-link {
                    padding: 4px 8px;
                    font-size: 10px;
                }

                .tbi-widget-visit-link:hover {
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

                .tbi-widget-large .tbi-widget-content {
                    padding: 20px;
                }

                .tbi-widget-large .tbi-widget-title {
                    font-size: 24px;
                    margin-bottom: 12px;
                }

                .tbi-widget-large .tbi-widget-description {
                    font-size: 16px;
                    line-height: 1.6;
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
                        'id', 'type', 'image', 'region_id', 'province_id',
                        'translations.destination_name',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.slug_permalink',
                        'translations.languages_code',
                        'translations.content'
                    ];
                    break;

                case 'company':
                    // For companies, search by slug_permalink instead of ID
                    endpoint = `items/companies`;
                    fields = [
                        'id', 'company_name', 'image', 'slug_permalink',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.description',
                        'translations.languages_code',
                        'translations.content'
                    ];
                    break;

                case 'article':
                    endpoint = `items/articles/${this.config.id}`;
                    fields = [
                        'id', 'image', 'status', 'date_created',
                        'translations.titolo_articolo',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.slug_permalink',
                        'translations.languages_code',
                        'translations.content'
                    ];
                    break;
            }

            const languageCodes = this.languages.map(l => l.code).join(',');
            let url = `${this.apiUrl}/${endpoint}?fields=${fields.join(',')}&deep[translations][_filter][languages_code][_in]=${languageCodes}`;
            
            // For companies, add filter by slug_permalink
            if (this.config.type === 'company') {
                url += `&filter[slug_permalink][_eq]=${this.config.id}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            
            // For companies, take the first result since we filtered by slug
            this.content = this.config.type === 'company' ? data.data[0] : data.data;
            
            if (!this.content) {
                throw new Error('Content not found');
            }
            
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
                        slug_permalink: this.config.id,
                        content: `<p>Discover the authentic beauty of ${this.config.id}, one of Italy's most fascinating destinations.</p>`
                    };

                case 'company':
                    return {
                        languages_code: lang.code,
                        seo_title: `${this.config.id} - Italian Excellence`,
                        seo_summary: `Discover authentic Italian craftsmanship and tradition.`,
                        description: `Premium Italian company specializing in excellence.`,
                        content: `<p>Experience the finest Italian craftsmanship and tradition with this exceptional company.</p>`
                    };

                case 'article':
                    return {
                        languages_code: lang.code,
                        titolo_articolo: this.getFallbackArticleTitle(lang.code),
                        seo_title: `${this.config.id} - TheBestItaly Magazine`,
                        seo_summary: `Read our latest insights about Italian culture, travel, and lifestyle.`,
                        slug_permalink: this.config.id,
                        content: `<p>Explore the rich culture and heritage of Italy through our comprehensive guide.</p>`
                    };
            }
        });

        this.content = {
            id: this.config.id,
            image: null,
            slug_permalink: this.config.id,
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
        // For large widgets, get full content
        if (this.config.size === 'large') {
            const content = this.getTranslation('content');
            if (content) {
                // Strip HTML tags and return plain text
                const div = document.createElement('div');
                div.innerHTML = content;
                return div.textContent || div.innerText || '';
            }
        }

        // For smaller widgets, use summary
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
        const slug = this.getTranslation('slug_permalink') || this.content?.slug_permalink || this.config.id;
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

    getImage() {
        if (!this.content?.image) return null;
        return `https://directus-production-93f0.up.railway.app/assets/${this.content.image}?width=400&height=300&fit=cover&quality=80`;
    }

    getCurrentLanguage() {
        return this.languages.find(l => l.code === this.currentLanguage) || this.languages[0];
    }

    changeLanguage(langCode) {
        this.currentLanguage = langCode;
        this.closeDropdown();
        this.render();
    }

    toggleLanguageDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        const dropdown = this.container.querySelector('.tbi-widget-lang-dropdown');
        const button = this.container.querySelector('.tbi-widget-lang-button');
        
        if (dropdown && button) {
            if (this.dropdownOpen) {
                dropdown.classList.add('show');
                button.classList.add('open');
            } else {
                dropdown.classList.remove('show');
                button.classList.remove('open');
            }
        }
    }

    closeDropdown() {
        this.dropdownOpen = false;
        const dropdown = this.container.querySelector('.tbi-widget-lang-dropdown');
        const button = this.container.querySelector('.tbi-widget-lang-button');
        
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        if (button) {
            button.classList.remove('open');
        }
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
            <div class="tbi-widget-lang-selector">
                <div class="tbi-widget-lang-button ${this.dropdownOpen ? 'open' : ''}" onclick="window.tbiWidget_${this.containerId}.toggleLanguageDropdown(); event.stopPropagation();">
                    <div class="tbi-widget-lang-current">
                        <span class="tbi-widget-lang-flag">${currentLang.flag}</span>
                        <span class="tbi-widget-lang-name">${currentLang.name}</span>
                    </div>
                    <span class="tbi-widget-lang-arrow">▼</span>
                </div>
                <div class="tbi-widget-lang-dropdown ${this.dropdownOpen ? 'show' : ''}">
                    ${this.languages.map(lang => `
                        <div class="tbi-widget-lang-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                             onclick="window.tbiWidget_${this.containerId}.changeLanguage('${lang.code}'); event.stopPropagation();">
                            <span class="tbi-widget-lang-option-flag">${lang.flag}</span>
                            <span>${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const image = this.getImage();
        const imageHtml = image && this.config.size !== 'small' ? `
            <img src="${image}" alt="${this.getTitle()}" class="tbi-widget-image" />
        ` : '';

        this.container.innerHTML = `
            <div class="tbi-widget ${sizeClass} ${themeClass}">
                <div class="tbi-widget-header">
                    <div class="tbi-widget-logo">
                        <div class="tbi-widget-logo-icon">
                            <img src="https://thebestitaly.eu/_next/image?url=%2Fimages%2Flogo-black.webp&w=256&q=75" alt="TheBestItaly" />
                        </div>
                        <span>TheBestItaly</span>
                    </div>
                    ${languageSelector}
                </div>
                <div class="tbi-widget-content">
                    ${imageHtml}
                    <div class="tbi-widget-title">${this.getTitle()}</div>
                    <div class="tbi-widget-description">${this.getDescription()}</div>
                    <div class="tbi-widget-footer">
                        <div class="tbi-widget-status">
                            <div class="tbi-widget-status-dot"></div>
                            <span>50+ languages</span>
                        </div>
                        <a href="${this.getUrl()}" target="_blank" class="tbi-widget-visit-link">
                            ${this.config.size === 'small' ? 'Visita' : 'Visita sito'}
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
