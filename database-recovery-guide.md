# 🚨 GUIDA RECOVERY DATABASE RAILWAY + DIRECTUS

## 📋 SITUAZIONE ATTUALE
- ❌ Database Railway crashato e perso
- ✅ Directus ancora funzionante su: `https://directus-production-93f0.up.railway.app`
- ✅ Frontend Next.js funzionante
- 🔄 OBIETTIVO: Collegare Directus al nuovo database Railway

---

## 🔧 STEP 1: PREPARAZIONE NUOVO DATABASE

### A) Ottieni i dettagli del nuovo database Railway:
```bash
# Vai su Railway.app
# 1. Seleziona il tuo progetto
# 2. Clicca sul nuovo database PostgreSQL
# 3. Vai su "Variables" tab
# 4. Copia queste variabili:
```

**VARIABILI NECESSARIE:**
- `DATABASE_URL` (connection string completa)
- `PGHOST` (hostname)
- `PGPORT` (porta, di solito 5432)
- `PGDATABASE` (nome database)
- `PGUSER` (username)
- `PGPASSWORD` (password)

---

## 🔧 STEP 2: AGGIORNARE DIRECTUS

### A) Accedi al tuo progetto Directus su Railway:
```bash
# Vai su Railway.app
# 1. Seleziona il progetto con Directus
# 2. Clicca sul servizio Directus
# 3. Vai su "Variables" tab
```

### B) Aggiorna le variabili ambiente di Directus:
```env
# SOSTITUISCI con i nuovi valori del database:
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# OPPURE singolarmente:
DB_CLIENT=pg
DB_HOST=nuovo_hostname
DB_PORT=5432
DB_DATABASE=nuovo_nome_database
DB_USER=nuovo_username
DB_PASSWORD=nuova_password
DB_SSL=true
```

### C) Restart del servizio Directus:
- Su Railway > Directus service > Settings > "Restart Deployment"

---

## 🔧 STEP 3: BOOTSTRAP DIRECTUS (RICREARE SCHEMA)

### A) Accesso Directus Admin:
1. Vai su `https://directus-production-93f0.up.railway.app/admin/`
2. Se non riesci ad accedere, il database è vuoto
3. **Primo accesso**: Directus ti chiederà di creare admin user

### B) Creazione Admin User (se necessario):
```
Email: il_tuo_email@email.com
Password: UnaPasswordSicura123!
```

---

## 🔧 STEP 4: RICOSTRUIRE LO SCHEMA DATABASE

### Schema necessario per TheBestItaly:

#### 1. COLLECTIONS PRINCIPALI:
- `languages` (lingue supportate)
- `destinations` (destinazioni turistiche)
- `articles` (articoli magazine)
- `companies` (eccellenze/POI)
- `categories` (categorie articoli)
- `translations` (traduzioni generiche)

#### 2. RELAZIONI:
- `articles` → `categories` (many-to-one)
- `companies` → `destinations` (many-to-one)
- `destinations` → `destinations` (self-reference per hierarchy)

---

## 🔧 STEP 5: IMPORTARE DATI (se hai backup)

### A) Se hai backup SQL:
```bash
# Su Railway database, vai su "Data" tab
# Usa "Query" per eseguire i comandi SQL di import
```

### B) Se hai export CSV/JSON:
- Usa Directus Admin per importare tramite interface

---

## 🔧 STEP 6: CONFIGURARE PERMESSI E RUOLI

### A) Creare ruoli:
1. **Admin** (accesso completo)
2. **Public** (lettura articoli, destinazioni, companies)

### B) Impostare permessi Public:
- ✅ Read: `articles`, `destinations`, `companies`, `categories`, `languages`
- ❌ Create/Update/Delete: tutto bloccato per public

---

## 🔧 STEP 7: TESTARE LA CONNESSIONE

### A) Test dal frontend:
```bash
# Vai su: http://localhost:3000/it/debug/directus-test
# Verifica che le API rispondano
```

### B) Test API dirette:
```bash
curl https://directus-production-93f0.up.railway.app/items/destinations?limit=1
```

---

## 📦 SCRIPT AUTOMATICO DI SCHEMA

Ti creo uno script SQL per ricreare rapidamente lo schema base:

```sql
-- Questo script va eseguito nel nuovo database
-- VERRÀ CREATO AUTOMATICAMENTE NEL FILE database-schema.sql
```

---

## 🆘 PROSSIMI PASSI

1. **Dimmi i dettagli del nuovo database Railway**
2. **Aggiorniamo le env variables di Directus**
3. **Eseguiamo il restart**
4. **Ricreiamo lo schema**
5. **Testiamo tutto**

---

## 📞 HAI BISOGNO DI AIUTO?

Se hai problemi in qualsiasi step, mandami:
1. Screenshot degli errori
2. Logs di Directus (Railway > Directus > Logs)
3. URL del nuovo database (puoi coprire password) 