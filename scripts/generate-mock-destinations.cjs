const fs = require('fs');
const path = require('path');

// Lingue supportate
const languages = ['af', 'am', 'ar', 'az', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'ka', 'ko', 'lt', 'lv', 'mk', 'ms', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'th', 'tk', 'tl', 'uk', 'ur', 'vi', 'zh-tw', 'zh'];

const STATIC_DATA_DIR = path.join(process.cwd(), '.next', 'static-destinations');
const CACHE_VERSION = '3.0-safe';

// Struttura minima di un file di destinazioni vuoto
const createEmptyDestinationData = () => ({
  version: CACHE_VERSION,
  timestamp: Date.now(),
  data: {
    regionProvinces: {},
    provinceMunicipalities: {},
    destinationDetails: {},
  },
});

console.log('🚀 Generazione file mock per destinazioni...');

// Assicura che la directory esista
if (!fs.existsSync(STATIC_DATA_DIR)) {
  fs.mkdirSync(STATIC_DATA_DIR, { recursive: true });
}

// Genera un file per ogni lingua
languages.forEach(lang => {
  const fileName = path.join(STATIC_DATA_DIR, `destinations-${lang}.json`);
  const mockData = createEmptyDestinationData();
  
  fs.writeFileSync(fileName, JSON.stringify(mockData, null, 2));
  console.log(`✅ File mock generato: destinations-${lang}.json`);
});

console.log(`\n🎉 Completato! Generati ${languages.length} file mock.`);
console.log('Il sito ora può andare online senza errori di file mancanti.');
console.log('Le destinazioni correlate saranno vuote, ma il sito sarà stabile.'); 