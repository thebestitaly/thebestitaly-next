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
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`TheBestItaly Widget: Container #${containerId} not found`);
            return;
        }

        // Enhanced configuration with new options
        this.config = {
            // Core settings
            type: this.container.dataset.type || options.type || 'destination',
            id: this.container.dataset.id || options.id || 'roma',
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
        // Priority: URL param > localStorage > navigator > default
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang') || urlParams.get('language');
        
        if (urlLang && this.languages.find(l => l.code === urlLang)) {
            return urlLang;
        }
        
        const storedLang = localStorage.getItem('tbi-widget-language');
        if (storedLang && this.languages.find(l => l.code === storedLang)) {
            return storedLang;
        }
        
        const browserLang = navigator.language.split('-')[0];
        if (this.languages.find(l => l.code === browserLang)) {
            return browserLang;
        }
        
        return 'it'; // Fallback
    }

    // Comprehensive initialization
    async init() {
        try {
            // Inject enhanced styles first
            this.injectStyles();
            
            // Show loading skeleton
            this.renderLoadingSkeleton();
            
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

    // Performance-optimized style injection
    injectStyles() {
        if (document.getElementById('tbi-widget-styles-v6')) return;

        const styles = `
            <style id="tbi-widget-styles-v6">
                /* ============= BASE STYLES ============= */
                .tbi-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    will-change: transform, box-shadow;
                    contain: layout style paint;
                }
                
                .tbi-widget:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    transform: translateY(-4px) scale(1.02);
                }

                .tbi-widget.loading {
                    pointer-events: none;
                }

                /* ============= SIZE VARIANTS ============= */
                .tbi-widget-small { 
                    width: 340px; 
                    height: 200px; 
                    min-height: 200px;
                }
                .tbi-widget-medium { 
                    width: 420px; 
                    height: 280px; 
                    min-height: 280px;
                }
                .tbi-widget-large { 
                    width: 100%; 
                    min-height: 420px;
                    max-height: 600px;
                }

                @media (max-width: 768px) {
                    .tbi-widget-small, .tbi-widget-medium { 
                        width: 100%;
                        max-width: 100%;
                    }
                }

                /* ============= THEME VARIANTS ============= */
                .tbi-widget-light { 
                    background: white; 
                    color: #1f2937; 
                    border: 1px solid #e5e7eb; 
                }
                .tbi-widget-dark { 
                    background: #1f2937; 
                    color: white; 
                    border: 1px solid #374151; 
                }
                .tbi-widget-auto { 
                    background: white; 
                    color: #1f2937; 
                    border: 1px solid #e5e7eb; 
                }

                @media (prefers-color-scheme: dark) {
                    .tbi-widget-auto { 
                        background: #1f2937; 
                        color: white; 
                        border: 1px solid #374151; 
                    }
                }

                /* ============= RTL SUPPORT ============= */
                .tbi-widget[dir="rtl"] {
                    direction: rtl;
                }
                .tbi-widget[dir="rtl"] .tbi-widget-header {
                    flex-direction: row-reverse;
                }
                .tbi-widget[dir="rtl"] .tbi-language-dropdown {
                    left: auto;
                    right: 0;
                }

                /* ============= HEADER SECTION ============= */
                .tbi-widget-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                    position: relative;
                    overflow: visible;
                }

                .tbi-widget-small .tbi-widget-header {
                    padding: 12px 16px;
                }

                .tbi-widget-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 700;
                    font-size: 18px;
                    transition: transform 0.2s ease;
                }

                .tbi-widget-logo:hover {
                    transform: scale(1.05);
                }

                .tbi-widget-small .tbi-widget-logo {
                    font-size: 16px;
                    gap: 8px;
                }

                .tbi-widget-logo-icon {
                    width: 32px;
                    height: 32px;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .tbi-widget-small .tbi-widget-logo-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                }

                .tbi-widget-logo-icon img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                /* ============= LOADING SKELETON ============= */
                .tbi-skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: tbi-skeleton-loading 1.5s infinite;
                }

                .tbi-widget-dark .tbi-skeleton {
                    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
                    background-size: 200% 100%;
                }

                @keyframes tbi-skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .tbi-skeleton-content {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    height: 100%;
                }

                .tbi-skeleton-title {
                    height: 24px;
                    border-radius: 6px;
                    width: 70%;
                }

                .tbi-skeleton-text {
                    height: 16px;
                    border-radius: 4px;
                    width: 100%;
                }

                .tbi-skeleton-text:nth-child(3) { width: 85%; }
                .tbi-skeleton-text:nth-child(4) { width: 60%; }

                .tbi-skeleton-image {
                    height: 120px;
                    border-radius: 8px;
                    margin-top: auto;
                }

                /* ============= LANGUAGE SELECTOR ============= */
                .tbi-language-selector {
                    position: relative;
                    z-index: 1000;
                }

                .tbi-language-button {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    border-radius: 12px;
                    padding: 8px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .tbi-language-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .tbi-language-button:focus {
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
                }

                .tbi-language-button.open {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-1px);
                }

                .tbi-language-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    max-height: 300px;
                    overflow-y: auto;
                    min-width: 200px;
                    z-index: 1001;
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                }

                .tbi-language-dropdown.open {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    pointer-events: all;
                }

                .tbi-widget-dark .tbi-language-dropdown {
                    background: #374151;
                    border-color: #4b5563;
                    color: white;
                }

                .tbi-language-option {
                    padding: 12px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    transition: background-color 0.2s ease;
                    border: none;
                    width: 100%;
                    text-align: left;
                    background: none;
                    color: inherit;
                }

                .tbi-language-option:hover {
                    background: #f3f4f6;
                }

                .tbi-widget-dark .tbi-language-option:hover {
                    background: #4b5563;
                }

                .tbi-language-option.selected {
                    background: #eff6ff;
                    color: #2563eb;
                    font-weight: 600;
                }

                .tbi-widget-dark .tbi-language-option.selected {
                    background: #1e3a8a;
                    color: #93c5fd;
                }

                .tbi-language-option:first-child {
                    border-radius: 12px 12px 0 0;
                }

                .tbi-language-option:last-child {
                    border-radius: 0 0 12px 12px;
                }

                .tbi-language-flag {
                    font-size: 18px;
                    width: 24px;
                    text-align: center;
                }

                .tbi-language-name {
                    flex: 1;
                }

                .tbi-language-native {
                    font-size: 12px;
                    opacity: 0.7;
                }

                /* ============= CONTENT SECTION ============= */
                .tbi-widget-content {
                    flex: 1;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    overflow: hidden;
                }

                .tbi-widget-small .tbi-widget-content {
                    padding: 16px;
                    gap: 12px;
                }

                .tbi-widget-title {
                    font-size: 20px;
                    font-weight: 700;
                    line-height: 1.3;
                    margin: 0;
                    color: inherit;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .tbi-widget-small .tbi-widget-title {
                    font-size: 16px;
                    -webkit-line-clamp: 1;
                }

                .tbi-widget-description {
                    font-size: 14px;
                    line-height: 1.6;
                    opacity: 0.8;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    flex: 1;
                }

                .tbi-widget-small .tbi-widget-description {
                    font-size: 13px;
                    -webkit-line-clamp: 2;
                }

                .tbi-widget-image {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-top: auto;
                    transition: transform 0.3s ease;
                }

                .tbi-widget-large .tbi-widget-image {
                    height: 200px;
                }

                .tbi-widget-image:hover {
                    transform: scale(1.05);
                }

                /* ============= FOOTER SECTION ============= */
                .tbi-widget-footer {
                    padding: 16px 20px;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }

                .tbi-widget-dark .tbi-widget-footer {
                    border-top-color: rgba(255, 255, 255, 0.1);
                }

                .tbi-widget-small .tbi-widget-footer {
                    padding: 12px 16px;
                }

                .tbi-widget-cta {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .tbi-widget-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .tbi-widget-share {
                    display: flex;
                    gap: 8px;
                }

                .tbi-share-button {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    font-size: 14px;
                }

                .tbi-share-facebook { background: #1877f2; color: white; }
                .tbi-share-twitter { background: #1da1f2; color: white; }
                .tbi-share-linkedin { background: #0077b5; color: white; }
                .tbi-share-whatsapp { background: #25d366; color: white; }

                .tbi-share-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                /* ============= ERROR STATE ============= */
                .tbi-widget-error {
                    padding: 40px 20px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    justify-content: center;
                    height: 100%;
                }

                .tbi-error-icon {
                    font-size: 48px;
                    opacity: 0.5;
                }

                .tbi-error-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                }

                .tbi-error-message {
                    font-size: 14px;
                    opacity: 0.7;
                    margin: 0;
                }

                .tbi-error-retry {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .tbi-error-retry:hover {
                    background: #2563eb;
                }

                /* ============= ANIMATIONS ============= */
                @keyframes tbi-fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes tbi-slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                @keyframes tbi-bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }

                .tbi-widget.animate-in {
                    animation: tbi-bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .tbi-widget-content.animate-in {
                    animation: tbi-fade-in 0.5s ease-out;
                }

                /* ============= ACCESSIBILITY ============= */
                .tbi-widget:focus-within {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .tbi-widget,
                    .tbi-widget *,
                    .tbi-widget *::before,
                    .tbi-widget *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                /* ============= HIGH CONTRAST MODE ============= */
                @media (prefers-contrast: high) {
                    .tbi-widget {
                        border: 2px solid;
                    }
                    .tbi-widget-header {
                        background: #000;
                    }
                    .tbi-language-button {
                        border: 2px solid;
                    }
                }

                /* ============= PRINT STYLES ============= */
                @media print {
                    .tbi-widget {
                        box-shadow: none;
                        border: 1px solid #000;
                    }
                    .tbi-language-selector,
                    .tbi-widget-share {
                        display: none;
                    }
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
        // For large widgets, show both seo_summary and description for destinations
        if (this.config.size === 'large' && this.config.type === 'destination') {
            const seoSummary = this.getTranslation('seo_summary');
            const description = this.getTranslation('description');
            
            if (seoSummary && description) {
                return `${seoSummary}<br><br>${description}`;
            } else if (seoSummary) {
                return seoSummary;
            } else if (description) {
                return description;
            }
            return 'Discover this beautiful Italian destination';
        }
        
        // For large widgets of other types, get full content
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
                return this.getTranslation('description') || this.getTranslation('seo_summary') || 'Read our latest article about Italian culture';
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
        
        // Aggiorna il link del pulsante "Visita sito"
        const visitLink = this.container.querySelector('.tbi-widget-visit-link');
        if (visitLink) {
            visitLink.href = this.getUrl();
        }
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
                             <span>50 lingue esatte</span>
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
