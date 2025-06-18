const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

async function migrateTranslations() {
  try {
    await client.connect();
    console.log('🔗 Connesso al database');

    // 1. Crea le nuove tabelle
    console.log('📋 Creazione tabelle...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS translation_keys (
        id SERIAL PRIMARY KEY,
        key_name VARCHAR(255) UNIQUE NOT NULL,
        section VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS translation_values (
        id SERIAL PRIMARY KEY,
        key_id INTEGER REFERENCES translation_keys(id) ON DELETE CASCADE,
        language_code VARCHAR(10) NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(key_id, language_code)
      );
    `);

    console.log('✅ Tabelle create');

    // 2. Leggi i dati esistenti dalla tabella translations
    const existingTranslations = await client.query(`
      SELECT language, section, translations 
      FROM translations 
      ORDER BY language, section
    `);

    console.log(`📖 Trovate ${existingTranslations.rows.length} righe di traduzioni esistenti`);

    // 3. Processa ogni riga
    for (const row of existingTranslations.rows) {
      const { language, section, translations } = row;
      
      console.log(`🔄 Processando ${language} - ${section}`);
      
      try {
        const translationsObj = typeof translations === 'string' 
          ? JSON.parse(translations) 
          : translations;

        // Per ogni chiave nel JSON
        for (const [keyName, value] of Object.entries(translationsObj)) {
          // Inserisci o aggiorna la chiave
          const keyResult = await client.query(`
            INSERT INTO translation_keys (key_name, section, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (key_name) 
            DO UPDATE SET section = $2, updated_at = NOW()
            RETURNING id
          `, [keyName, section, `Auto-migrated from ${section}`]);

          const keyId = keyResult.rows[0].id;

          // Inserisci o aggiorna il valore
          await client.query(`
            INSERT INTO translation_values (key_id, language_code, value)
            VALUES ($1, $2, $3)
            ON CONFLICT (key_id, language_code)
            DO UPDATE SET value = $3, updated_at = NOW()
          `, [keyId, language, value]);
        }

        console.log(`✅ Migrato ${language} - ${section}`);
      } catch (error) {
        console.error(`❌ Errore processando ${language} - ${section}:`, error);
      }
    }

    // 4. Verifica risultati
    const keysCount = await client.query('SELECT COUNT(*) FROM translation_keys');
    const valuesCount = await client.query('SELECT COUNT(*) FROM translation_values');
    
    console.log(`\n📊 Migrazione completata:`);
    console.log(`   - Chiavi di traduzione: ${keysCount.rows[0].count}`);
    console.log(`   - Valori di traduzione: ${valuesCount.rows[0].count}`);

    // 5. Mostra esempio
    console.log(`\n🔍 Esempio di dati migrati:`);
    const sample = await client.query(`
      SELECT 
        tk.key_name,
        tk.section,
        tv.language_code,
        tv.value
      FROM translation_keys tk
      JOIN translation_values tv ON tk.id = tv.key_id
      LIMIT 5
    `);
    
    console.table(sample.rows);

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
  } finally {
    await client.end();
  }
}

// Funzione per aggiungere nuove traduzioni
async function addTranslation(keyName, section, translations, description = null) {
  try {
    await client.connect();

    // Inserisci la chiave
    const keyResult = await client.query(`
      INSERT INTO translation_keys (key_name, section, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key_name) 
      DO UPDATE SET section = $2, description = $3, updated_at = NOW()
      RETURNING id
    `, [keyName, section, description]);

    const keyId = keyResult.rows[0].id;

    // Inserisci i valori per ogni lingua
    for (const [langCode, value] of Object.entries(translations)) {
      await client.query(`
        INSERT INTO translation_values (key_id, language_code, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (key_id, language_code)
        DO UPDATE SET value = $3, updated_at = NOW()
      `, [keyId, langCode, value]);
    }

    console.log(`✅ Aggiunta traduzione: ${keyName}`);
  } catch (error) {
    console.error('❌ Errore aggiungendo traduzione:', error);
  } finally {
    await client.end();
  }
}

// Esegui migrazione se chiamato direttamente
if (require.main === module) {
  migrateTranslations();
}

module.exports = { migrateTranslations, addTranslation }; 