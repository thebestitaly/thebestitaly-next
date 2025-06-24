#!/usr/bin/env node

/**
 * CLS Monitoring Script
 * Monitora il Cumulative Layout Shift e identifica gli elementi problematici
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://thebestitaly.eu';

// Pagine da monitorare per CLS
const PAGES_TO_MONITOR = [
  '/it',
  '/it/lazio',
  '/it/lazio/roma',
  '/it/magazine',
  '/it/poi',
];

// Script da iniettare per monitorare CLS
const CLS_MONITORING_SCRIPT = `
  // CLS Monitoring
  let cls = 0;
  let clsEntries = [];
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
        clsEntries.push({
          value: entry.value,
          sources: entry.sources?.map(source => ({
            node: source.node?.tagName || 'unknown',
            previousRect: source.previousRect,
            currentRect: source.currentRect
          })) || []
        });
      }
    }
  });
  
  observer.observe({type: 'layout-shift', buffered: true});
  
  // Restituisci i dati CLS
  window.getCLSData = () => ({
    cls: cls,
    entries: clsEntries
  });
`;

async function monitorPageCLS(page, url) {
  console.log(`🔍 Monitoring CLS for: ${url}`);
  
  try {
    // Naviga alla pagina
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Inietta script di monitoraggio
    await page.evaluateOnNewDocument(CLS_MONITORING_SCRIPT);
    
    // Aspetta che la pagina si carichi completamente
    await page.waitForTimeout(3000);
    
    // Simula scroll per attivare lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    // Ottieni i dati CLS
    const clsData = await page.evaluate(() => {
      if (typeof window.getCLSData === 'function') {
        return window.getCLSData();
      }
      return { cls: 0, entries: [] };
    });
    
    // Ottieni metriche aggiuntive
    const metrics = await page.metrics();
    
    // Ottieni informazioni sulla pagina
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      images: Array.from(document.images).map(img => ({
        src: img.src,
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        hasExplicitDimensions: !!(img.width && img.height),
        loading: img.loading
      })),
      totalElements: document.querySelectorAll('*').length
    }));
    
    return {
      url,
      cls: clsData.cls,
      clsEntries: clsData.entries,
      metrics,
      pageInfo,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error monitoring ${url}:`, error.message);
    return {
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function monitorCLS() {
  console.log('🚀 Starting CLS monitoring...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  const page = await browser.newPage();
  
  // Configura viewport
  await page.setViewport({ width: 1200, height: 800 });
  
  const results = [];
  
  for (const pagePath of PAGES_TO_MONITOR) {
    const url = BASE_URL + pagePath;
    const result = await monitorPageCLS(page, url);
    results.push(result);
    
    // Pausa tra le pagine
    await page.waitForTimeout(2000);
  }
  
  await browser.close();
  
  // Analizza risultati
  console.log('\n📊 CLS MONITORING RESULTS:');
  
  let totalCLS = 0;
  let problematicPages = 0;
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.url} - ERROR: ${result.error}`);
      return;
    }
    
    const cls = result.cls || 0;
    totalCLS += cls;
    
    const status = cls > 0.25 ? '🔴 POOR' : cls > 0.1 ? '🟡 NEEDS IMPROVEMENT' : '🟢 GOOD';
    
    if (cls > 0.1) {
      problematicPages++;
    }
    
    console.log(`${status} ${result.url} - CLS: ${cls.toFixed(3)}`);
    
    if (cls > 0.1 && result.clsEntries?.length > 0) {
      console.log(`  📍 Layout shifts detected: ${result.clsEntries.length}`);
      result.clsEntries.forEach((entry, i) => {
        console.log(`    Shift ${i + 1}: ${entry.value.toFixed(3)} (${entry.sources.length} elements)`);
      });
    }
    
    // Analizza immagini senza dimensioni
    const imagesWithoutDimensions = result.pageInfo?.images?.filter(img => !img.hasExplicitDimensions) || [];
    if (imagesWithoutDimensions.length > 0) {
      console.log(`  🖼️  Images without dimensions: ${imagesWithoutDimensions.length}`);
    }
  });
  
  // Statistiche finali
  const avgCLS = totalCLS / results.filter(r => !r.error).length;
  
  console.log('\n📈 SUMMARY:');
  console.log(`📊 Average CLS: ${avgCLS.toFixed(3)}`);
  console.log(`🔴 Problematic pages: ${problematicPages}/${results.length}`);
  console.log(`✅ Good pages: ${results.length - problematicPages}/${results.length}`);
  
  // Salva report dettagliato
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: results.length,
      averageCLS: avgCLS,
      problematicPages: problematicPages,
      goodPages: results.length - problematicPages
    },
    results: results
  };
  
  fs.writeFileSync('cls-monitoring-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to cls-monitoring-report.json');
  
  // Raccomandazioni
  console.log('\n💡 RECOMMENDATIONS:');
  if (avgCLS > 0.1) {
    console.log('- Add explicit width/height to images');
    console.log('- Use aspect-ratio CSS for responsive images');
    console.log('- Implement proper loading skeletons');
    console.log('- Reserve space for dynamic content');
    console.log('- Use font-display: swap for web fonts');
  } else {
    console.log('- CLS is within acceptable range');
    console.log('- Continue monitoring after deployments');
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  monitorCLS().catch(console.error);
}

module.exports = { monitorCLS }; 