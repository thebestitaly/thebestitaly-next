#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica le configurazioni
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PROD_DB_URL = process.env.DATABASE_URL;
const STAGING_HOST = process.argv[2]; // Host del database staging passato come parametro

if (!STAGING_HOST) {
  console.error('❌ Usage: node setup-staging-db.js <staging-host>');
  console.error('   Example: node setup-staging-db.js monorail.proxy.rlwy.net');
  process.exit(1);
}

const STAGING_DB_URL = `postgresql://postgres:FowPRDivdnyNlQYEukgNUaSMSsrMKNBA@${STAGING_HOST}/railway`;

console.log('🚀 Setting up staging database...');
console.log('📦 Production DB:', PROD_DB_URL?.substring(0, 50) + '...');
console.log('🏗️  Staging DB:', STAGING_DB_URL);

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️  Warning: ${stderr}`);
      }
      if (stdout) {
        console.log(`✅ ${stdout.trim()}`);
      }
      resolve(stdout);
    });
  });
}

async function setupStagingDatabase() {
  try {
    // 1. Esporta solo la struttura dal database di produzione
    console.log('\n📋 Step 1: Exporting schema from production database...');
    await runCommand(
      `pg_dump "${PROD_DB_URL}" --schema-only --no-owner --no-privileges --file=staging-schema.sql`,
      'Exporting production schema'
    );

    // 2. Importa la struttura nel database staging
    console.log('\n📋 Step 2: Importing schema to staging database...');
    await runCommand(
      `psql "${STAGING_DB_URL}" --file=staging-schema.sql`,
      'Importing schema to staging'
    );

    // 3. Copia dati essenziali (solo strutture di riferimento)
    console.log('\n📋 Step 3: Copying essential reference data...');
    
    // Esporta e importa solo le tabelle di configurazione essenziali
    const essentialTables = [
      'directus_users',
      'directus_roles', 
      'directus_permissions',
      'directus_settings',
      'directus_translations',
      'languages',
      'categorias',
      'categorias_translations',
      'company_categories', 
      'company_categories_translations'
    ];

    for (const table of essentialTables) {
      try {
        await runCommand(
          `pg_dump "${PROD_DB_URL}" --data-only --table=${table} --file=${table}.sql`,
          `Exporting ${table} data`
        );
        
        await runCommand(
          `psql "${STAGING_DB_URL}" --file=${table}.sql`,
          `Importing ${table} data`
        );
        
        // Cleanup
        fs.unlinkSync(`${table}.sql`);
      } catch (error) {
        console.log(`⚠️  Warning: Could not copy ${table} (might not exist)`);
      }
    }

    // 4. Cleanup
    console.log('\n🧹 Cleaning up temporary files...');
    if (fs.existsSync('staging-schema.sql')) {
      fs.unlinkSync('staging-schema.sql');
    }

    console.log('\n✅ Staging database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your Directus admin panel to point to staging DB');
    console.log('2. Use the translation workflow');
    console.log('3. Run sync script to copy translations back to production');
    
    // Salva la configurazione
    const configContent = `# Staging Database Configuration
STAGING_DATABASE_URL=${STAGING_DB_URL}
STAGING_HOST=${STAGING_HOST}
PRODUCTION_DATABASE_URL=${PROD_DB_URL}

# Use this for Directus admin panel during translations
DIRECTUS_DATABASE_URL=${STAGING_DB_URL}
`;

    fs.writeFileSync('.env.staging.local', configContent);
    console.log('\n💾 Configuration saved to .env.staging.local');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Verifica che pg_dump e psql siano disponibili
exec('which pg_dump', (error) => {
  if (error) {
    console.error('❌ PostgreSQL tools not found. Please install PostgreSQL client tools.');
    console.error('   macOS: brew install postgresql');
    console.error('   Ubuntu: sudo apt-get install postgresql-client');
    process.exit(1);
  }
  
  setupStagingDatabase();
}); 