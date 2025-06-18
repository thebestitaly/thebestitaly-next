import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

async function migrateExistingTranslations() {
  try {
    await client.connect();
    console.log('🔗 Connesso al database');

    // Verifica che le nuove tabelle esistano
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('translation_keys', 'translation_values')
      AND table_schema = 'public'
    `);

    if (tablesCheck.rows.length < 2) {
      console.error('❌ Le tabelle translation_keys e translation_values non esistono!');
      console.log('   Esegui prima lo script di setup delle tabelle.');
      return;
    }

    // Leggi i dati esistenti dalla tabella translations
    console.log('📖 Lettura traduzioni esistenti...');
    const existingTranslations = await client.query(`
      SELECT language, section, translations 
      FROM translations 
      ORDER BY section, language
    `);

    console.log(`📊 Trovate ${existingTranslations.rows.length} righe di traduzioni esistenti`);

    if (existingTranslations.rows.length === 0) {
      console.log('⚠️ Nessuna traduzione esistente trovata nella tabella translations');
      return;
    }

    // Raggruppa per sezione per un'elaborazione più efficiente
    const translationsBySection = new Map();
    
    for (const row of existingTranslations.rows) {
      const { language, section, translations } = row;
      
      if (!translationsBySection.has(section)) {
        translationsBySection.set(section, new Map());
      }
      
      try {
        const translationsObj = typeof translations === 'string' 
          ? JSON.parse(translations) 
          : translations;
        
        translationsBySection.get(section).set(language, translationsObj);
      } catch (error) {
        console.error(`❌ Errore parsing JSON per ${language}-${section}:`, error);
      }
    }

    console.log(`🔄 Elaborazione di ${translationsBySection.size} sezioni...`);

    let totalKeys = 0;
    let totalValues = 0;

    // Processa ogni sezione
    for (const [section, languageData] of translationsBySection) {
      console.log(`\n📂 Processando sezione: ${section}`);
      
      // Raccogli tutte le chiavi uniche per questa sezione
      const allKeys = new Set();
      for (const [language, translationsObj] of languageData) {
        Object.keys(translationsObj).forEach(key => allKeys.add(key));
      }

      console.log(`   🔑 Trovate ${allKeys.size} chiavi uniche`);

      // Per ogni chiave, crea la entry nel nuovo sistema
      for (const keyName of allKeys) {
        try {
          // Inserisci o aggiorna la chiave
          const keyResult = await client.query(`
            INSERT INTO translation_keys (key_name, section, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (key_name) 
            DO UPDATE SET 
              section = EXCLUDED.section,
              description = EXCLUDED.description,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id
          `, [keyName, section, `Migrated from ${section} section`]);

          const keyId = keyResult.rows[0].id;
          totalKeys++;

          // Inserisci i valori per ogni lingua disponibile
          for (const [language, translationsObj] of languageData) {
            if (translationsObj[keyName]) {
              await client.query(`
                INSERT INTO translation_values (key_id, language_code, value)
                VALUES ($1, $2, $3)
                ON CONFLICT (key_id, language_code)
                DO UPDATE SET 
                  value = EXCLUDED.value,
                  updated_at = CURRENT_TIMESTAMP
              `, [keyId, language, translationsObj[keyName]]);
              
              totalValues++;
            }
          }

          if (totalKeys % 10 === 0) {
            console.log(`   ✅ Processate ${totalKeys} chiavi...`);
          }

        } catch (error) {
          console.error(`❌ Errore processando chiave ${keyName} in ${section}:`, error);
        }
      }

      console.log(`✅ Sezione ${section} completata`);
    }

    // Verifica risultati finali
    console.log('\n📊 Migrazione completata!');
    console.log(`   🔑 Chiavi totali migrate: ${totalKeys}`);
    console.log(`   🌐 Valori totali migrati: ${totalValues}`);

    // Statistiche per sezione
    console.log('\n📈 Statistiche per sezione:');
    const sectionStats = await client.query(`
      SELECT 
        tk.section,
        COUNT(DISTINCT tk.id) as keys_count,
        COUNT(tv.id) as values_count,
        COUNT(DISTINCT tv.language_code) as languages_count
      FROM translation_keys tk
      LEFT JOIN translation_values tv ON tk.id = tv.key_id
      GROUP BY tk.section
      ORDER BY tk.section
    `);

    console.table(sectionStats.rows);

    // Mostra esempio di dati migrati
    console.log('\n🔍 Esempio di dati migrati:');
    const sample = await client.query(`
      SELECT 
        tk.key_name,
        tk.section,
        tv.language_code,
        LEFT(tv.value, 50) as value_preview
      FROM translation_keys tk
      JOIN translation_values tv ON tk.id = tv.key_id
      ORDER BY tk.section, tk.key_name, tv.language_code
      LIMIT 10
    `);
    
    console.table(sample.rows);

    // Verifica integrità
    console.log('\n🔍 Verifica integrità dati:');
    const integrityCheck = await client.query(`
      SELECT 
        COUNT(*) as total_keys,
        COUNT(DISTINCT section) as total_sections,
        (SELECT COUNT(DISTINCT language_code) FROM translation_values) as total_languages
      FROM translation_keys
    `);

    console.log(`   📋 Chiavi totali: ${integrityCheck.rows[0].total_keys}`);
    console.log(`   📂 Sezioni totali: ${integrityCheck.rows[0].total_sections}`);
    console.log(`   🌐 Lingue totali: ${integrityCheck.rows[0].total_languages}`);

    console.log('\n🎉 Migrazione completata con successo!');
    console.log('   Ora puoi utilizzare il nuovo sistema di traduzioni normalizzato.');

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Funzione per verificare lo stato della migrazione
async function checkMigrationStatus() {
  try {
    await client.connect();
    
    console.log('🔍 Verifica stato migrazione...\n');

    // Conta traduzioni originali
    const originalCount = await client.query(`
      SELECT COUNT(*) as count FROM translations
    `);
    
    // Conta nuove traduzioni
    const newKeysCount = await client.query(`
      SELECT COUNT(*) as count FROM translation_keys
    `);
    
    const newValuesCount = await client.query(`
      SELECT COUNT(*) as count FROM translation_values
    `);

    console.log('📊 Stato attuale:');
    console.log(`   📜 Traduzioni originali: ${originalCount.rows[0].count}`);
    console.log(`   🔑 Nuove chiavi: ${newKeysCount.rows[0].count}`);
    console.log(`   🌐 Nuovi valori: ${newValuesCount.rows[0].count}`);

    if (newKeysCount.rows[0].count > 0) {
      console.log('\n✅ Il nuovo sistema è già popolato');
      
      // Mostra sezioni disponibili
      const sections = await client.query(`
        SELECT section, COUNT(*) as keys_count
        FROM translation_keys
        GROUP BY section
        ORDER BY section
      `);
      
      console.log('\n📂 Sezioni disponibili:');
      console.table(sections.rows);
    } else {
      console.log('\n⚠️ Il nuovo sistema è vuoto - esegui la migrazione');
    }

  } catch (error) {
    console.error('❌ Errore nella verifica:', error);
  } finally {
    await client.end();
  }
}

// Determina quale funzione eseguire in base agli argomenti
const command = process.argv[2];

if (command === 'check') {
  checkMigrationStatus();
} else if (command === 'migrate') {
  migrateExistingTranslations();
} else {
  console.log('📋 Script di migrazione traduzioni');
  console.log('');
  console.log('Utilizzo:');
  console.log('  node migrate-existing-translations.js check   - Verifica stato migrazione');
  console.log('  node migrate-existing-translations.js migrate - Esegui migrazione');
  console.log('');
  console.log('Esempio:');
  console.log('  npm run migrate-translations');
}

export { migrateExistingTranslations, checkMigrationStatus }; 