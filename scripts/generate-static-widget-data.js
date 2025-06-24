#!/usr/bin/env node

/**
 * Script per generare dati statici per i widget
 * Riduce drasticamente le chiamate API e i costi
 */

const fs = require('fs').promises;
const path = require('path');

// Simula dati di esempio per ora
const generateStaticData = () => {
    const companies = [
        {
            uuid: 'francescana',
            type: 'company',
            title: 'Osteria Francescana',
            seo_title: 'Osteria Francescana - 3 Stelle Michelin a Modena',
            seo_summary: 'L\'eccellenza gastronomica di Massimo Bottura nel cuore di Modena',
            description: 'L\'eleganza contemporanea di Osteria Francescana a Modena si distingue per un design raffinato che fonde esperienze gastronomiche intime che per incontri di alto livello.',
            external_url: 'https://thebestitaly.eu/poi/francescana',
            image: 'osteria-francescana.webp',
            location: 'Modena, Emilia-Romagna',
            category: 'Ristorante Stellato'
        },
        {
            uuid: 'ferrari',
            type: 'company', 
            title: 'Ferrari',
            seo_title: 'Ferrari - Eccellenza Automobilistica Italiana',
            seo_summary: 'Il mito del Cavallino Rampante che ha conquistato il mondo',
            description: 'Ferrari rappresenta l\'apice dell\'eccellenza italiana nel settore automobilistico, combinando tradizione artigianale e innovazione tecnologica.',
            external_url: 'https://thebestitaly.eu/poi/ferrari',
            image: 'ferrari.webp',
            location: 'Maranello, Emilia-Romagna',
            category: 'Automotive'
        }
    ];

    const destinations = [
        {
            uuid: 'roma',
            type: 'destination',
            title: 'Roma',
            seo_title: 'Roma - La Città Eterna',
            seo_summary: 'Scopri la capitale d\'Italia, culla della civiltà occidentale',
            description: 'Roma, la Città Eterna, offre un patrimonio artistico e culturale unico al mondo. Dai Fori Imperiali al Vaticano, ogni angolo racconta millenni di storia.',
            external_url: 'https://thebestitaly.eu/lazio/roma/roma',
            image: 'roma-colosseo.webp',
            location: 'Lazio',
            category: 'Capitale'
        },
        {
            uuid: 'venezia',
            type: 'destination',
            title: 'Venezia',
            seo_title: 'Venezia - La Serenissima',
            seo_summary: 'La città sull\'acqua più affascinante del mondo',
            description: 'Venezia, la Serenissima, è un capolavoro architettonico unico costruito sull\'acqua. Canali, ponti e palazzi storici creano un\'atmosfera magica.',
            external_url: 'https://thebestitaly.eu/veneto/venezia/venezia',
            image: 'venezia-canal-grande.webp',
            location: 'Veneto',
            category: 'Città d\'Arte'
        }
    ];

    const articles = [
        {
            uuid: 'cucina-italiana-tradizione',
            type: 'article',
            title: 'La Cucina Italiana: Tradizione e Innovazione',
            seo_title: 'Cucina Italiana: Tra Tradizione e Innovazione Moderna',
            seo_summary: 'Un viaggio nella gastronomia italiana contemporanea',
            description: 'La cucina italiana continua a evolversi mantenendo salda la propria identità. Scopri come i grandi chef reinterpretano i piatti tradizionali.',
            external_url: 'https://thebestitaly.eu/magazine/cucina-italiana-tradizione',
            image: 'cucina-italiana.webp',
            location: 'Italia',
            category: 'Gastronomia'
        }
    ];

    return {
        companies,
        destinations, 
        articles,
        totalItems: companies.length + destinations.length + articles.length,
        lastUpdated: new Date().toISOString(),
        searchIndex: [
            ...companies.map(c => ({ ...c, searchTerms: [c.title, c.seo_title, c.category].join(' ').toLowerCase() })),
            ...destinations.map(d => ({ ...d, searchTerms: [d.title, d.seo_title, d.location].join(' ').toLowerCase() })),
            ...articles.map(a => ({ ...a, searchTerms: [a.title, a.seo_title, a.category].join(' ').toLowerCase() }))
        ]
    };
};

// Traduzioni per diverse lingue
const translations = {
    it: {
        view_more: 'Scopri di più',
        loading: 'Caricamento...',
        error: 'Errore nel caricamento',
        search_placeholder: 'Cerca...',
        no_results: 'Nessun risultato trovato'
    },
    en: {
        view_more: 'Learn more',
        loading: 'Loading...',
        error: 'Loading error',
        search_placeholder: 'Search...',
        no_results: 'No results found'
    },
    fr: {
        view_more: 'En savoir plus',
        loading: 'Chargement...',
        error: 'Erreur de chargement',
        search_placeholder: 'Rechercher...',
        no_results: 'Aucun résultat trouvé'
    },
    de: {
        view_more: 'Mehr erfahren',
        loading: 'Wird geladen...',
        error: 'Ladefehler',
        search_placeholder: 'Suchen...',
        no_results: 'Keine Ergebnisse gefunden'
    },
    es: {
        view_more: 'Saber más',
        loading: 'Cargando...',
        error: 'Error de carga',
        search_placeholder: 'Buscar...',
        no_results: 'No se encontraron resultados'
    }
};

async function generateAllLanguageFiles() {
    const outputDir = path.join(__dirname, '../public/widget-data');
    
    try {
        // Assicurati che la directory esista
        await fs.mkdir(outputDir, { recursive: true });
        
        console.log('📁 Generando file di dati statici per widget...');
        
        for (const [langCode, langTranslations] of Object.entries(translations)) {
            const staticData = generateStaticData();
            
            // Aggiungi traduzioni
            staticData.translations = langTranslations;
            staticData.language = langCode;
            
            // Traduci alcuni campi base (simulazione)
            if (langCode === 'en') {
                staticData.companies[0].title = 'Osteria Francescana';
                staticData.companies[0].seo_summary = 'Massimo Bottura\'s gastronomic excellence in the heart of Modena';
                staticData.destinations[0].title = 'Rome';
                staticData.destinations[0].seo_summary = 'Discover Italy\'s capital, cradle of Western civilization';
            }
            
            const filename = `${langCode}-index.json`;
            const filepath = path.join(outputDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify(staticData, null, 2));
            console.log(`✅ Generato: ${filename} (${staticData.totalItems} elementi)`);
        }
        
        console.log('\n🎉 Generazione completata!');
        console.log(`📊 File generati: ${Object.keys(translations).length}`);
        console.log(`📁 Directory: ${outputDir}`);
        
        // Genera anche un file di configurazione
        const config = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            languages: Object.keys(translations),
            cdn_base: 'https://thebestitaly.eu',
            cache_duration: 3600 // 1 ora
        };
        
        await fs.writeFile(
            path.join(outputDir, 'config.json'), 
            JSON.stringify(config, null, 2)
        );
        console.log('⚙️ File di configurazione creato: config.json');
        
    } catch (error) {
        console.error('❌ Errore durante la generazione:', error);
        process.exit(1);
    }
}

// Esegui se chiamato direttamente
if (require.main === module) {
    generateAllLanguageFiles();
}

module.exports = { generateAllLanguageFiles, generateStaticData }; 