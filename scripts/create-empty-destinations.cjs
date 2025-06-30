#!/usr/bin/env node

// Script per creare file vuoti per destinazioni correlate
// NON chiama Directus - crea solo strutture vuote

const fs = require('fs').promises;
const path = require('path');

// 50 LINGUE SUPPORTATE
const SUPPORTED_LANGUAGES = [
  { code: 'af' }, { code: 'am' }, { code: 'ar' }, { code: 'az' }, { code: 'bg' },
  { code: 'bn' }, { code: 'ca' }, { code: 'cs' }, { code: 'da' }, { code: 'de' },
  { code: 'el' }, { code: 'en' }, { code: 'es' }, { code: 'et' }, { code: 'fa' },
  { code: 'fi' }, { code: 'fr' }, { code: 'he' }, { code: 'hi' }, { code: 'hr' },
  { code: 'hu' }, { code: 'hy' }, { code: 'id' }, { code: 'is' }, { code: 'it' },
  { code: 'ja' }, { code: 'ka' }, { code: 'ko' }, { code: 'lt' }, { code: 'lv' },
  { code: 'mk' }, { code: 'ms' }, { code: 'nl' }, { code: 'pl' }, { code: 'pt' },
  { code: 'ro' }, { code: 'ru' }, { code: 'sk' }, { code: 'sl' }, { code: 'sr' },
  { code: 'sv' }, { code: 'sw' }, { code: 'th' }, { code: 'tk' }, { code: 'tl' },
  { code: 'uk' }, { code: 'ur' }, { code: 'vi' }, { code: 'zh' }, { code: 'zh-tw' }
];

const STATIC_DATA_DIR = path.join(process.cwd(), '.next', 'static-destinations');
const CACHE_VERSION = '4.0-empty';

// Struttura vuota per ogni lingua
function createEmptyDestinationData() {
  return {
    version: CACHE_VERSION,
    timestamp: Date.now(),
    data: {
      regionProvinces: {}, // regionId -> { lang -> Province[] }
      provinceMunicipalities: {}, // provinceId -> { lang -> Municipality[] }
      destinationDetails: {}, // destinationId -> { lang -> Destination }
    },
  };
}

async function createEmptyDestinationFiles() {
  console.log('🚀 CREANDO FILE VUOTI PER DESTINAZIONI CORRELATE');
  console.log(`📊 Lingue supportate: ${SUPPORTED_LANGUAGES.length} lingue`);
  
  // Assicurati che la directory esista
  await fs.mkdir(STATIC_DATA_DIR, { recursive: true });
  
  // Crea un file vuoto per ogni lingua
  for (const lang of SUPPORTED_LANGUAGES) {
    const fileName = path.join(STATIC_DATA_DIR, `destinations-${lang.code}.json`);
    const emptyData = createEmptyDestinationData();
    
    await fs.writeFile(fileName, JSON.stringify(emptyData, null, 2));
    console.log(`✅ Creato file vuoto per [${lang.code.toUpperCase()}]: destinations-${lang.code}.json`);
  }
  
  console.log(`\n🎉 COMPLETATO! Creati ${SUPPORTED_LANGUAGES.length} file vuoti`);
  console.log('📝 I file sono pronti per essere riempiti in futuro');
  console.log('🚫 NESSUNA chiamata a Directus effettuata');
}

// Esegui se chiamato direttamente
if (require.main === module) {
  createEmptyDestinationFiles().catch(console.error);
}

module.exports = { createEmptyDestinationFiles }; 