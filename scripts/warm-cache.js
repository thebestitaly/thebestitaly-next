#!/usr/bin/env node

/**
 * Cache Warm-up Script
 * Pre-carica le pagine più importanti per migliorare la cache hit rate
 */

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://thebestitaly.eu';

// Pagine principali da pre-caricare
const IMPORTANT_PAGES = [
  // Homepage
  '/it',
  '/en', 
  '/fr',
  '/de',
  '/es',
  
  // Regioni principali
  '/it/lazio',
  '/it/toscana', 
  '/it/lombardia',
  '/it/campania',
  '/it/sicilia',
  '/it/veneto',
  '/it/emilia-romagna',
  '/it/piemonte',
  
  // Province principali
  '/it/lazio/roma',
  '/it/toscana/firenze',
  '/it/lombardia/milano',
  '/it/campania/napoli',
  '/it/sicilia/palermo',
  '/it/veneto/venezia',
  
  // Magazine
  '/it/magazine',
  '/en/magazine',
  
  // POI
  '/it/poi',
  '/en/poi',
];

// Funzione per fare richiesta HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          url,
          status: res.statusCode,
          duration,
          size: data.length
        });
      });
    }).on('error', (err) => {
      reject({
        url,
        error: err.message
      });
    });
  });
}

// Funzione principale
async function warmupCache() {
  console.log('🔥 Starting cache warm-up...');
  console.log(`📊 Pages to warm-up: ${IMPORTANT_PAGES.length}`);
  
  const results = [];
  const errors = [];
  
  // Processa in batch di 5 per non sovraccaricare il server
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < IMPORTANT_PAGES.length; i += BATCH_SIZE) {
    const batch = IMPORTANT_PAGES.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(page => makeRequest(BASE_URL + page));
    
    console.log(`\n📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(IMPORTANT_PAGES.length/BATCH_SIZE)}`);
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const page = batch[index];
        
        if (result.status === 'fulfilled') {
          const res = result.value;
          results.push(res);
          console.log(`✅ ${page} - ${res.status} - ${res.duration}ms - ${(res.size/1024).toFixed(1)}KB`);
        } else {
          const err = result.reason;
          errors.push(err);
          console.log(`❌ ${page} - ERROR: ${err.error}`);
        }
      });
      
      // Pausa tra batch per non sovraccaricare
      if (i + BATCH_SIZE < IMPORTANT_PAGES.length) {
        console.log('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Batch error:`, error);
    }
  }
  
  // Statistiche finali
  console.log('\n📊 WARM-UP RESULTS:');
  console.log(`✅ Successful: ${results.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (results.length > 0) {
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    
    console.log(`⏱️  Average response time: ${avgDuration.toFixed(0)}ms`);
    console.log(`📦 Total data transferred: ${(totalSize/1024/1024).toFixed(2)}MB`);
  }
  
  // Salva report
  const report = {
    timestamp: new Date().toISOString(),
    totalPages: IMPORTANT_PAGES.length,
    successful: results.length,
    errors: errors.length,
    results: results,
    errors: errors
  };
  
  fs.writeFileSync('cache-warmup-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report saved to cache-warmup-report.json');
  
  // Verifica cache stats dopo warm-up
  console.log('\n🔍 Checking cache stats...');
  try {
    const cacheStatsUrl = BASE_URL + '/api/admin/cache?action=stats';
    const statsResult = await makeRequest(cacheStatsUrl);
    console.log(`✅ Cache stats retrieved - ${statsResult.duration}ms`);
  } catch (error) {
    console.log(`❌ Could not retrieve cache stats: ${error.message}`);
  }
  
  console.log('\n🎉 Cache warm-up completed!');
}

// Esegui se chiamato direttamente
if (require.main === module) {
  warmupCache().catch(console.error);
}

module.exports = { warmupCache }; 