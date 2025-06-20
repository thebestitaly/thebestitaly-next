/**
 * TheBestItaly Widget v3.1
 * Premium Translation Service Widget
 * Always loads all 50 available languages
 */

class TheBestItalyWidget {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            type: options.type || 'small', // small, medium, large
            contentType: options.contentType || 'destination', // destination, company, article
            contentId: options.contentId || null,
            language: options.language || 'it',
            ...options
        };
        
        this.baseUrl = 'https://thebestitaly.eu';
        this.apiUrl = 'https://thebestitaly.eu/api/directus';
        
        // All 50 languages - Premium service always includes all
        this.languages = [
            { code: 'af', name: 'Afrikaans' },
            { code: 'am', name: 'አማርኛ' },
            { code: 'ar', name: 'العربية' },
            { code: 'az', name: 'Azərbaycan' },
            { code: 'bg', name: 'Български' },
            { code: 'bn', name: 'বাংলা' },
            { code: 'ca', name: 'Català' },
            { code: 'cs', name: 'Čeština' },
            { code: 'da', name: 'Dansk' },
            { code: 'de', name: 'Deutsch' },
            { code: 'el', name: 'Ελληνικά' },
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'et', name: 'Eesti' },
            { code: 'fa', name: 'فارسی' },
            { code: 'fi', name: 'Suomi' },
            { code: 'fr', name: 'Français' },
            { code: 'he', name: 'עברית' },
            { code: 'hi', name: 'हिन्दी' },
            { code: 'hr', name: 'Hrvatski' },
            { code: 'hu', name: 'Magyar' },
            { code: 'hy', name: 'Հայերեն' },
            { code: 'id', name: 'Bahasa Indonesia' },
            { code: 'is', name: 'Íslenska' },
            { code: 'it', name: 'Italiano' },
            { code: 'ja', name: '日本語' },
            { code: 'ka', name: 'ქართული' },
            { code: 'ko', name: '한국어' },
            { code: 'lt', name: 'Lietuvių' },
            { code: 'lv', name: 'Latviešu' },
            { code: 'mk', name: 'Македонски' },
            { code: 'ms', name: 'Bahasa Melayu' },
            { code: 'nl', name: 'Nederlands' },
            { code: 'no', name: 'Norsk' },
            { code: 'pl', name: 'Polski' },
            { code: 'pt', name: 'Português' },
            { code: 'ro', name: 'Română' },
            { code: 'ru', name: 'Русский' },
            { code: 'sk', name: 'Slovenčina' },
            { code: 'sl', name: 'Slovenščina' },
            { code: 'sr', name: 'Српски' },
            { code: 'sv', name: 'Svenska' },
            { code: 'sw', name: 'Kiswahili' },
            { code: 'th', name: 'ไทย' },
            { code: 'tk', name: 'Türkmençe' },
            { code: 'tl', name: 'Filipino' },
            { code: 'tr', name: 'Türkçe' },
            { code: 'uk', name: 'Українська' },
            { code: 'ur', name: 'اردو' },
            { code: 'vi', name: 'Tiếng Việt' },
            { code: 'zh', name: '中文' },
            { code: 'zh-tw', name: '繁體中文' }
        ];
        
        this.currentLanguage = this.options.language;
        this.content = null;
        this.loading = true;
        this.error = null;
        
        this.init();
    }
    
    async init() {
        if (!this.container) {
            console.error(`Widget container #${this.containerId} not found`);
            return;
        }
        
        this.render();
        await this.loadContent();
    }
    
    async loadContent() {
        this.loading = true;
        this.render();
        
        try {
            let endpoint = '';
            let fields = [];
            
            switch (this.options.contentType) {
                case 'destination':
                    endpoint = 'items/destinations';
                    fields = [
                        'id', 'type', 'image', 'region_id', 'province_id',
                        'translations.destination_name',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.slug_permalink',
                        'translations.languages_code'
                    ];
                    break;
                    
                case 'company':
                    endpoint = 'items/companies';
                    fields = [
                        'id', 'company_name', 'image', 'slug_permalink',
                        'translations.seo_title',
                        'translations.seo_summary',
                        'translations.description',
                        'translations.languages_code'
                    ];
                    break;
                    
                case 'article':
                    endpoint = 'items/articles';
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
            
            const url = `${this.apiUrl}/${endpoint}/${this.options.contentId}?fields=${fields.join(',')}&deep[translations][_filter][languages_code][_in]=${this.languages.map(l => l.code).join(',')}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch content');
            
            const data = await response.json();
            this.content = data.data;
            this.loading = false;
            this.render();
            
        } catch (error) {
            console.warn('Widget API error, using fallback data:', error);
            this.createFallbackContent();
            this.loading = false;
            this.render();
        }
    }
    
    createFallbackContent() {
        // Create fallback content based on type
        const fallbackTranslations = this.languages.map(lang => {
            let name, seoTitle, summary, slug;
            
            switch (this.options.contentType) {
                case 'destination':
                    name = this.getFallbackDestinationName(lang.code);
                    seoTitle = `Discover ${name} - TheBestItaly`;
                    summary = `Explore the beauty and culture of ${name} with our premium travel guide.`;
                    slug = 'beautiful-destination';
                    return {
                        languages_code: lang.code,
                        destination_name: name,
                        seo_title: seoTitle,
                        seo_summary: summary,
                        slug_permalink: slug
                    };
                    
                case 'company':
                    name = this.getFallbackCompanyName(lang.code);
                    seoTitle = `${name} - Italian Excellence`;
                    summary = `Discover authentic Italian craftsmanship and tradition with ${name}.`;
                    return {
                        languages_code: lang.code,
                        nome_azienda: name,
                        seo_title: seoTitle,
                        seo_summary: summary
                    };
                    
                case 'article':
                    name = this.getFallbackArticleTitle(lang.code);
                    seoTitle = `${name} - TheBestItaly Magazine`;
                    summary = `Read our latest insights about Italian culture, travel, and lifestyle.`;
                    slug = 'italian-culture-guide';
                    return {
                        languages_code: lang.code,
                        titolo_articolo: name,
                        seo_title: seoTitle,
                        seo_summary: summary,
                        slug_permalink: slug
                    };
            }
        });
        
        this.content = {
            id: this.options.contentId || 'demo',
            image: null,
            translations: fallbackTranslations,
            slug_permalink: 'demo-content',
            nome_azienda: 'Italian Excellence'
        };
    }
    
    getFallbackDestinationName(langCode) {
        const names = {
            'it': 'Roma - Città Eterna',
            'en': 'Rome - The Eternal City',
            'fr': 'Rome - La Ville Éternelle',
            'es': 'Roma - La Ciudad Eterna',
            'de': 'Rom - Die Ewige Stadt',
            'pt': 'Roma - A Cidade Eterna',
            'ru': 'Рим - Вечный Город',
            'zh': '罗马 - 永恒之城',
            'ja': 'ローマ - 永遠の都',
            'ar': 'روما - المدينة الخالدة'
        };
        return names[langCode] || names['en'];
    }
    
    getFallbackCompanyName(langCode) {
        const names = {
            'it': 'Eccellenza Italiana',
            'en': 'Italian Excellence',
            'fr': 'Excellence Italienne',
            'es': 'Excelencia Italiana',
            'de': 'Italienische Exzellenz',
            'pt': 'Excelência Italiana',
            'ru': 'Итальянское Совершенство',
            'zh': '意大利卓越',
            'ja': 'イタリアの卓越性',
            'ar': 'التميز الإيطالي'
        };
        return names[langCode] || names['en'];
    }
    
    getFallbackArticleTitle(langCode) {
        const titles = {
            'it': 'Scopri l\'Italia Autentica',
            'en': 'Discover Authentic Italy',
            'fr': 'Découvrez l\'Italie Authentique',
            'es': 'Descubre la Italia Auténtica',
            'de': 'Entdecke das Authentische Italien',
            'pt': 'Descubra a Itália Autêntica',
            'ru': 'Откройте Подлинную Италию',
            'zh': '发现真正的意大利',
            'ja': '本物のイタリアを発見',
            'ar': 'اكتشف إيطاليا الأصيلة'
        };
        return titles[langCode] || titles['en'];
    }
    
    getTranslation(field) {
        if (!this.content || !this.content.translations) return '';
        
        const translation = this.content.translations.find(t => t.languages_code === this.currentLanguage);
        return translation ? translation[field] : '';
    }
    
    generateUrl() {
        if (!this.content) return this.baseUrl;
        
        const lang = this.currentLanguage;
        
        switch (this.options.contentType) {
            case 'destination':
                const slug = this.getTranslation('slug_permalink');
                if (!slug) return this.baseUrl;
                
                // Get region and province info for URL structure
                const regionId = this.content.region_id;
                const provinceId = this.content.province_id;
                
                // This would need actual region/province mapping
                // For now, return basic structure
                return `${this.baseUrl}/${lang}/${slug}`;
                
            case 'company':
                const companySlug = this.content.slug_permalink || this.getTranslation('slug_permalink');
                return `${this.baseUrl}/${lang}/poi/${companySlug}`;
                
            case 'article':
                const articleSlug = this.getTranslation('slug_permalink');
                return `${this.baseUrl}/${lang}/magazine/${articleSlug}`;
                
            default:
                return this.baseUrl;
        }
    }
    
    getDisplayName() {
        if (!this.content) return 'Loading...';
        
        switch (this.options.contentType) {
            case 'destination':
                return this.getTranslation('destination_name') || 'Destination';
            case 'company':
                return this.getTranslation('nome_azienda') || this.content.nome_azienda || 'Company';
            case 'article':
                return this.getTranslation('titolo_articolo') || 'Article';
            default:
                return 'Content';
        }
    }
    
    getSeoTitle() {
        return this.getTranslation('seo_title') || this.getDisplayName();
    }
    
    getDescription() {
        return this.getTranslation('seo_summary') || '';
    }
    
    getImage() {
        if (!this.content || !this.content.image) return null;
        return `https://directus-production-93f0.up.railway.app/assets/${this.content.image}?width=300&height=200&fit=cover`;
    }
    
    changeLanguage(langCode) {
        this.currentLanguage = langCode;
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        const widgetClass = `thebestitaly-widget thebestitaly-widget-${this.options.type}`;
        
        if (this.loading) {
            this.container.innerHTML = `
                <div class="${widgetClass}">
                    <div class="thebestitaly-widget-loading">
                        <div class="thebestitaly-widget-spinner"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const displayName = this.getDisplayName();
        const seoTitle = this.getSeoTitle();
        const description = this.getDescription();
        const image = this.getImage();
        const url = this.generateUrl();
        
        let content = '';
        
        // Language dropdown - ALWAYS all 50 languages
        const languageOptions = this.languages.map(lang => `
            <option value="${lang.code}" ${lang.code === this.currentLanguage ? 'selected' : ''}>
                ${lang.name}
            </option>
        `).join('');
        
        const languageDropdown = `
            <div class="thebestitaly-widget-language">
                <select onchange="window.thebestitalyWidgets['${this.containerId}'].changeLanguage(this.value)">
                    ${languageOptions}
                </select>
            </div>
        `;
        
        // Logo
        const logo = `
            <div class="thebestitaly-widget-logo">
                <img src="${this.baseUrl}/images/logo-black.webp" alt="TheBestItaly" />
            </div>
        `;
        
        // Visit button
        const visitButton = `
            <a href="${url}" target="_blank" class="thebestitaly-widget-button">
                Visit TheBestItaly
            </a>
        `;
        
        switch (this.options.type) {
            case 'small':
                content = `
                    <div class="thebestitaly-widget-header">
                        ${logo}
                        ${languageDropdown}
                    </div>
                    <div class="thebestitaly-widget-content">
                        <h3 class="thebestitaly-widget-title">${displayName}</h3>
                        ${visitButton}
                    </div>
                `;
                break;
                
            case 'medium':
                content = `
                    <div class="thebestitaly-widget-header">
                        ${logo}
                        ${languageDropdown}
                    </div>
                    <div class="thebestitaly-widget-content">
                        <h3 class="thebestitaly-widget-title">${displayName}</h3>
                        <p class="thebestitaly-widget-seo-title">${seoTitle}</p>
                        ${visitButton}
                    </div>
                `;
                break;
                
            case 'large':
                content = `
                    <div class="thebestitaly-widget-header">
                        ${logo}
                        ${languageDropdown}
                    </div>
                    <div class="thebestitaly-widget-content">
                        ${image ? `<img src="${image}" alt="${displayName}" class="thebestitaly-widget-image" />` : ''}
                        <h3 class="thebestitaly-widget-title">${displayName}</h3>
                        <p class="thebestitaly-widget-seo-title">${seoTitle}</p>
                        ${description ? `<p class="thebestitaly-widget-description">${description}</p>` : ''}
                        ${visitButton}
                    </div>
                `;
                break;
        }
        
        this.container.innerHTML = `
            <div class="${widgetClass}">
                ${content}
            </div>
        `;
    }
    
    getStyles() {
        return `
            <style>
                .thebestitaly-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #ffffff;
                    border: 1px solid #e0e0e0;
                    padding: 20px;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                
                .thebestitaly-widget-small {
                    width: 300px;
                    min-height: 150px;
                }
                
                .thebestitaly-widget-medium {
                    width: 400px;
                    min-height: 200px;
                }
                
                .thebestitaly-widget-large {
                    width: 100%;
                    min-height: 300px;
                }
                
                .thebestitaly-widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .thebestitaly-widget-logo img {
                    height: 30px;
                    width: auto;
                }
                
                .thebestitaly-widget-language select {
                    padding: 5px 10px;
                    border: 1px solid #ddd;
                    background: white;
                    font-size: 14px;
                    min-width: 120px;
                }
                
                .thebestitaly-widget-content {
                    text-align: center;
                }
                
                .thebestitaly-widget-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    margin-bottom: 15px;
                }
                
                .thebestitaly-widget-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 10px 0;
                    color: #333;
                }
                
                .thebestitaly-widget-seo-title {
                    font-size: 14px;
                    color: #666;
                    margin: 0 0 10px 0;
                }
                
                .thebestitaly-widget-description {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.4;
                    margin: 0 0 15px 0;
                }
                
                .thebestitaly-widget-button {
                    display: inline-block;
                    background: #007bff;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                
                .thebestitaly-widget-button:hover {
                    background: #0056b3;
                }
                
                .thebestitaly-widget-loading {
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                }
                
                .thebestitaly-widget-spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #007bff;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
}

// Global widget manager
window.thebestitalyWidgets = window.thebestitalyWidgets || {};

// Auto-initialize widgets
document.addEventListener('DOMContentLoaded', function() {
    // Add styles to page
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = new TheBestItalyWidget().getStyles();
    document.head.appendChild(styleSheet);
    
    // Initialize widgets
    const widgets = document.querySelectorAll('[data-thebestitaly-widget]');
    widgets.forEach(widget => {
        const options = {
            type: widget.dataset.type || 'small',
            contentType: widget.dataset.contentType || 'destination',
            contentId: widget.dataset.contentId,
            language: widget.dataset.language || 'it'
        };
        
        window.thebestitalyWidgets[widget.id] = new TheBestItalyWidget(widget.id, options);
    });
});

// Export for manual initialization
window.TheBestItalyWidget = TheBestItalyWidget;
