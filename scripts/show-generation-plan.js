#!/usr/bin/env node

// Script per mostrare il piano completo di generazione delle pagine statiche
// Usage: node scripts/show-generation-plan.js

const { getCompleteGenerationPlan, getImplementationStrategy } = require('../src/lib/static-generation.ts');

console.log('🚀 PIANO COMPLETO GENERAZIONE PAGINE STATICHE\n');

try {
  const plan = getCompleteGenerationPlan();
  const strategy = getImplementationStrategy();

  console.log('📊 SITUAZIONE ATTUALE:');
  console.log(`   • Regioni: ${plan.current.regions} pagine`);
  console.log(`   • Province: ${plan.current.provinces} pagine`);
  console.log(`   • Comuni: ${plan.current.municipalities} pagine`);
  console.log(`   • Altre pagine: ${plan.current.other_pages} pagine`);
  console.log(`   📈 TOTALE ATTUALE: ${plan.current.total} pagine\n`);

  console.log('🎯 OBIETTIVO FINALE:');
  console.log(`   • Regioni: ${plan.target.regions} pagine`);
  console.log(`   • Province: ${plan.target.provinces} pagine`);
  console.log(`   • Comuni: ${plan.target.municipalities} pagine`);
  console.log(`   • Altre pagine: ${plan.target.other_pages} pagine`);
  console.log(`   🚀 TOTALE FINALE: ${plan.target.total} pagine\n`);

  console.log('📈 PAGINE MANCANTI:');
  console.log(`   • Province da aggiungere: ${plan.missing.provinces} pagine`);
  console.log(`   • Comuni da aggiungere: ${plan.missing.municipalities} pagine`);
  console.log(`   💥 TOTALE DA GENERARE: ${plan.missing.total} pagine\n`);

  console.log('🔄 STRATEGIA DI IMPLEMENTAZIONE:\n');
  
  Object.values(strategy).forEach((phase, index) => {
    console.log(`   ${phase.status} ${phase.name}`);
    console.log(`      📄 Pagine: ${phase.pages.toLocaleString()}`);
    console.log(`      📝 Descrizione: ${phase.description}`);
    if (phase.action) {
      console.log(`      🎯 Azione: ${phase.action}`);
    }
    if (phase.challenges) {
      console.log(`      ⚠️  Sfide:`);
      phase.challenges.forEach(challenge => {
        console.log(`         - ${challenge}`);
      });
    }
    console.log('');
  });

  console.log('🎯 CONCLUSIONE:');
  console.log(`   • Abbiamo completato il ${((plan.current.total / plan.target.total) * 100).toFixed(1)}% dell'obiettivo`);
  console.log(`   • Mancano ${plan.missing.total.toLocaleString()} pagine per completare il progetto`);
  console.log(`   • L'architettura è pronta, serve solo stabilizzare Directus per i dati reali`);

} catch (error) {
  console.error('❌ Errore nel calcolo del piano:', error.message);
  
  // Fallback con calcoli manuali
  console.log('\n📊 CALCOLI MANUALI:');
  console.log('   ATTUALE (1.683 pagine):');
  console.log('   • 20 regioni × 50 lingue = 1.000 pagine');
  console.log('   • 7 province × 50 lingue = 350 pagine');
  console.log('   • 6 comuni × 50 lingue = 300 pagine');
  console.log('   • Altre pagine = 33 pagine');
  console.log('   TOTALE = 1.683 pagine\n');
  
  console.log('   OBIETTIVO (401.533 pagine):');
  console.log('   • 20 regioni × 50 lingue = 1.000 pagine');
  console.log('   • 110 province × 50 lingue = 5.500 pagine');
  console.log('   • 7.900 comuni × 50 lingue = 395.000 pagine');
  console.log('   • Altre pagine = 33 pagine');
  console.log('   TOTALE = 401.533 pagine\n');
  
  console.log('   MANCANTI: 399.850 pagine da generare');
  console.log('   CRISTO SANTO SONO 401.533 PAGINE NON 39.683!');
} 