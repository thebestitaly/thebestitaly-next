import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Avvio migrazione traduzioni esistenti...');
    
    // Connessione al database
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL o POSTGRES_URL non trovate nelle variabili d\'ambiente');
    }
    
    const client = new Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    await client.connect();
    console.log('✅ Connesso al database!');

    // Verifica che le nuove tabelle esistano
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('translation_keys', 'translation_values')
      AND table_schema = 'public'
    `);

    if (tablesCheck.rows.length < 2) {
      return NextResponse.json({
        error: 'Le tabelle translation_keys e translation_values non esistono!',
        message: 'Esegui prima lo script di setup delle tabelle.'
      }, { status: 400 });
    }

    // Leggi i dati esistenti dalla tabella translations
    console.log('📖 Lettura traduzioni esistenti...');
    const existingTranslations = await client.query(`
      SELECT language, section, content 
      FROM translations 
      ORDER BY section, language
    `);

    console.log(`📊 Trovate ${existingTranslations.rows.length} righe di traduzioni esistenti`);

    if (existingTranslations.rows.length === 0) {
      return NextResponse.json({
        message: 'Nessuna traduzione esistente trovata nella tabella translations',
        migrated: 0
      });
    }

    // Raggruppa per sezione per un'elaborazione più efficiente
    const translationsBySection = new Map();
    
    for (const row of existingTranslations.rows) {
      const { language, section, content } = row;
      
      if (!translationsBySection.has(section)) {
        translationsBySection.set(section, new Map());
      }
      
      try {
        // Il content sembra contenere dati in formato strano, prova a estrarre il JSON
        let contentStr = content;
        
        // Se il content inizia con parentesi, prova a estrarre il JSON
        if (typeof contentStr === 'string' && contentStr.startsWith('(')) {
          // Cerca la parte JSON tra le virgolette
          const jsonMatch = contentStr.match(/\{.*\}(?=\))/);
          if (jsonMatch) {
            contentStr = jsonMatch[0];
          }
        }
        
        // Sostituisci le doppie virgolette escape con virgolette normali
        if (typeof contentStr === 'string') {
          contentStr = contentStr.replace(/\"\"/g, '"');
        }
        
        const translationsObj = typeof contentStr === 'string' 
          ? JSON.parse(contentStr) 
          : contentStr;
        
        translationsBySection.get(section).set(language, translationsObj);
        console.log(`✅ Parsed ${language}-${section}: ${Object.keys(translationsObj).length} keys`);
      } catch (error) {
        console.error(`❌ Errore parsing JSON per ${language}-${section}:`, error);
        console.error(`   Content: ${content}`);
      }
    }

    console.log(`🔄 Elaborazione di ${translationsBySection.size} sezioni...`);

    let totalKeys = 0;
    let totalValues = 0;
    const results = [];

    // Processa ogni sezione
    for (const [section, languageData] of translationsBySection) {
      console.log(`📂 Processando sezione: ${section}`);
      
      // Raccogli tutte le chiavi uniche per questa sezione
      const allKeys = new Set();
      for (const [language, translationsObj] of languageData) {
        Object.keys(translationsObj).forEach(key => allKeys.add(key));
      }

      console.log(`   🔑 Trovate ${allKeys.size} chiavi uniche`);

      let sectionKeys = 0;
      let sectionValues = 0;

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
          sectionKeys++;

          // Inserisci i valori per ogni lingua disponibile
          for (const [language, translationsObj] of languageData) {
            const value = translationsObj[keyName as keyof typeof translationsObj];
            if (value && typeof value === 'string') {
              await client.query(`
                INSERT INTO translation_values (key_id, language_code, value)
                VALUES ($1, $2, $3)
                ON CONFLICT (key_id, language_code)
                DO UPDATE SET 
                  value = EXCLUDED.value,
                  updated_at = CURRENT_TIMESTAMP
              `, [keyId, language, value]);
              
              totalValues++;
              sectionValues++;
            }
          }

        } catch (error) {
          console.error(`❌ Errore processando chiave ${keyName} in ${section}:`, error);
        }
      }

      results.push({
        section,
        keys: sectionKeys,
        values: sectionValues,
        languages: languageData.size
      });

      console.log(`✅ Sezione ${section} completata: ${sectionKeys} chiavi, ${sectionValues} valori`);
    }

    // Statistiche finali
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

    // Verifica integrità
    const integrityCheck = await client.query(`
      SELECT 
        COUNT(*) as total_keys,
        COUNT(DISTINCT section) as total_sections,
        (SELECT COUNT(DISTINCT language_code) FROM translation_values) as total_languages
      FROM translation_keys
    `);

    await client.end();

    console.log('🎉 Migrazione completata con successo!');

    return NextResponse.json({
      success: true,
      message: 'Migrazione completata con successo!',
      statistics: {
        totalKeys,
        totalValues,
        sectionsProcessed: translationsBySection.size,
        totalSections: integrityCheck.rows[0].total_sections,
        totalLanguages: integrityCheck.rows[0].total_languages
      },
      sectionResults: results,
      sectionStats: sectionStats.rows
    });

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    return NextResponse.json({
      error: 'Errore durante la migrazione',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verifica stato migrazione...');
    
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL o POSTGRES_URL non trovate nelle variabili d\'ambiente');
    }
    
    const client = new Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    await client.connect();

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

    let sections = [];
    if (newKeysCount.rows[0].count > 0) {
      // Mostra sezioni disponibili
      const sectionsResult = await client.query(`
        SELECT section, COUNT(*) as keys_count
        FROM translation_keys
        GROUP BY section
        ORDER BY section
      `);
      sections = sectionsResult.rows;
    }

    await client.end();

    return NextResponse.json({
      status: {
        originalTranslations: parseInt(originalCount.rows[0].count),
        newKeys: parseInt(newKeysCount.rows[0].count),
        newValues: parseInt(newValuesCount.rows[0].count),
        isPopulated: newKeysCount.rows[0].count > 0
      },
      sections
    });

  } catch (error) {
    console.error('❌ Errore nella verifica dello stato:', error);
    return NextResponse.json({
      error: 'Errore nella verifica dello stato',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
} 