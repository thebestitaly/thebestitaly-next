// Questo è un file di utility per lanciare la generazione statica direttamente da terminale,
// bypassando gli script esistenti che non funzionano.

// Poiché eseguiamo questo script con node direttamente dalla root, e il nostro codice usa alias
// come '@/', abbiamo bisogno di 'tsconfig-paths' per risolvere i percorsi.
// Assicurati che sia installato: npm install --save-dev tsconfig-paths ts-node
import 'tsconfig-paths/register.js';

// Ora possiamo importare la nostra funzione come se fossimo dentro l'app Next.js
import { generateStaticDestinations } from '../src/lib/static-destinations.ts';

console.log('--- ✅ INIZIO ESECUZIONE DIRETTA DELLO SCRIPT DI GENERAZIONE ---');
console.log('--- Questo processo potrebbe richiedere diversi minuti. ---');

generateStaticDestinations()
  .then(() => {
    console.log('\n--- ✅✅✅ PROCESSO COMPLETATO CON SUCCESSO! ✅✅✅ ---');
    process.exit(0); // Termina con successo
  })
  .catch((error) => {
    console.error('\n--- ❌❌❌ ERRORE FATALE DURANTE ESECUZIONE DIRETTA ❌❌❌ ---');
    console.error(error);
    process.exit(1); // Termina con un codice di errore
  }); 