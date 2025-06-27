#!/usr/bin/env node

// Script per generare dati statici delle destinazioni
// Uso: node scripts/generate-static-destinations.cjs [lingua]

const path = require('path');

async function importFromSrc() {
  // Per importare moduli TypeScript da Next.js, usiamo un approccio indiretto
  // Creiamo un modulo temporaneo che utilizza il sistema di build di Next.js
  
  try {
    // Prova a importare direttamente se compilato
    const staticDestinations = require('../.next/server/app/lib/static-destinations.js');
    return staticDestinations;
  } catch (error) {
    console.log('📝 I moduli TypeScript non sono compilati. Usando approccio API...');
    
    // Fallback: usa le API HTTP invece dell'importazione diretta
    return {
      generateStaticDestinations: async (languages) => {
        console.log('🚀 Generazione tramite API non ancora implementata');
        console.log('   Per ora, usa l\'API endpoint: POST /api/admin/static-cache');
        console.log('   Body: { "action": "generate", "languages": ["it"] }');
      },
      getStaticCacheStatus: async () => {
        console.log('📊 Status tramite API non ancora implementato');
        console.log('   Per ora, usa l\'API endpoint: GET /api/admin/static-cache');
        return {};
      }
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    // Importa le funzioni
    const { generateStaticDestinations, getStaticCacheStatus } = await importFromSrc();
    
    switch (command) {
      case 'generate':
        const languages = args[1] ? [args[1]] : ['it', 'en', 'fr', 'de', 'es'];
        console.log(`🚀 Generando dati statici per: ${languages.join(', ')}`);
        await generateStaticDestinations(languages);
        break;
        
      case 'status':
        console.log('📊 Stato cache statici:');
        const status = await getStaticCacheStatus();
        
        for (const [lang, info] of Object.entries(status)) {
          const statusIcon = info.valid ? '✅' : info.exists ? '⚠️' : '❌';
          const timestamp = info.timestamp ? new Date(info.timestamp).toLocaleString() : 'N/A';
          console.log(`  ${statusIcon} ${lang}: exists=${info.exists}, valid=${info.valid}, timestamp=${timestamp}`);
        }
        break;
        
      case 'fix':
        const fixLang = args[1] || 'it';
        console.log(`🔧 Recuperando province mancanti per: ${fixLang}`);
        console.log('   Questo comando usa l\'API endpoint: POST /api/admin/static-cache');
        console.log(`   Body: { "action": "fix", "languages": ["${fixLang}"] }`);
        break;
        
      case 'api-help':
        console.log(`
🌐 Comandi API Alternativi

Se gli script diretti non funzionano, usa questi endpoint API:

1. Verifica stato cache:
   curl http://localhost:3000/api/admin/static-cache

2. Genera dati statici (tutte le lingue):
   curl -X POST http://localhost:3000/api/admin/static-cache \\
        -H "Content-Type: application/json" \\
        -d '{"action": "generate"}'

3. Genera solo per italiano:
   curl -X POST http://localhost:3000/api/admin/static-cache \\
        -H "Content-Type: application/json" \\
        -d '{"action": "generate", "languages": ["it"]}'

4. Recupera province mancanti per italiano:
   curl -X POST http://localhost:3000/api/admin/static-cache \\
        -H "Content-Type: application/json" \\
        -d '{"action": "fix", "languages": ["it"]}'

5. Invalida cache:
   curl -X DELETE http://localhost:3000/api/admin/static-cache
        `);
        break;
        
      case 'help':
      default:
        console.log(`
🚀 Generatore Dati Statici Destinazioni

Uso:
  node scripts/generate-static-destinations.cjs generate [lingua]  - Genera dati statici
  node scripts/generate-static-destinations.cjs status            - Mostra stato cache
  node scripts/generate-static-destinations.cjs fix [lingua]      - Recupera province mancanti
  node scripts/generate-static-destinations.cjs api-help          - Mostra comandi API
  node scripts/generate-static-destinations.cjs help              - Mostra questo aiuto

Esempi:
  node scripts/generate-static-destinations.cjs generate          - Genera per tutte le lingue
  node scripts/generate-static-destinations.cjs generate it       - Genera solo per italiano
  node scripts/generate-static-destinations.cjs status            - Verifica stato cache
  node scripts/generate-static-destinations.cjs fix it            - Recupera province mancanti per italiano
  node scripts/generate-static-destinations.cjs api-help          - Comandi API alternativi

Nota: Se gli script non funzionano (moduli TypeScript non compilati), 
      usa i comandi API mostrati con 'api-help'
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.log('\n💡 Suggerimento: Prova con i comandi API:');
    console.log('   node scripts/generate-static-destinations.cjs api-help');
    process.exit(1);
  }
}

main(); 