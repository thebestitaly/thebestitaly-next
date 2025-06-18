import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug traduzioni esistenti...');
    
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL o POSTGRES_URL non trovate nelle variabili d\'ambiente');
    }
    
    const client = new Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    await client.connect();

    // Verifica struttura tabella translations
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'translations' 
      ORDER BY ordinal_position
    `);

    // Preleva alcuni esempi di traduzioni
    const sampleTranslations = await client.query(`
      SELECT language, section, translations::text as translations_text
      FROM translations 
      LIMIT 10
    `);

    // Conta per sezione e lingua
    const sectionCounts = await client.query(`
      SELECT section, language, 
             CASE 
               WHEN translations IS NULL THEN 'NULL'
               WHEN translations::text = '' THEN 'EMPTY'
               WHEN translations::text = '{}' THEN 'EMPTY_JSON'
               ELSE 'HAS_DATA'
             END as data_status,
             LENGTH(translations::text) as data_length
      FROM translations 
      ORDER BY section, language
    `);

    // Prova a parsare uno specifico JSON
    let parsedExample = null;
    if (sampleTranslations.rows.length > 0) {
      const firstRow = sampleTranslations.rows[0];
      if (firstRow.translations_text) {
        try {
          parsedExample = {
            section: firstRow.section,
            language: firstRow.language,
            parsed: JSON.parse(firstRow.translations_text)
          };
        } catch (error) {
          parsedExample = {
            section: firstRow.section,
            language: firstRow.language,
            error: error instanceof Error ? error.message : 'Parse error',
            raw: firstRow.translations_text
          };
        }
      }
    }

    await client.end();

    return NextResponse.json({
      tableStructure: tableStructure.rows,
      sampleTranslations: sampleTranslations.rows,
      sectionCounts: sectionCounts.rows,
      parsedExample,
      totalRows: sampleTranslations.rows.length
    });

  } catch (error) {
    console.error('❌ Errore nel debug:', error);
    return NextResponse.json({
      error: 'Errore nel debug delle traduzioni',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
} 