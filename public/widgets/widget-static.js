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
            widgetId: options.widgetId || null, // ID del widget specifico
            size: options.size || 'medium', // small, medium, full
            theme: options.theme || 'auto', // auto, light, dark
            baseUrl: options.baseUrl || 'https://thebestitaly.eu',
            ...options
        };
        
        this.data = null;
        this.selectedLanguage = 'it';
        this.isDropdownOpen = false;
        
        console.log('🚀 TheBestItaly Static Widget initialized:', this.options);
        
        this.init();
    }

    async init() {
        try {
            this.showLoadingSkeleton();
            
            if (this.options.widgetId) {
                // Carica i dati specifici del widget
                await this.loadWidgetData();
                this.renderWidget();
            } else {
                this.handleError('Widget ID non specificato');
            }
            
        } catch (error) {
            console.error('❌ Widget initialization error:', error);
            this.handleError('Errore durante il caricamento del widget');
        }
    }

    async loadWidgetData() {
        try {
            const widgetUrl = `${this.options.baseUrl}/widget-data/${this.options.widgetId}.json`;
            
            console.log('📁 Loading widget data from:', widgetUrl);
            
            const response = await fetch(widgetUrl);
            if (!response.ok) {
                throw new Error(`Failed to load widget data: ${response.status}`);
            }
            
            this.data = await response.json();
            this.selectedLanguage = this.data.defaultLanguage;
            
            console.log('✅ Widget data loaded:', {
                id: this.data.id,
                type: this.data.type,
                defaultLanguage: this.data.defaultLanguage,
                title: this.data.content.title,
                hasAllLanguages: !!this.data.content.allLanguages
            });
            
        } catch (error) {
            console.error('❌ Error loading widget data:', error);
            throw error;
        }
    }



    renderWidget() {
        if (!this.data || !this.data.content) {
            this.handleError('Nessun contenuto da visualizzare');
            return;
        }

        const content = this.data.content;
        const { size, theme } = this.options;
        const sizeClass = `tbi-widget-${size}`;
        const themeClass = theme === 'dark' ? 'tbi-widget-dark' : 
                          theme === 'light' ? 'tbi-widget-light' : 
                          'tbi-widget-auto';
        
        const isRTL = this.isRTLLanguage(this.selectedLanguage);
        const direction = isRTL ? 'rtl' : 'ltr';
        const directionClass = isRTL ? 'tbi-widget-rtl' : 'tbi-widget-ltr';

        const imageHtml = this.renderImage(content);
        const descriptionHtml = this.renderDescription(content);
        const languageSelector = this.renderLanguageSelector();

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
                    <div class="tbi-widget-title" ${isRTL ? 'style="text-align: right !important; direction: rtl !important;"' : ''}>${this.getLocalizedContent(content).title}</div>
                    <div class="tbi-widget-description" ${isRTL ? 'style="text-align: right !important; direction: rtl !important;"' : ''}>${descriptionHtml}</div>
                    <div class="tbi-widget-footer">
                        <a href="${content.external_url}" target="_blank" class="tbi-widget-cta" data-view-content="${content.id}">
                            ${this.getTranslation('view_more')} →
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }



    renderImage(content) {
        if (!content.image_url || this.options.size === 'small') return '';
        
        const imageUrl = content.image_url.startsWith('http') ? 
            content.image_url : 
            `${this.options.baseUrl}/_next/image?url=${encodeURIComponent('/images/' + content.image_url)}&w=400&q=75`;
            
        return `<div class="tbi-widget-image">
            <img src="${imageUrl}" alt="${content.title}" loading="lazy" />
        </div>`;
    }

    renderDescription(content) {
        const { size } = this.options;
        
        // Cerca i dati nella lingua corrente se disponibili
        const localizedContent = this.getLocalizedContent(content);
        
        if (size === 'small') {
            return (localizedContent.seo_title || localizedContent.title);
        } else if (size === 'medium') {
            return (localizedContent.seo_summary || localizedContent.description?.substring(0, 150) + '...' || '');
        } else if (size === 'full') {
            return localizedContent.description || localizedContent.seo_summary || '';
        } else {
            const desc = localizedContent.description || '';
            return desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
        }
    }

    getLocalizedContent(content) {
        // Se non abbiamo dati multilingue, usa i dati di default
        if (!content.allLanguages) {
            return content;
        }

        const allData = content.allLanguages;
        
        // Per le aziende, cerca nelle traduzioni
        if (allData.translations && Array.isArray(allData.translations)) {
            const translation = allData.translations.find(t => t.languages_code === this.selectedLanguage);
            if (translation) {
                return {
                    title: allData.company_name || content.title,
                    seo_title: translation.seo_title || content.seo_title,
                    seo_summary: translation.seo_summary || content.seo_summary,
                    description: translation.description || content.description,
                    external_url: content.external_url // URL rimane lo stesso
                };
            }
        }

        // Per le destinazioni, logica simile
        if (allData.destination_name) {
            // Implementare logica per destinazioni se necessario
        }

        // Fallback ai dati di default
        return content;
    }



    renderLanguageSelector() {
        // Solo se abbiamo dati per tutte le lingue
        if (!this.data.content.allLanguages) return '';
        
        const languages = this.getSupportedLanguages();
        const currentLang = languages.find(lang => lang.code === this.selectedLanguage) || languages[0];
        
        return `
            <div class="tbi-widget-lang">
                <button class="tbi-widget-lang-current" data-dropdown-toggle>
                    <span class="tbi-flag">${this.getFlagDisplay(currentLang.code)}</span>
                    <span>${currentLang.nativeName}</span>
                    <svg class="tbi-widget-lang-arrow" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="tbi-widget-lang-dropdown ${this.isDropdownOpen ? 'tbi-widget-lang-dropdown-open' : ''}">
                    ${languages.map(lang => `
                        <button class="tbi-widget-lang-option" data-lang-select="${lang.code}">
                            <span class="tbi-flag">${this.getFlagDisplay(lang.code)}</span>
                            <span>${lang.nativeName}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getFlagDisplay(langCode) {
        const lang = this.getSupportedLanguages().find(l => l.code === langCode);
        return lang ? lang.flag : langCode.toUpperCase();
    }

    changeLanguage(langCode) {
        console.log('🌐 Changing language to:', langCode);
        this.selectedLanguage = langCode;
        this.isDropdownOpen = false;
        this.renderWidget(); // Re-render con nuova lingua
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
                this.renderWidget();
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
            { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },
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
                .tbi-widget-full { width: 100%; min-height: 400px; }
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
                
                .tbi-flag {
                    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", sans-serif;
                    font-size: 14px;
                    line-height: 1;
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

// Widget statico - inizializzazione manuale richiesta

// Esporta per uso globale
window.TheBestItalyStaticWidget = TheBestItalyStaticWidget;
