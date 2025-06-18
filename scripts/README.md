# Migrazione UUID per Collections Directus

Questo script aggiunge campi UUID alle collections `articles`, `companies` e `categorias` mantenendo gli ID numerici esistenti.

## 🚀 Esecuzione Rapida

```bash
# 1. Installa le dipendenze
npm install

# 2. Esegui la migrazione
npm run migrate:uuid
```

## 📋 Cosa fa lo script

1. **Crea colonne UUID** (`uuid_id`) nelle tabelle:
   - `articles.uuid_id`
   - `companies.uuid_id` 
   - `categorias.uuid_id`

2. **Popola tutti i record esistenti** con UUID unici generati da PostgreSQL

3. **Configura default** per nuovi record (`gen_random_uuid()`)

4. **Crea indici unici** per performance e integrità

5. **Verifica** che tutto sia corretto

## ⚙️ Prerequisiti

- **PostgreSQL** con estensione `pgcrypto` (per `gen_random_uuid()`)
- **Node.js** 18+
- **Accesso al database** via `DATABASE_URL` nelle variabili d'ambiente

## 🔧 Configurazione

Assicurati di avere il file `.env` nella **root del progetto** (non nella cartella scripts):

```env
# File: .env (nella root del progetto)
DATABASE_URL=postgresql://user:password@host:port/database
# oppure
DB_CONNECTION_STRING=postgresql://user:password@host:port/database
```

Lo script cercherà automaticamente il `.env` nella directory principale del progetto.

## 📊 Output Esempio

```
🚀 INIZIO MIGRAZIONE UUID
==================================================
🚀 FASE 1: Creazione colonne UUID
🚀 Processando Articles (articles)...
ℹ Creazione colonna uuid_id in articles...
✅ Colonna uuid_id creata in articles

🚀 FASE 2: Popolamento UUID esistenti  
ℹ Popolamento UUID per 1250 record in articles...
✅ Aggiornati 1250 record in articles

🚀 FASE 3: Creazione indici unici
✅ Indice articles_uuid_id_unique_idx creato

🚀 FASE 4: Verifica dati
✅ Articles: 1250 record, tutti con UUID unici

🚀 RISULTATI MIGRAZIONE
✅ Colonne create: articles.uuid_id, companies.uuid_id, categorias.uuid_id
✅ Record aggiornati: articles: 1250 record, companies: 450 record
✨ MIGRAZIONE COMPLETATA CON SUCCESSO!

🎯 Prossimi passi:
1. Riavvia Directus per aggiornare lo schema
2. Verifica i nuovi campi nell'interfaccia Directus  
3. Aggiorna il codice per utilizzare i nuovi UUID
```

## 🔍 Verifica Post-Migrazione

Dopo la migrazione, puoi verificare che tutto sia andato bene:

```sql
-- Verifica che tutti i record abbiano UUID
SELECT 'articles' as table_name, COUNT(*) as total, COUNT(uuid_id) as with_uuid 
FROM articles
UNION ALL
SELECT 'companies', COUNT(*), COUNT(uuid_id) FROM companies
UNION ALL  
SELECT 'categorias', COUNT(*), COUNT(uuid_id) FROM categorias;

-- Verifica unicità UUID
SELECT 'articles' as table_name, COUNT(DISTINCT uuid_id) as unique_uuids, COUNT(*) as total
FROM articles
UNION ALL
SELECT 'companies', COUNT(DISTINCT uuid_id), COUNT(*) FROM companies
UNION ALL
SELECT 'categorias', COUNT(DISTINCT uuid_id), COUNT(*) FROM categorias;
```

## ⚠️ Importante

- **Fai sempre un backup** del database prima di eseguire lo script
- **Riavvia Directus** dopo la migrazione per aggiornare lo schema
- **Testa in ambiente di sviluppo** prima della produzione
- Lo script è **idempotente**: può essere eseguito più volte senza problemi

## 🐛 Risoluzione Problemi

### Errore: "function gen_random_uuid() does not exist"
```sql
-- Attiva l'estensione pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Errore di connessione al database
- Verifica `DATABASE_URL` nel file `.env`
- Controlla che PostgreSQL sia avviato
- Verifica permessi di accesso al database

### Directus non vede i nuovi campi
- Riavvia Directus completamente
- Vai in Settings > Data Model e forza un refresh dello schema 