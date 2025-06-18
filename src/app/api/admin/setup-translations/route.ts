import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Avvio setup tabelle traduzioni...');
    
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

    // Creazione tabella translation_keys
    console.log('📝 Creazione tabella translation_keys...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS translation_keys (
          id SERIAL PRIMARY KEY,
          key_name VARCHAR(255) NOT NULL UNIQUE,
          section VARCHAR(100) NOT NULL DEFAULT 'common',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Creazione tabella translation_values
    console.log('📝 Creazione tabella translation_values...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS translation_values (
          id SERIAL PRIMARY KEY,
          key_id INTEGER NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
          language_code VARCHAR(10) NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(key_id, language_code)
      );
    `);

    // Creazione indici per performance
    console.log('🔍 Creazione indici per performance...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_translation_keys_section ON translation_keys(section)',
      'CREATE INDEX IF NOT EXISTS idx_translation_keys_key_name ON translation_keys(key_name)',
      'CREATE INDEX IF NOT EXISTS idx_translation_values_key_id ON translation_values(key_id)',
      'CREATE INDEX IF NOT EXISTS idx_translation_values_language ON translation_values(language_code)',
      'CREATE INDEX IF NOT EXISTS idx_translation_values_composite ON translation_values(key_id, language_code)'
    ];

    for (const indexQuery of indices) {
      await client.query(indexQuery);
    }

    // Creazione funzione per trigger updated_at
    console.log('⚙️ Creazione trigger per updated_at...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Creazione trigger
    await client.query(`
      DROP TRIGGER IF EXISTS update_translation_keys_updated_at ON translation_keys;
      CREATE TRIGGER update_translation_keys_updated_at 
          BEFORE UPDATE ON translation_keys 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_translation_values_updated_at ON translation_values;
      CREATE TRIGGER update_translation_values_updated_at 
          BEFORE UPDATE ON translation_values 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Inserimento traduzioni di esempio
    console.log('📚 Inserimento traduzioni di esempio...');
    
    // Prima inseriamo le chiavi
    const keys = [
      ['welcome_message', 'homepage', 'Messaggio di benvenuto nella homepage'],
      ['navigation_home', 'navigation', 'Link Home nella navigazione'],
      ['navigation_about', 'navigation', 'Link Chi Siamo nella navigazione'],
      ['button_search', 'common', 'Testo del pulsante di ricerca'],
      ['loading', 'common', 'Testo mostrato durante il caricamento'],
      ['error_generic', 'errors', 'Messaggio di errore generico']
    ];

    for (const [keyName, section, description] of keys) {
      await client.query(`
        INSERT INTO translation_keys (key_name, section, description) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (key_name) DO NOTHING
      `, [keyName, section, description]);
    }

    // Poi inseriamo i valori
    const values = [
      // welcome_message
      ['welcome_message', 'it', 'Benvenuto in TheBestItaly'],
      ['welcome_message', 'en', 'Welcome to TheBestItaly'],
      ['welcome_message', 'fr', 'Bienvenue à TheBestItaly'],
      ['welcome_message', 'de', 'Willkommen bei TheBestItaly'],
      ['welcome_message', 'es', 'Bienvenido a TheBestItaly'],
      
      // navigation_home
      ['navigation_home', 'it', 'Home'],
      ['navigation_home', 'en', 'Home'],
      ['navigation_home', 'fr', 'Accueil'],
      ['navigation_home', 'de', 'Startseite'],
      ['navigation_home', 'es', 'Inicio'],
      
      // navigation_about
      ['navigation_about', 'it', 'Chi Siamo'],
      ['navigation_about', 'en', 'About Us'],
      ['navigation_about', 'fr', 'À Propos'],
      ['navigation_about', 'de', 'Über Uns'],
      ['navigation_about', 'es', 'Acerca de'],
      
      // button_search
      ['button_search', 'it', 'Cerca'],
      ['button_search', 'en', 'Search'],
      ['button_search', 'fr', 'Rechercher'],
      ['button_search', 'de', 'Suchen'],
      ['button_search', 'es', 'Buscar'],
      
      // loading
      ['loading', 'it', 'Caricamento...'],
      ['loading', 'en', 'Loading...'],
      ['loading', 'fr', 'Chargement...'],
      ['loading', 'de', 'Laden...'],
      ['loading', 'es', 'Cargando...'],
      
      // error_generic
      ['error_generic', 'it', 'Si è verificato un errore. Riprova più tardi.'],
      ['error_generic', 'en', 'An error occurred. Please try again later.'],
      ['error_generic', 'fr', 'Une erreur s\'est produite. Veuillez réessayer plus tard.'],
      ['error_generic', 'de', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'],
      ['error_generic', 'es', 'Se ha producido un error. Inténtalo de nuevo más tarde.']
    ];

    for (const [keyName, langCode, value] of values) {
      await client.query(`
        INSERT INTO translation_values (key_id, language_code, value)
        SELECT tk.id, $2, $3
        FROM translation_keys tk
        WHERE tk.key_name = $1
        ON CONFLICT (key_id, language_code) DO NOTHING
      `, [keyName, langCode, value]);
    }

    // Verifica risultati
    const keysCount = await client.query('SELECT COUNT(*) FROM translation_keys');
    const valuesCount = await client.query('SELECT COUNT(*) FROM translation_values');
    
    console.log('🎉 Setup completato con successo!');
    console.log(`📊 Chiavi di traduzione create: ${keysCount.rows[0].count}`);
    console.log(`🌐 Valori di traduzione creati: ${valuesCount.rows[0].count}`);
    
    // Mostra alcune traduzioni di esempio
    const examples = await client.query(`
      SELECT tk.key_name, tk.section, tv.language_code, tv.value
      FROM translation_keys tk
      JOIN translation_values tv ON tk.id = tv.key_id
      WHERE tk.key_name IN ('welcome_message', 'button_search')
      ORDER BY tk.key_name, tv.language_code
      LIMIT 10
    `);
    
    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Setup tabelle traduzioni completato con successo!',
      data: {
        keysCreated: keysCount.rows[0].count,
        valuesCreated: valuesCount.rows[0].count,
        examples: examples.rows
      }
    });

  } catch (error) {
    console.error('❌ Errore durante il setup:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
} 