#!/usr/bin/env node

/**
 * Script per aggiungere campi UUID alle collections esistenti
 * 
 * Questo script:
 * 1. Crea le colonne UUID nel database PostgreSQL
 * 2. Popola tutti i record esistenti con UUID unici
 * 3. Configura i default per i nuovi record
 * 4. Aggiorna lo schema di Directus
 */

import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Trova la directory root del progetto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carica le variabili d'ambiente dalla root del progetto
dotenv.config({ path: path.join(rootDir, '.env.local') });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🚀${colors.reset} ${colors.bright}${msg}${colors.reset}`)
};

// Configurazione collections da migrare
const COLLECTIONS_CONFIG = [

  {
    table: 'destinations', 
    name: 'Destinations',
    column: 'uuid_id'
  }
];

class UUIDMigration {
  constructor() {
    this.client = null;
    this.results = {
      created: [],
      updated: [],
      errors: []
    };
  }

  async connect() {
    try {
      // Estrai i parametri di connessione dall'URL di Directus
      const dbUrl = process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;
      
      if (!dbUrl) {
        throw new Error('DATABASE_URL o DB_CONNECTION_STRING non trovato nelle variabili d\'ambiente');
      }

      log.info('Connessione al database PostgreSQL...');
      
      this.client = new Client({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      await this.client.connect();
      log.success('Connesso al database PostgreSQL');
      
      // Verifica la versione PostgreSQL
      const versionResult = await this.client.query('SELECT version()');
      log.info(`PostgreSQL: ${versionResult.rows[0].version.split(' ')[1]}`);
      
    } catch (error) {
      log.error(`Errore connessione database: ${error.message}`);
      throw error;
    }
  }

  async checkTableExists(tableName) {
    const result = await this.client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    
    return result.rows[0].exists;
  }

  async checkColumnExists(tableName, columnName) {
    const result = await this.client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
      )
    `, [tableName, columnName]);
    
    return result.rows[0].exists;
  }

  async createUUIDColumn(config) {
    const { table, column, name } = config;
    
    log.step(`Processando ${name} (${table})...`);

    // Verifica che la tabella esista
    const tableExists = await this.checkTableExists(table);
    if (!tableExists) {
      log.error(`Tabella ${table} non trovata`);
      this.results.errors.push(`Tabella ${table} non esistente`);
      return false;
    }

    // Verifica se la colonna esiste già
    const columnExists = await this.checkColumnExists(table, column);
    if (columnExists) {
      log.warning(`Colonna ${column} già presente in ${table}`);
      return true;
    }

    try {
      // Crea la colonna UUID
      log.info(`Creazione colonna ${column} in ${table}...`);
      await this.client.query(`
        ALTER TABLE ${table} 
        ADD COLUMN ${column} UUID
      `);

      // Imposta il default per i nuovi record
      await this.client.query(`
        ALTER TABLE ${table} 
        ALTER COLUMN ${column} SET DEFAULT gen_random_uuid()
      `);

      log.success(`Colonna ${column} creata in ${table}`);
      this.results.created.push(`${table}.${column}`);
      return true;

    } catch (error) {
      log.error(`Errore creazione colonna ${column} in ${table}: ${error.message}`);
      this.results.errors.push(`${table}.${column}: ${error.message}`);
      return false;
    }
  }

  async populateUUIDs(config) {
    const { table, column, name } = config;
    
    try {
      // Conta i record senza UUID
      const countResult = await this.client.query(`
        SELECT COUNT(*) as count FROM ${table} WHERE ${column} IS NULL
      `);
      
      const recordsToUpdate = parseInt(countResult.rows[0].count);
      
      if (recordsToUpdate === 0) {
        log.info(`Tutti i record in ${table} hanno già UUID`);
        return true;
      }

      log.info(`Popolamento UUID per ${recordsToUpdate} record in ${table}...`);

      // Popola tutti i record senza UUID
      const updateResult = await this.client.query(`
        UPDATE ${table} 
        SET ${column} = gen_random_uuid() 
        WHERE ${column} IS NULL
      `);

      const updatedCount = updateResult.rowCount;
      log.success(`Aggiornati ${updatedCount} record in ${table}`);
      this.results.updated.push(`${table}: ${updatedCount} record`);
      
      return true;

    } catch (error) {
      log.error(`Errore popolamento UUID in ${table}: ${error.message}`);
      this.results.errors.push(`Popolamento ${table}: ${error.message}`);
      return false;
    }
  }

  async createUniqueIndex(config) {
    const { table, column } = config;
    const indexName = `${table}_${column}_unique_idx`;
    
    try {
      log.info(`Creazione indice unico per ${table}.${column}...`);
      
      await this.client.query(`
        CREATE UNIQUE INDEX CONCURRENTLY ${indexName} 
        ON ${table} (${column})
      `);
      
      log.success(`Indice ${indexName} creato`);
      return true;
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        log.warning(`Indice ${indexName} già esistente`);
        return true;
      }
      
      log.error(`Errore creazione indice ${indexName}: ${error.message}`);
      this.results.errors.push(`Indice ${indexName}: ${error.message}`);
      return false;
    }
  }

  async verifyData(config) {
    const { table, column, name } = config;
    
    try {
      // Verifica che tutti i record abbiano UUID
      const nullResult = await this.client.query(`
        SELECT COUNT(*) as count FROM ${table} WHERE ${column} IS NULL
      `);
      
      const nullCount = parseInt(nullResult.rows[0].count);
      
      if (nullCount > 0) {
        log.error(`${nullCount} record in ${table} ancora senza UUID`);
        return false;
      }

      // Verifica unicità degli UUID
      const duplicateResult = await this.client.query(`
        SELECT ${column}, COUNT(*) as count 
        FROM ${table} 
        GROUP BY ${column} 
        HAVING COUNT(*) > 1
      `);
      
      if (duplicateResult.rows.length > 0) {
        log.error(`UUID duplicati trovati in ${table}: ${duplicateResult.rows.length}`);
        return false;
      }

      // Conta totale record
      const totalResult = await this.client.query(`SELECT COUNT(*) as count FROM ${table}`);
      const totalCount = parseInt(totalResult.rows[0].count);
      
      log.success(`${name}: ${totalCount} record, tutti con UUID unici`);
      return true;
      
    } catch (error) {
      log.error(`Errore verifica dati ${table}: ${error.message}`);
      return false;
    }
  }

  async run() {
    try {
      await this.connect();
      
      log.step('🚀 INIZIO MIGRAZIONE UUID');
      console.log('='.repeat(50));
      
      let allSuccess = true;

      // Fase 1: Creazione colonne
      log.step('FASE 1: Creazione colonne UUID');
      for (const config of COLLECTIONS_CONFIG) {
        const success = await this.createUUIDColumn(config);
        if (!success) allSuccess = false;
      }

      // Fase 2: Popolamento UUID
      log.step('FASE 2: Popolamento UUID esistenti');
      for (const config of COLLECTIONS_CONFIG) {
        const success = await this.populateUUIDs(config);
        if (!success) allSuccess = false;
      }

      // Fase 3: Creazione indici
      log.step('FASE 3: Creazione indici unici');
      for (const config of COLLECTIONS_CONFIG) {
        const success = await this.createUniqueIndex(config);
        if (!success) allSuccess = false;
      }

      // Fase 4: Verifica finale
      log.step('FASE 4: Verifica dati');
      for (const config of COLLECTIONS_CONFIG) {
        const success = await this.verifyData(config);
        if (!success) allSuccess = false;
      }

      // Risultati finali
      console.log('\n' + '='.repeat(50));
      log.step('RISULTATI MIGRAZIONE');
      
      if (this.results.created.length > 0) {
        log.success(`Colonne create: ${this.results.created.join(', ')}`);
      }
      
      if (this.results.updated.length > 0) {
        log.success(`Record aggiornati: ${this.results.updated.join(', ')}`);
      }
      
      if (this.results.errors.length > 0) {
        log.error(`Errori: ${this.results.errors.length}`);
        this.results.errors.forEach(error => log.error(`  - ${error}`));
      }

      if (allSuccess) {
        log.success('✨ MIGRAZIONE COMPLETATA CON SUCCESSO!');
        console.log('\n🎯 Prossimi passi:');
        console.log('1. Riavvia Directus per aggiornare lo schema');
        console.log('2. Verifica i nuovi campi nell\'interfaccia Directus');
        console.log('3. Aggiorna il codice per utilizzare i nuovi UUID');
      } else {
        log.error('❌ MIGRAZIONE COMPLETATA CON ERRORI');
        console.log('Controlla i log sopra per i dettagli');
      }

    } catch (error) {
      log.error(`Errore durante la migrazione: ${error.message}`);
      process.exit(1);
    } finally {
      if (this.client) {
        await this.client.end();
        log.info('Connessione database chiusa');
      }
    }
  }
}

// Esecuzione script
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new UUIDMigration();
  
  process.on('SIGINT', async () => {
    log.warning('Migrazione interrotta dall\'utente');
    if (migration.client) {
      await migration.client.end();
    }
    process.exit(0);
  });
  
  migration.run().catch(error => {
    log.error(`Errore fatale: ${error.message}`);
    process.exit(1);
  });
}

export default UUIDMigration; 