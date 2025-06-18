import axios from 'axios';
import dotenv from 'dotenv';

// Carica variabili d'ambiente dal file .env.local
dotenv.config({ path: '.env.local' });

async function setupTranslationTablesViaDirectus() {
  const directusUrl = process.env.DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusUrl || !directusToken) {
    throw new Error('❌ DIRECTUS_URL o DIRECTUS_TOKEN non trovate nelle variabili d\'ambiente');
  }

  console.log('🔗 Connessione a Directus:', directusUrl);

  // Configura client Directus
  const directus = axios.create({
    baseURL: directusUrl,
    headers: {
      'Authorization': `Bearer ${directusToken}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // Test connessione
    console.log('🔍 Test connessione Directus...');
    await directus.get('/server/info');
    console.log('✅ Connesso a Directus!');

    // Creiamo le tabelle tramite SQL custom endpoint
    console.log('📝 Creazione tabelle translation_keys e translation_values...');
    
    const sqlQueries = [
      // Creazione tabella translation_keys
      `CREATE TABLE IF NOT EXISTS translation_keys (
          id SERIAL PRIMARY KEY,
          key_name VARCHAR(255) NOT NULL UNIQUE,
          section VARCHAR(100) NOT NULL DEFAULT 'common',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      // Creazione tabella translation_values
      `CREATE TABLE IF NOT EXISTS translation_values (
          id SERIAL PRIMARY KEY,
          key_id INTEGER NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
          language_code VARCHAR(10) NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(key_id, language_code)
      );`,
      
      // Indici per performance
      `CREATE INDEX IF NOT EXISTS idx_translation_keys_section ON translation_keys(section);`,
      `CREATE INDEX IF NOT EXISTS idx_translation_keys_key_name ON translation_keys(key_name);`,
      `CREATE INDEX IF NOT EXISTS idx_translation_values_key_id ON translation_values(key_id);`,
      `CREATE INDEX IF NOT EXISTS idx_translation_values_language ON translation_values(language_code);`,
      `CREATE INDEX IF NOT EXISTS idx_translation_values_composite ON translation_values(key_id, language_code);`,
      
      // Funzione per trigger updated_at
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = CURRENT_TIMESTAMP;
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,
       
      // Trigger per translation_keys
      `DROP TRIGGER IF EXISTS update_translation_keys_updated_at ON translation_keys;
       CREATE TRIGGER update_translation_keys_updated_at 
           BEFORE UPDATE ON translation_keys 
           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
           
      // Trigger per translation_values
      `DROP TRIGGER IF EXISTS update_translation_values_updated_at ON translation_values;
       CREATE TRIGGER update_translation_values_updated_at 
           BEFORE UPDATE ON translation_values 
           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
    ];

    // Esegui le query SQL
    for (const [index, query] of sqlQueries.entries()) {
      try {
        console.log(`📝 Esecuzione query ${index + 1}/${sqlQueries.length}...`);
        await directus.post('/custom/sql', { query });
      } catch (error) {
        console.warn(`⚠️ Query ${index + 1} fallita (potrebbe essere normale):`, error.response?.data?.message || error.message);
        // Non interrompiamo per errori non critici
      }
    }

    // Inserimento dati di esempio
    console.log('📚 Inserimento traduzioni di esempio...');
    
    const insertQueries = [
      // Inserimento chiavi
      `INSERT INTO translation_keys (key_name, section, description) VALUES
       ('welcome_message', 'homepage', 'Messaggio di benvenuto nella homepage'),
       ('navigation_home', 'navigation', 'Link Home nella navigazione'),
       ('navigation_about', 'navigation', 'Link Chi Siamo nella navigazione'),
       ('button_search', 'common', 'Testo del pulsante di ricerca'),
       ('loading', 'common', 'Testo mostrato durante il caricamento'),
       ('error_generic', 'errors', 'Messaggio di errore generico')
       ON CONFLICT (key_name) DO NOTHING;`,
       
      // Inserimento valori
      `INSERT INTO translation_values (key_id, language_code, value)
       SELECT tk.id, 'it', 'Benvenuto in TheBestItaly' FROM translation_keys tk WHERE tk.key_name = 'welcome_message'
       UNION ALL
       SELECT tk.id, 'en', 'Welcome to TheBestItaly' FROM translation_keys tk WHERE tk.key_name = 'welcome_message'
       UNION ALL
       SELECT tk.id, 'fr', 'Bienvenue à TheBestItaly' FROM translation_keys tk WHERE tk.key_name = 'welcome_message'
       UNION ALL
       SELECT tk.id, 'de', 'Willkommen bei TheBestItaly' FROM translation_keys tk WHERE tk.key_name = 'welcome_message'
       UNION ALL
       SELECT tk.id, 'es', 'Bienvenido a TheBestItaly' FROM translation_keys tk WHERE tk.key_name = 'welcome_message'
       ON CONFLICT (key_id, language_code) DO NOTHING;`,
       
      `INSERT INTO translation_values (key_id, language_code, value)
       SELECT tk.id, 'it', 'Home' FROM translation_keys tk WHERE tk.key_name = 'navigation_home'
       UNION ALL
       SELECT tk.id, 'en', 'Home' FROM translation_keys tk WHERE tk.key_name = 'navigation_home'
       UNION ALL
       SELECT tk.id, 'fr', 'Accueil' FROM translation_keys tk WHERE tk.key_name = 'navigation_home'
       UNION ALL
       SELECT tk.id, 'de', 'Startseite' FROM translation_keys tk WHERE tk.key_name = 'navigation_home'
       UNION ALL
       SELECT tk.id, 'es', 'Inicio' FROM translation_keys tk WHERE tk.key_name = 'navigation_home'
       ON CONFLICT (key_id, language_code) DO NOTHING;`,
       
      `INSERT INTO translation_values (key_id, language_code, value)
       SELECT tk.id, 'it', 'Chi Siamo' FROM translation_keys tk WHERE tk.key_name = 'navigation_about'
       UNION ALL
       SELECT tk.id, 'en', 'About Us' FROM translation_keys tk WHERE tk.key_name = 'navigation_about'
       UNION ALL
       SELECT tk.id, 'fr', 'À Propos' FROM translation_keys tk WHERE tk.key_name = 'navigation_about'
       UNION ALL
       SELECT tk.id, 'de', 'Über Uns' FROM translation_keys tk WHERE tk.key_name = 'navigation_about'
       UNION ALL
       SELECT tk.id, 'es', 'Acerca de' FROM translation_keys tk WHERE tk.key_name = 'navigation_about'
       ON CONFLICT (key_id, language_code) DO NOTHING;`,
       
      `INSERT INTO translation_values (key_id, language_code, value)
       SELECT tk.id, 'it', 'Cerca' FROM translation_keys tk WHERE tk.key_name = 'button_search'
       UNION ALL
       SELECT tk.id, 'en', 'Search' FROM translation_keys tk WHERE tk.key_name = 'button_search'
       UNION ALL
       SELECT tk.id, 'fr', 'Rechercher' FROM translation_keys tk WHERE tk.key_name = 'button_search'
       UNION ALL
       SELECT tk.id, 'de', 'Suchen' FROM translation_keys tk WHERE tk.key_name = 'button_search'
       UNION ALL
       SELECT tk.id, 'es', 'Buscar' FROM translation_keys tk WHERE tk.key_name = 'button_search'
       ON CONFLICT (key_id, language_code) DO NOTHING;`,
       
      `INSERT INTO translation_values (key_id, language_code, value)
       SELECT tk.id, 'it', 'Caricamento...' FROM translation_keys tk WHERE tk.key_name = 'loading'
       UNION ALL
       SELECT tk.id, 'en', 'Loading...' FROM translation_keys tk WHERE tk.key_name = 'loading'
       UNION ALL
       SELECT tk.id, 'fr', 'Chargement...' FROM translation_keys tk WHERE tk.key_name = 'loading'
       UNION ALL
       SELECT tk.id, 'de', 'Laden...' FROM translation_keys tk WHERE tk.key_name = 'loading'
       UNION ALL
       SELECT tk.id, 'es', 'Cargando...' FROM translation_keys tk WHERE tk.key_name = 'loading'
       ON CONFLICT (key_id, language_code) DO NOTHING;`,
       
      `INSERT INTO translation_values (key_id, language_code, value)
       SELECT tk.id, 'it', 'Si è verificato un errore. Riprova più tardi.' FROM translation_keys tk WHERE tk.key_name = 'error_generic'
       UNION ALL
       SELECT tk.id, 'en', 'An error occurred. Please try again later.' FROM translation_keys tk WHERE tk.key_name = 'error_generic'
       UNION ALL
       SELECT tk.id, 'fr', 'Une erreur s''est produite. Veuillez réessayer plus tard.' FROM translation_keys tk WHERE tk.key_name = 'error_generic'
       UNION ALL
       SELECT tk.id, 'de', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' FROM translation_keys tk WHERE tk.key_name = 'error_generic'
       UNION ALL
       SELECT tk.id, 'es', 'Se ha producido un error. Inténtalo de nuevo más tarde.' FROM translation_keys tk WHERE tk.key_name = 'error_generic'
       ON CONFLICT (key_id, language_code) DO NOTHING;`
    ];

    for (const [index, query] of insertQueries.entries()) {
      try {
        console.log(`📚 Inserimento dati ${index + 1}/${insertQueries.length}...`);
        await directus.post('/custom/sql', { query });
      } catch (error) {
        console.warn(`⚠️ Inserimento ${index + 1} fallito:`, error.response?.data?.message || error.message);
      }
    }

    // Verifica risultati
    console.log('🔍 Verifica risultati...');
    try {
      const keysResult = await directus.post('/custom/sql', { 
        query: 'SELECT COUNT(*) as count FROM translation_keys' 
      });
      const valuesResult = await directus.post('/custom/sql', { 
        query: 'SELECT COUNT(*) as count FROM translation_values' 
      });
      
      console.log('🎉 Setup completato con successo!');
      console.log(`📊 Chiavi di traduzione create: ${keysResult.data?.data?.[0]?.count || 'N/A'}`);
      console.log(`🌐 Valori di traduzione creati: ${valuesResult.data?.data?.[0]?.count || 'N/A'}`);

      // Mostra alcune traduzioni di esempio
      const examplesResult = await directus.post('/custom/sql', { 
        query: `SELECT tk.key_name, tk.section, tv.language_code, tv.value
                FROM translation_keys tk
                JOIN translation_values tv ON tk.id = tv.key_id
                WHERE tk.key_name IN ('welcome_message', 'button_search')
                ORDER BY tk.key_name, tv.language_code
                LIMIT 10` 
      });
      
      console.log('\n📋 Esempi di traduzioni create:');
      examplesResult.data?.data?.forEach(row => {
        console.log(`  ${row.key_name} (${row.section}) [${row.language_code}]: "${row.value}"`);
      });

    } catch (error) {
      console.warn('⚠️ Impossibile verificare i risultati:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Errore durante il setup:', error.response?.data || error.message);
    throw error;
  }
}

// Esegui lo script
setupTranslationTablesViaDirectus()
  .then(() => {
    console.log('✅ Script completato con successo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script fallito:', error);
    process.exit(1);
  }); 