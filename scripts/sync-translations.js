#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

// Carica le configurazioni
require('dotenv').config();

const PROD_DB_URL = process.env.DATABASE_URL;
const STAGING_HOST = process.argv[2];

if (!STAGING_HOST) {
  console.error('❌ Usage: node sync-translations.js <staging-host>');
  console.error('   Example: node sync-translations.js monorail.proxy.rlwy.net');
  process.exit(1);
}

const STAGING_DB_URL = `postgresql://postgres:FowPRDivdnyNIQYEukgNUaSMSsrMKNBA@${STAGING_HOST}:5432/railway`;

console.log('🔄 Syncing translations from staging to production...');
console.log('🏗️  Staging DB:', STAGING_DB_URL);
console.log('📦 Production DB:', PROD_DB_URL?.substring(0, 50) + '...');

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('NOTICE')) {
        console.log(`⚠️  Warning: ${stderr}`);
      }
      if (stdout) {
        console.log(`✅ ${stdout.trim()}`);
      }
      resolve(stdout);
    });
  });
}

async function syncTranslations() {
  try {
    // Tabelle delle traduzioni da sincronizzare
    const translationTables = [
      'article_translations',
      'destination_translations', 
      'company_translations',
      'categoria_translations'
    ];

    console.log('\n📋 Creating backup of production translations...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    for (const table of translationTables) {
      // 1. Backup delle traduzioni di produzione
      await runCommand(
        `pg_dump "${PROD_DB_URL}" --data-only --table=${table} --file=backup_${table}_${timestamp}.sql`,
        `Backing up production ${table}`
      );

      // 2. Esporta le nuove traduzioni dallo staging
      await runCommand(
        `pg_dump "${STAGING_DB_URL}" --data-only --table=${table} --file=staging_${table}.sql`,
        `Exporting staging ${table}`
      );

      // 3. Applica le traduzioni alla produzione
      console.log(`\n🔄 Syncing ${table} to production...`);
      
      // Prima cancella le traduzioni esistenti per evitare conflitti
      await runCommand(
        `psql "${PROD_DB_URL}" -c "DELETE FROM ${table} WHERE languages_code != 'it';"`,
        `Clearing non-Italian translations from production ${table}`
      );

      // Poi importa le nuove traduzioni
      await runCommand(
        `psql "${PROD_DB_URL}" --file=staging_${table}.sql`,
        `Importing new translations to production ${table}`
      );

      // Cleanup file temporanei
      fs.unlinkSync(`staging_${table}.sql`);
    }

    console.log('\n✅ Translation sync completed successfully!');
    console.log('\n📁 Backup files created:');
    translationTables.forEach(table => {
      console.log(`   - backup_${table}_${timestamp}.sql`);
    });
    
    console.log('\n🔄 To rollback if needed:');
    console.log('   Run: node rollback-translations.js ' + timestamp);

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.log('\n🔄 To restore from backup, run:');
    console.log('   node rollback-translations.js ' + timestamp);
    process.exit(1);
  }
}

// Conferma prima di procedere
console.log('\n⚠️  WARNING: This will overwrite production translations!');
console.log('📁 Backups will be created automatically.');
console.log('\n❓ Continue? (y/N)');

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    const input = chunk.trim().toLowerCase();
    if (input === 'y' || input === 'yes') {
      syncTranslations();
    } else {
      console.log('❌ Sync cancelled.');
      process.exit(0);
    }
  }
}); 