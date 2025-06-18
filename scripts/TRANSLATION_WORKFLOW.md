# Translation Workflow - Database Staging

## Overview
Sistema per gestire le traduzioni in un database di appoggio separato, evitando impatti sulla produzione durante il processo di traduzione.

## Setup Iniziale

### 1. Recupera l'Host del Database Staging
Dal dashboard Railway (thebestitaly-translate):
1. Vai al servizio PostgreSQL
2. Tab "Variables" 
3. Copia il valore di `PGHOST` (es: `monorail.proxy.rlwy.net`)

### 2. Setup Database Staging
```bash
cd scripts
node setup-staging-db.js <STAGING_HOST>
```

Esempio:
```bash
node setup-staging-db.js monorail.proxy.rlwy.net
```

Questo script:
- ✅ Copia la struttura del DB produzione → staging
- ✅ Importa solo i dati essenziali (utenti, ruoli, etc.)
- ✅ Crea il file `.env.staging.local` con le configurazioni

## Workflow Traduzioni

### 3. Configura Directus per Staging
1. Copia il file `.env.staging.local` generato
2. Aggiorna il tuo pannello Directus per usare `STAGING_DATABASE_URL`
3. Ora puoi lavorare sulle traduzioni senza impattare la produzione

### 4. Lavora sulle Traduzioni
- 🔄 Tutte le traduzioni vengono fatte nel database staging
- ⚡ Performance ottimali (DB leggero)
- 🛡️ Produzione completamente isolata

### 5. Sincronizza le Traduzioni
Quando le traduzioni sono pronte:
```bash
node sync-translations.js <STAGING_HOST>
```

Questo script:
- 📦 Crea backup automatico delle traduzioni produzione
- 🔄 Sincronizza solo le nuove traduzioni staging → produzione
- 🛡️ Mantiene intatte le traduzioni italiane esistenti

## Sicurezza e Backup

### Rollback (se necessario)
Se qualcosa va storto, puoi ripristinare:
```bash
node rollback-translations.js <TIMESTAMP>
```

Il timestamp viene mostrato dopo ogni sync.

### File di Backup
I backup vengono salvati automaticamente:
- `backup_article_translations_<timestamp>.sql`
- `backup_destination_translations_<timestamp>.sql`
- `backup_company_translations_<timestamp>.sql`
- `backup_categoria_translations_<timestamp>.sql`

## Tabelle Gestite

### Traduzioni Sincronizzate:
- `article_translations` - Traduzioni articoli
- `destination_translations` - Traduzioni destinazioni
- `company_translations` - Traduzioni aziende  
- `categoria_translations` - Traduzioni categorie

### Dati Essenziali (copiati una volta):
- `directus_users` - Utenti admin
- `directus_roles` - Ruoli
- `directus_permissions` - Permessi
- `directus_settings` - Impostazioni
- `languages` - Lingue supportate

## Vantaggi

✅ **Performance**: DB staging leggero (~100MB vs 10GB)  
✅ **Sicurezza**: Produzione isolata durante traduzioni  
✅ **Backup**: Backup automatici prima di ogni sync  
✅ **Rollback**: Ripristino rapido se necessario  
✅ **Costi**: Minimo impatto sui costi Railway  

## Troubleshooting

### Database non trovato
```bash
# Verifica connessione staging
railway connect postgres
```

### Errori PostgreSQL
```bash
# Verifica tools installati
which pg_dump
which psql

# Su macOS
brew install postgresql
```

### Sync fallito
1. Controlla i log degli errori
2. Usa il comando rollback con il timestamp mostrato
3. Verifica le connessioni ai database

## Comandi Rapidi

```bash
# Setup iniziale
node setup-staging-db.js <HOST>

# Sincronizza traduzioni
node sync-translations.js <HOST>

# Rollback se necessario  
node rollback-translations.js <TIMESTAMP>
```

---

**Nota**: Sostituisci `<HOST>` con l'host effettivo del database staging da Railway. 