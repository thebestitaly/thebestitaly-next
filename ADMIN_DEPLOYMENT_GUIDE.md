# 🚀 Guida Deployment Admin Panel

## 🎯 Panoramica

Il branch `admin` contiene un'applicazione Next.js dedicata esclusivamente alle funzionalità amministrative, ottimizzata per performance e sicurezza.

## 📋 Prerequisiti

### 1. Servizio Railway Separato
- **Sito Pubblico**: `https://thebestitaly.eu` (branch `web`)
- **Admin Panel**: `https://admin.thebestitaly.eu` (branch `admin`)

### 2. Variabili d'Ambiente Necessarie

#### **Variabili Obbligatorie**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
STAGING_DATABASE_URL=postgresql://user:pass@host:port/db_staging

# Directus CMS
DIRECTUS_URL=https://cdn.thebestitaly.eu
DIRECTUS_TOKEN=your_directus_token

# Admin specifiche
ADMIN_JWT_SECRET=your_jwt_secret_for_admin_auth
ADMIN_PASSWORD_HASH=your_admin_password_hash

# Sistema
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
DISABLE_ESLINT_PLUGIN=true
NODE_OPTIONS=--max-old-space-size=1024
```

#### **Variabili Opzionali**
```env
# Redis (per cache)
REDIS_URL=redis://user:pass@host:port

# Sentry (per monitoring)
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# OpenAI (per traduzioni automatiche)
OPENAI_API_KEY=your_openai_key
```

## 🛠️ Configurazione Railway

### 1. Creare Nuovo Servizio
```bash
# Nel dashboard Railway:
# 1. New Project → Deploy from GitHub repo
# 2. Seleziona repository: thebestitaly/thebestitaly-next
# 3. Seleziona branch: admin
# 4. Configura dominio: admin.thebestitaly.eu
```

### 2. Configurazione Build
Il file `railway.json` è già configurato:
- **Memory limit**: 1024MB (ottimizzato per admin)
- **Build command**: `npm run build`
- **Start command**: `npm start`

## 🔐 Funzionalità Admin

### 1. Pannello di Controllo
- **URL**: `https://admin.thebestitaly.eu/it/reserved`
- **Login**: `https://admin.thebestitaly.eu/it/reserved/login`

### 2. Gestione Contenuti
- **Destinazioni**: Creazione/modifica destinazioni
- **Aziende**: Gestione eccellenze italiane
- **Traduzioni**: Sistema multilingua (51 lingue)
- **Widget**: Generazione widget personalizzati

### 3. API Admin
Tutte le API sono sotto `/api/admin/`:
- `/api/admin/translations` - Gestione traduzioni
- `/api/admin/static-cache` - Cache ottimizzato
- `/api/admin/memory-monitor` - Monitoraggio memoria
- `/api/admin/traffic-monitor` - Monitoraggio traffico

## 📊 Monitoring e Performance

### 1. Monitoraggio Memoria
```bash
# Controlla uso memoria
curl https://admin.thebestitaly.eu/api/admin/memory-monitor

# Risposta attesa:
{
  "memory": {
    "heap_used_mb": 150,
    "heap_total_mb": 200,
    "rss_mb": 250
  },
  "status": "OK",
  "target": "300-400MB heap used"
}
```

### 2. Cache Statico
```bash
# Verifica cache
curl https://admin.thebestitaly.eu/api/admin/static-cache

# Genera cache
curl -X POST https://admin.thebestitaly.eu/api/admin/static-cache \
     -H "Content-Type: application/json" \
     -d '{"action": "generate", "languages": ["it", "en"]}'
```

## 🚀 Deployment Steps

### 1. Commit e Push
```bash
# Assicurati di essere sul branch admin
git checkout admin
git add .
git commit -m "Admin: Ready for deployment"
git push origin admin
```

### 2. Configurazione Railway
1. **Crea nuovo servizio** da GitHub
2. **Seleziona branch**: `admin`
3. **Imposta variabili d'ambiente** (vedi sopra)
4. **Configura dominio**: `admin.thebestitaly.eu`

### 3. Verifica Deployment
```bash
# Test health check
curl https://admin.thebestitaly.eu/api/health

# Test admin panel
curl https://admin.thebestitaly.eu/it/reserved
```

## 🔧 Troubleshooting

### 1. Memoria Insufficiente
```bash
# Aumenta memoria se necessario
NODE_OPTIONS=--max-old-space-size=2048
```

### 2. Errori Database
```bash
# Verifica connessione database
curl https://admin.thebestitaly.eu/api/admin/debug-translations
```

### 3. Cache Issues
```bash
# Pulisci cache
curl -X DELETE https://admin.thebestitaly.eu/api/admin/static-cache
```

## 📝 Note Importanti

1. **Sicurezza**: L'admin panel è protetto da autenticazione
2. **Performance**: Ottimizzato per 1024MB di memoria
3. **Multilingua**: Supporta 51 lingue
4. **Cache**: Sistema di cache intelligente per performance
5. **Monitoring**: Monitoraggio memoria e traffico integrato

## 🎯 Prossimi Passi

1. **Deploy su Railway** seguendo questa guida
2. **Configurare dominio** admin.thebestitaly.eu
3. **Testare funzionalità** admin
4. **Configurare monitoring** e alerting

---

**Stato**: Ready for deployment ✅
**Memoria**: 1024MB (ottimizzato)
**Sicurezza**: Autenticazione integrata
**Performance**: Cache intelligente 