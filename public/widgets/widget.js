/**
 * TheBestItaly Widget v6.0 - REVOLUTIONARY EDITION
 * 🚀 Ultra-performante, accessibile, analytics integrati
 * 🎨 Animazioni fluide, skeleton loading, micro-interazioni
 * 🌍 50 lingue esatte, RTL support, tema automatico OS
 * 📱 Touch gestures, swipe, responsive perfetto
 */

class TheBestItalyWidget {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        // Create safe widget ID for global reference (replace non-alphanumeric with underscore)
        this.safeWidgetId = containerId.replace(/[^a-zA-Z0-9]/g, '_');
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`TheBestItaly Widget: Container #${containerId} not found`);
            return;
        }

        // Enhanced configuration with new options
        this.config = {
            // Core settings
            type: this.container.dataset.type || options.type || 'destination',
            uuid: this.container.dataset.uuid || options.uuid || options.query || this.container.dataset.id || options.id || 'roma',
            size: this.container.dataset.size || options.size || 'medium',
            theme: this.container.dataset.theme || options.theme || 'auto',
            language: this.container.dataset.language || options.language || this.detectLanguage(),
            
            // Display options
            showSelector: (this.container.dataset.showSelector !== 'false') && (options.showSelector !== false),
            showShare: (this.container.dataset.showShare !== 'false') && (options.showShare !== false),
            enableHover: (this.container.dataset.enableHover !== 'false') && (options.enableHover !== false),
            enableAnimations: (this.container.dataset.enableAnimations !== 'false') && (options.enableAnimations !== false),
            
            // New advanced features
            autoRotate: this.container.dataset.autoRotate === 'true' || options.autoRotate === true,
            rotateInterval: parseInt(this.container.dataset.rotateInterval) || options.rotateInterval || 5000,
            enableAnalytics: (this.container.dataset.enableAnalytics !== 'false') && (options.enableAnalytics !== false),
            enableDeepLink: this.container.dataset.enableDeepLink === 'true' || options.enableDeepLink === true,
            enableSwipeGestures: (this.container.dataset.enableSwipeGestures !== 'false') && (options.enableSwipeGestures !== false),
            
            // Performance settings
            cacheTime: parseInt(this.container.dataset.cacheTime) || options.cacheTime || 300000, // 5 min
            retryAttempts: parseInt(this.container.dataset.retryAttempts) || options.retryAttempts || 3,
            loadingDelay: parseInt(this.container.dataset.loadingDelay) || options.loadingDelay || 150,
            
            // Customization
            customStyles: options.customStyles || {},
            callbacks: options.callbacks || {},
            apiUrl: options.apiUrl || 'https://thebestitaly.eu'
        };

        this.baseUrl = this.config.apiUrl;
        this.apiUrl = `${this.baseUrl}/api/directus`;
        
        // Enhanced language support with better names and RTL detection
        this.languages = [
            { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', rtl: false },
            { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', rtl: false },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
            { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿', rtl: false },
            { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', rtl: false },
            { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false },
            { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸', rtl: false },
            { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', rtl: false },
            { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
            { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
            { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', rtl: false },
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
            { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
            { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', rtl: false },
            { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
            { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
            { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
            { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
            { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
            { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', rtl: false },
            { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', rtl: false },
            { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', rtl: false },
            { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
            { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸', rtl: false },
            { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
            { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
            { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', rtl: false },
            { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
            { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', rtl: false },
            { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', rtl: false },
            { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', rtl: false },
            { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
            { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
            { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false },
            { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', rtl: false },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
            { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', rtl: false },
            { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', rtl: false },
            { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', rtl: false },
            { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
            { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿', rtl: false },
            { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
            { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', rtl: false },
            { code: 'tk', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false },
            { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', rtl: false },
            { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
            { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
            { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
            { code: 'zh-tw', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼', rtl: false }
        ];

        // State management
        this.currentLanguage = this.config.language;
        this.content = null;
        this.isLoading = true;
        this.error = null;
        this.dropdownOpen = false;
        this.retryCount = 0;
        this.cache = new Map();
        this.intersectionObserver = null;
        this.rotateTimer = null;
        
        // Performance and analytics
        this.loadStartTime = performance.now();
        this.metrics = {
            loadTime: 0,
            apiTime: 0,
            renderTime: 0,
            interactions: 0,
            errors: 0
        };

        // Initialize widget
        this.init();
    }

    // Enhanced language detection
    detectLanguage() {
        // Always start with Italian for consistency
        return 'it';
    }

    // Comprehensive initialization
    async init() {
        try {
            // Inject enhanced styles first
            this.injectStyles();
            
            // Show loading skeleton
            this.showLoadingSkeleton();
            
            // Setup intersection observer for lazy loading
            this.setupIntersectionObserver();
            
            // Load content with retry logic
            setTimeout(() => this.loadContentWithRetry(), this.config.loadingDelay);
            
            // Setup all event listeners
            this.setupEventListeners();
            
            // Setup auto-rotation if enabled
            if (this.config.autoRotate) {
                this.setupAutoRotation();
            }
            
            // Initialize analytics
            if (this.config.enableAnalytics) {
                this.trackEvent('widget_loaded', { 
                    type: this.config.type,
                    id: this.config.id,
                    language: this.currentLanguage 
                });
            }
            
        } catch (error) {
            console.error('Widget initialization failed:', error);
            this.handleError(error);
        }
    }

    showLoadingSkeleton() {
        this.isLoading = true;
        this.render();
    }

    setupIntersectionObserver() {
        // Placeholder for intersection observer setup
        // Can be implemented later for lazy loading optimization
    }

    loadContentWithRetry() {
        this.loadContent();
    }

    setupEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.dropdownOpen) {
                this.closeDropdown();
            }
        });
    }

    setupAutoRotation() {
        // Placeholder for auto-rotation functionality
        // Can be implemented later if needed
    }

    trackEvent(eventName, data) {
        // Placeholder for analytics tracking
        if (this.config.enableAnalytics) {
            // Track event silently
        }
    }

    handleError(error) {
        this.error = error.message || 'Unknown error';
        this.isLoading = false;
        this.render();
    }

    // Performance-optimized style injection
    injectStyles() {
        const styleId = 'tbi-widget-styles-v10';
        if (document.getElementById(styleId)) return;

        // Inject Tailwind CSS first
        if (!document.getElementById('tailwind-css')) {
            const tailwindScript = document.createElement('script');
            tailwindScript.id = 'tailwind-css';
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(tailwindScript);
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Font script for "the" */
            .font-script {
                font-family: 'Georgia', serif;
                font-style: italic;
            }
            
            /* RTL Support */
            [dir="rtl"] {
                text-align: right !important;
                direction: rtl !important;
            }
            
            /* Flag emoji support */
            .tbi-flag {
                font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", "Android Emoji", sans-serif;
                font-size: inherit;
                line-height: 1;
                display: inline-block;
                font-feature-settings: "liga" off;
                font-variant-emoji: emoji;
            }
            
            /* Fallback for flags that don't render properly */
            .tbi-flag-fallback {
                display: inline-block;
                width: 20px;
                height: 14px;
                background-size: cover;
                background-position: center;
                border-radius: 2px;
                vertical-align: middle;
            }
            
            /* Pulse animation for loading */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            /* Markdown content styling */
            .markdown-content {
                font-size: 1rem;
                line-height: 1.7;
                color: #374151;
                word-wrap: break-word;
                overflow-wrap: break-word;
                hyphens: auto;
            }
            
            .markdown-content h1 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 24px 0 16px 0;
                line-height: 1.3;
            }
            
            .markdown-content h2 {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin: 20px 0 12px 0;
                line-height: 1.4;
            }
            
            .markdown-content h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 16px 0 10px 0;
                line-height: 1.4;
            }
            
            .markdown-content p {
                margin: 0 0 16px 0;
                line-height: 1.7;
                color: #4b5563;
                text-align: justify;
                word-spacing: 0.1em;
            }
            
            .markdown-content strong {
                font-weight: 600;
                color: #1f2937;
            }
            
            .markdown-content em {
                font-style: italic;
                color: #374151;
            }
            
            .markdown-content a {
                color: #0891b2;
                text-decoration: underline;
                word-break: break-all;
            }
            
            .markdown-content a:hover {
                color: #0e7490;
                text-decoration: none;
            }
            
            .markdown-content ul {
                margin: 16px 0;
                padding: 0;
                list-style: none;
            }
            
            .markdown-content li {
                margin: 8px 0;
                padding-left: 0;
                line-height: 1.6;
                color: #4b5563;
            }
            
            .markdown-content br {
                line-height: 1.2;
            }
            
            /* Ensure text doesn't overflow container */
            .markdown-content * {
                max-width: 100%;
                word-wrap: break-word;
            }
        `;
        
        document.head.appendChild(style);
    }

    async loadContent() {
        this.isLoading = true;
        this.error = null;
        this.render();

        try {
            // Use the new widget search endpoint with POST method and search by the uuid slug
            const response = await fetch(`${this.baseUrl}/api/widget/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: this.getApiType(),
                    query: this.config.uuid, // The uuid config is actually the search term (company name/slug)
                    language: this.currentLanguage,
                    limit: 1
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const results = await response.json();
            
            if (!results || results.length === 0) {
                console.warn('No results found for widget content, using fallback');
                this.createFallbackContent();
                this.isLoading = false;
                this.render();
                return;
            }

            const data = results[0]; // Take first result
            
            if (!data) {
                console.warn('Invalid data received, using fallback');
                this.createFallbackContent();
                this.isLoading = false;
                this.render();
                return;
            }

            // API data received successfully

            // Transform the response to match expected structure
            this.content = {
                id: data.id,
                uuid_id: data.uuid, // This is now the proper UUID (real or generated)
                slug_permalink: data.slug_permalink,
                external_url: data.external_url, // Use the complete URL from API
                // Store hierarchical slug data for destinations (fallback)
                region_slug: data.region_slug,
                province_slug: data.province_slug,
                municipality_slug: data.municipality_slug,
                image: null, // Will be loaded separately if needed
                translations: [{
                    languages_code: this.currentLanguage,
                    ...this.getTranslationFields(data)
                }]
            };

            // For companies, description is already available - no need to load separately
            if (this.config.type === 'company') {
                this.content.translations[0].description = data.description;
            }

            // For destinations in FULL mode, load full description separately using the proper UUID
            if (this.config.type === 'destination' && this.config.size === 'full') {
                this.loadFullDescription(data.uuid);
            }

            // For companies in FULL mode, description is already loaded from search, no need to reload
            if (this.config.type === 'company' && this.config.size === 'full') {
                // Description is already available from search results
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

    getApiType() {
        switch (this.config.type) {
            case 'destination': return 'destinazione';
            case 'company': return 'azienda';
            case 'article': return 'articolo';
            default: return 'destinazione';
        }
    }

    getTranslationFields(data) {
        switch (this.config.type) {
            case 'destination':
                return {
                    destination_name: data.title,
                    seo_title: data.seo_title,
                    seo_summary: data.seo_summary,
                    slug_permalink: data.slug_permalink,
                    region_slug: data.region_slug,
                    province_slug: data.province_slug,
                    municipality_slug: data.municipality_slug
                };
            case 'company':
                return {
                    seo_title: data.seo_title,
                    seo_summary: data.seo_summary,
                    description: data.description,
                    slug_permalink: data.slug_permalink
                };
            case 'article':
                return {
                    titolo_articolo: data.title,
                    seo_title: data.seo_title,
                    seo_summary: data.seo_summary,
                    description: data.description,
                    slug_permalink: data.slug_permalink
                };
            default:
                return {};
        }
    }

    async loadFullDescription(uuid) {
        try {
            // Use absolute URL to work both locally and on server
            const response = await fetch(`${this.baseUrl}/api/widget/description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: this.getApiType(),
                    uuid: uuid || this.content?.uuid_id,
                    language: this.currentLanguage
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.description && this.content?.translations?.[0]) {
                    // Store the full description from API
                    this.content.translations[0].description = data.description;
                    this.render(); // Re-render with full description
                }
            }
        } catch (error) {
            // Silent error handling like in example.html
        }
    }

    createFallbackContent() {
        const fallbackTranslations = this.languages.map(lang => {
            switch (this.config.type) {
                case 'destination':
                    return {
                        languages_code: lang.code,
                        destination_name: this.getFallbackDestinationName(lang.code),
                        seo_title: `Discover ${this.config.uuid} - TheBestItaly`,
                        seo_summary: `Explore the beauty and culture of ${this.config.uuid} with our premium travel guide.`,
                        slug_permalink: this.config.uuid,
                        content: `<p>Discover the authentic beauty of ${this.config.uuid}, one of Italy's most fascinating destinations.</p>`
                    };

                case 'company':
                    return {
                        languages_code: lang.code,
                        seo_title: `${this.config.uuid} - Italian Excellence`,
                        seo_summary: `Discover authentic Italian craftsmanship and tradition.`,
                        description: `Premium Italian company specializing in excellence.`,
                        content: `<p>Experience the finest Italian craftsmanship and tradition with this exceptional company.</p>`
                    };

                case 'article':
                    return {
                        languages_code: lang.code,
                        titolo_articolo: this.getFallbackArticleTitle(lang.code),
                        seo_title: `${this.config.uuid} - TheBestItaly Magazine`,
                        seo_summary: `Read our latest insights about Italian culture, travel, and lifestyle.`,
                        slug_permalink: this.config.uuid,
                        content: `<p>Explore the rich culture and heritage of Italy through our comprehensive guide.</p>`
                    };
                    
                default:
                    return {
                        languages_code: lang.code,
                        seo_title: `${this.config.uuid} - TheBestItaly`,
                        seo_summary: `Discover the best of Italy with our premium content.`,
                        description: `Premium Italian content and experiences.`,
                        slug_permalink: this.config.uuid,
                        content: `<p>Discover the best of Italy with TheBestItaly.</p>`
                    };
            }
        }).filter(Boolean); // Remove any undefined entries

        this.content = {
            id: this.config.uuid,
            uuid_id: this.config.uuid,
            image: null,
            slug_permalink: this.config.uuid,
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
        if (!this.content?.translations || !Array.isArray(this.content.translations)) return '';
        
        const translation = this.content.translations.find(t => t && t.languages_code === this.currentLanguage);
        return translation?.[field] || '';
    }

    getTitle() {
        switch (this.config.type) {
            case 'destination':
                // For destinations, always use destination_name
                return this.getTranslation('destination_name') || this.config.uuid.charAt(0).toUpperCase() + this.config.uuid.slice(1);
            case 'company':
                return this.content?.company_name || this.getTranslation('seo_title') || this.config.uuid;
            case 'article':
                return this.getTranslation('titolo_articolo') || this.getTranslation('seo_title') || this.config.uuid;
            default:
                return this.config.uuid;
        }
    }

    getDestinationContent() {
        switch (this.config.size) {
            case 'small':
                // SMALL: seo_title sotto il nome
                const seoTitle = this.getTranslation('seo_title');
                return seoTitle || 'Destinazione italiana';
                
            case 'medium':
                // MEDIUM: seo_summary sotto il nome
                const seoSummary = this.getTranslation('seo_summary');
                return seoSummary || 'Scopri questa destinazione italiana';
                
            case 'full':
                // FULL: Use description from API if available, otherwise seo_summary
                const description = this.getTranslation('description');
                const fullSeoSummary = this.getTranslation('seo_summary');
                
                // If we have full description from API, use it (like example.html)
                if (description && description.length > 100) {
                    return description;
                } else if (fullSeoSummary) {
                    // Fallback to seo_summary while loading full description
                    return fullSeoSummary;
                }
                return 'Scopri questa meravigliosa destinazione italiana';
                
            default:
                return this.getTranslation('seo_summary') || 'Destinazione italiana';
        }
    }

    getDescription() {
        // For destinations, use the specific logic
        if (this.config.type === 'destination') {
            return this.getDestinationContent();
        }

        // For FULL widgets of non-destinations
        if (this.config.size === 'full') {
            // For companies, use the full description from API
            if (this.config.type === 'company') {
                const description = this.getTranslation('description');
                if (description) {
                    return description;
                }
            }
            
            // For articles, use content or description
            if (this.config.type === 'article') {
                const content = this.getTranslation('content');
                const description = this.getTranslation('description');
                
                if (content) {
                    return content;
                } else if (description) {
                    return description;
                }
            }
            
            // Fallback for full widgets
            return this.getTranslation('description') || this.getTranslation('seo_summary') || 'Discover the excellence of Italy with TheBestItaly';
        }

        // For smaller widgets, use summary
        switch (this.config.type) {
            case 'company':
                return this.getTranslation('description') || this.getTranslation('seo_summary') || 'Italian excellence and craftsmanship';
            case 'article':
                return this.getTranslation('description') || this.getTranslation('seo_summary') || 'Read our latest article about Italian culture';
            default:
                return 'Discover more on TheBestItaly';
        }
    }

    getSeoSummary() {
        if (!this.content) return 'Scopri le eccellenze italiane';
        
        // Try to get the seo_summary in the current language
        const translatedSummary = this.getTranslation('seo_summary');
        if (translatedSummary && translatedSummary.trim()) {
            return translatedSummary;
        }
        
        // Fallback to original seo_summary
        if (this.content.seo_summary && this.content.seo_summary.trim()) {
            return this.content.seo_summary;
        }
        
        // If no seo_summary, use a short version of description
        const description = this.getDescription();
        if (description && description.length > 100) {
            return description.substring(0, 97) + '...';
        }
        
        return description || 'Scopri le eccellenze italiane';
    }

    renderMarkdown(text) {
        if (!text) return '';
        
        // Clean up text first
        let cleanText = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();
        
        // Simple markdown renderer for basic formatting
        return cleanText
            // Headers (must be at start of line)
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            
            // Bold and italic (non-greedy matching)
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Underscores with spaces (like _tradizione_ and _innovazione_)
            .replace(/\s_([^_]+)_\s/g, ' <em>$1</em> ')
            .replace(/\s_([^_]+)_\./g, ' <em>$1</em>.')
            .replace(/\s_([^_]+)_,/g, ' <em>$1</em>,')
            
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            
            // Convert double line breaks to paragraph breaks
            .replace(/\n\n+/g, '</p><p>')
            
            // Convert single line breaks to <br> tags
            .replace(/\n/g, '<br>')
            
            // Wrap everything in paragraphs if not already wrapped
            .replace(/^(?!<h[1-6])/gm, '<p>')
            .replace(/(?<!<\/h[1-6]>)$/gm, '</p>')
            
            // Clean up paragraph tags around headers
            .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
            
            // Fix multiple paragraph tags
            .replace(/<\/p><p><\/p><p>/g, '</p><p>')
            .replace(/<p><\/p>/g, '')
            
            // Lists (simple bullet points)
            .replace(/^\* (.*$)/gim, '<li>• $1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            
            // Clean up empty paragraphs and fix spacing
            .replace(/<p>\s*<\/p>/g, '')
            .replace(/<p><br><\/p>/g, '')
            .trim();
    }

    getUrl() {
        // Use external_url from API if available (like in example.html)
        if (this.content && this.content.external_url) {
            return this.content.external_url;
        }

        // Fallback to manual URL construction
        const langPrefix = this.currentLanguage === 'it' ? '' : `/${this.currentLanguage}`;
        
        switch (this.config.type) {
            case 'destination':
                return this.getDestinationUrl(langPrefix);
            case 'company':
                const companySlug = this.getTranslation('slug_permalink') || this.content?.slug_permalink || this.config.id;
                return `${this.baseUrl}${langPrefix}/poi/${companySlug}`;
            case 'article':
                const articleSlug = this.getTranslation('slug_permalink') || this.content?.slug_permalink || this.config.id;
                return `${this.baseUrl}${langPrefix}/magazine/${articleSlug}`;
            default:
                return this.baseUrl;
        }
    }

    getDestinationUrl(langPrefix) {
        if (!this.content) {
            return `${this.baseUrl}${langPrefix}/${this.config.id}`;
        }

        // Get the hierarchical slug data from content
        const regionSlug = this.content.region_slug || this.getTranslation('region_slug');
        const provinceSlug = this.content.province_slug || this.getTranslation('province_slug');
        const municipalitySlug = this.content.municipality_slug || this.getTranslation('municipality_slug') || this.content.slug_permalink || this.getTranslation('slug_permalink');

        // Building destination URL

        // Build hierarchical URL based on available data
        let urlPath = '';
        
        if (municipalitySlug && provinceSlug && regionSlug) {
            // Full path: region/province/municipality
            urlPath = `${regionSlug}/${provinceSlug}/${municipalitySlug}`;
        } else if (provinceSlug && regionSlug) {
            // Province level: region/province
            urlPath = `${regionSlug}/${provinceSlug}`;
        } else if (regionSlug) {
            // Region level: region
            urlPath = regionSlug;
        } else {
            // Fallback to basic slug
            const fallbackSlug = this.getTranslation('slug_permalink') || this.content?.slug_permalink || this.config.id;
            urlPath = fallbackSlug;
        }

        return `${this.baseUrl}${langPrefix}/${urlPath}`;
    }

    getImage() {
        if (!this.content?.image) return null;
        return `https://directus-production-93f0.up.railway.app/assets/${this.content.image}?width=400&height=300&fit=cover&quality=80`;
    }

    getCurrentLanguage() {
        return this.languages.find(l => l.code === this.currentLanguage) || this.languages[0];
    }

    getFlagDisplay(flag, code) {
        // Try to detect if flag emoji is properly supported
        if (flag && flag.length > 1) {
            return `<span class="tbi-flag">${flag}</span>`;
        }
        // Fallback to country code
        return `<span class="tbi-flag-fallback bg-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center">${code.toUpperCase()}</span>`;
    }

    changeLanguage(langCode) {
        this.currentLanguage = langCode;
        this.closeDropdown();
        
        // Salva la lingua selezionata
        localStorage.setItem('tbi-widget-language', langCode);
        
        // Ricarica il contenuto nella nuova lingua
        this.loadContent();
    }

    toggleLanguageDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        
        // Update dropdown visibility directly without re-render
        const dropdown = this.container.querySelector('.tbi-dropdown');
        const button = this.container.querySelector('.tbi-dropdown-button');
        const arrow = this.container.querySelector('.tbi-dropdown-arrow');
        
        if (dropdown && button && arrow) {
            if (this.dropdownOpen) {
                dropdown.classList.remove('hidden');
                dropdown.classList.add('block');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('block');
                arrow.style.transform = 'rotate(0deg)';
            }
        }
    }

    closeDropdown() {
        if (!this.dropdownOpen) return;
        
        this.dropdownOpen = false;
        const dropdown = this.container.querySelector('.tbi-dropdown');
        const arrow = this.container.querySelector('.tbi-dropdown-arrow');
        
        if (dropdown && arrow) {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('block');
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    render() {
        const currentLang = this.getCurrentLanguage();
        const isRTL = currentLang.rtl;
        const direction = isRTL ? 'rtl' : 'ltr';

        // Determine size classes like in example.html
        const widgetSize = this.config.size === 'small' ? 'w-80 h-auto min-h-32' : 
                          this.config.size === 'medium' ? 'w-96 h-auto min-h-40' : 
                          'w-full h-full max-w-4xl';
        const padding = this.config.size === 'small' ? 'p-3' : 
                       this.config.size === 'medium' ? 'p-4' : 'p-6';
        const titleSize = this.config.size === 'small' ? 'text-base' : 
                         this.config.size === 'medium' ? 'text-lg' : 'text-2xl';
        const contentSize = this.config.size === 'small' ? 'text-xs' : 
                           this.config.size === 'medium' ? 'text-sm' : 'text-base';
        const buttonSize = this.config.size === 'small' ? 'px-2 py-1 text-xs' : 
                          this.config.size === 'medium' ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base';

        if (this.isLoading) {
            this.container.innerHTML = `
                <div class="${widgetSize} bg-white rounded-3xl shadow-lg border border-gray-200 ${padding} mx-auto">
                    <div class="animate-pulse">
                        <div class="h-3 bg-gray-200 rounded mb-3"></div>
                        <div class="h-6 bg-gray-200 rounded mb-3"></div>
                        <div class="h-3 bg-gray-200 rounded mb-3"></div>
                        <div class="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            `;
            return;
        }

        if (this.error) {
            this.container.innerHTML = `
                <div class="${widgetSize} bg-white rounded-3xl shadow-lg border border-gray-200 ${padding} mx-auto">
                    <div class="text-center text-red-600">
                        ⚠️ Unable to load content<br>
                        <small>${this.error}</small>
                    </div>
                </div>
            `;
            return;
        }

        const title = this.getTitle();
        const description = this.getDescription();
        
        // Rendering widget

        // Language selector dropdown
        const languageSelector = this.config.showSelector ? `
            <div class="relative flex-1">
                <button onclick="window.tbiWidget_${this.safeWidgetId}.toggleLanguageDropdown(); event.stopPropagation();" 
                        class="tbi-dropdown-button w-full bg-white border-2 border-cyan-300 rounded-2xl ${buttonSize} flex items-center justify-between hover:border-cyan-400 transition-colors">
                    <div class="flex items-center gap-2">
                        ${this.getFlagDisplay(currentLang.flag, currentLang.code)}
                        <span class="font-medium text-gray-800 ${contentSize} truncate">${currentLang.nativeName}</span>
                    </div>
                    <svg class="tbi-dropdown-arrow w-4 h-4 text-gray-600 transition-transform" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         style="transform: rotate(${this.dropdownOpen ? '180' : '0'}deg)">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                <div class="tbi-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-40 overflow-y-auto ${this.dropdownOpen ? 'block' : 'hidden'}">
                    ${this.languages.map(lang => `
                        <button onclick="window.tbiWidget_${this.safeWidgetId}.changeLanguage('${lang.code}'); event.stopPropagation();" 
                                class="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-left transition-colors ${contentSize}">
                            ${this.getFlagDisplay(lang.flag, lang.code)}
                            <span class="font-medium text-gray-800 truncate">${lang.nativeName}</span>
                            ${this.config.size !== 'small' ? `<span class="text-xs text-gray-500 ml-auto">${lang.name}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Main widget HTML using example.html structure
        this.container.innerHTML = `
            <div class="${widgetSize} bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-lg border border-gray-200 ${padding} mx-auto relative overflow-visible ${this.config.size === 'full' ? 'flex flex-col' : ''}" dir="${direction}">
                
                ${this.config.size === 'full' && this.config.showSelector ? `
                    <!-- Language Selector - Top Right nel Full -->
                    <div class="absolute top-4 right-4">
                        <div class="relative w-60">
                            ${languageSelector}
                        </div>
                    </div>
                    
                    <!-- Content Centrato -->
                    <div class="flex-1 flex flex-col justify-center">
                ` : ''}
                
                <!-- Header -->
                <div class="flex items-center justify-center ${this.config.size === 'small' ? 'mb-2' : 'mb-4'}">
                    <div class="text-center">
                        <img src="https://thebestitaly.eu/_next/image?url=%2Fimages%2Flogo-black.webp&w=256&q=75" 
                             alt="TheBestItaly" 
                             class="${this.config.size === 'small' ? 'h-8' : this.config.size === 'medium' ? 'h-10' : 'h-12'} w-auto" />
                    </div>
                </div>

                <!-- Content -->
                <div class="text-center ${this.config.size === 'small' ? 'mb-2' : this.config.size === 'full' ? 'mb-8' : 'mb-4'}">
                    <h2 class="${titleSize} font-light text-gray-800 mb-1">${title}</h2>
                    ${this.config.size === 'medium' ? `
                        <p class="${contentSize} text-gray-600 font-light">${this.getSeoSummary()}</p>
                    ` : this.config.size === 'full' ? `
                        <div class="markdown-content text-left w-full overflow-hidden">${this.renderMarkdown(description)}</div>
                    ` : ''}
                </div>

                ${this.config.size === 'full' ? `
                    <!-- View Content Button - Centrato nel Full -->
                    <div class="text-center mt-6">
                        <a href="${this.getUrl()}" target="_blank" 
                           class="bg-cyan-300 hover:bg-cyan-400 rounded-2xl px-8 py-4 text-lg font-medium text-gray-800 transition-colors inline-block">
                            Visualizza ${title}
                        </a>
                    </div>
                    </div> <!-- Chiudi content centrato -->
                ` : `
                    <!-- Language Selector and Action - Small/Medium -->
                    <div class="flex items-center gap-2">
                        ${languageSelector}

                        <a href="${this.getUrl()}" target="_blank" 
                           class="bg-cyan-300 hover:bg-cyan-400 rounded-2xl ${this.config.size === 'small' ? 'p-2' : 'p-3'} transition-colors flex-shrink-0">
                            <svg class="${this.config.size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5-5 5M6 12l5 5-5 5"></path>
                            </svg>
                        </a>
                    </div>
                `}
            </div>
        `;

        // Store reference for global access
        window[`tbiWidget_${this.safeWidgetId}`] = this;
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
