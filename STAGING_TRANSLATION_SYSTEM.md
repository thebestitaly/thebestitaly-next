# 🔄 Sistema di Traduzioni Staging

## 📋 Panoramica

Il sistema di traduzioni staging permette di:
- **Separare** le traduzioni dalla produzione
- **Testare** le traduzioni prima di pubblicarle
- **Eseguire più traduzioni contemporaneamente** senza interferenze
- **Confermare** le traduzioni prima di sincronizzarle

## 🏗️ Architettura

### Database
- **Produzione**: `ballast.proxy.rlwy.net:42105` (Railway)
- **Staging**: `crossover.proxy.rlwy.net:36794` (Railway)

### Flusso di Lavoro
1. **Crea traduzioni** → Database Staging
2. **Preview/Test** → Visualizza traduzioni staging
3. **Conferma** → Sincronizza da staging a produzione

## 🚀 API Endpoints

### Creazione Traduzioni Staging
```
POST /api/translations/staging/create
{
  "itemType": "article|company|destination",
  "itemId": 123,
  "translationType": "english|all"
}
```

### Preview Traduzioni Staging
```
GET /api/translations/staging/preview/[type]/[id]?lang=en
```

### Sincronizzazione alla Produzione
```
POST /api/translations/staging/sync
{
  "itemType": "article",
  "itemId": 123,
  "languages": ["en", "fr"], // Opzionale
  "confirmSync": true
}
```

### Stato Traduzioni
```
GET /api/translations/staging/sync?itemType=article&itemId=123
```

## 🎯 Integrazione con Script Esistenti

Il sistema **non sostituisce** i tuoi script esistenti, ma li **estende**:

### Script Esistenti (mantengono funzionalità)
- `/api/translate-articles/[id]/route.ts` ✅
- `/api/translate-companies/[id]/route.ts` ✅  
- `/api/translate-destinations/[id]/route.ts` ✅

### Nuovo Layer Staging
- Usa gli stessi script ma con database staging
- Aggiunge preview e conferma
- Permette traduzioni parallele

## 🖥️ Interfaccia Utente

### Componente StagingTranslationManager
```tsx
<StagingTranslationManager 
  itemType="article"
  itemId={123}
  itemTitle="Titolo Articolo"
/>
```

### Funzionalità UI
- ✅ **Stato traduzioni** (staging vs produzione)
- ✅ **Creazione traduzioni** (inglese o 49 lingue)
- ✅ **Selezione lingue** per sincronizzazione
- ✅ **Conferma e sincronizzazione**
- ✅ **Indicatori di progresso**

## 📁 File Coinvolti

### API Routes
```
src/app/api/translations/staging/
├── create/route.ts           # Crea traduzioni in staging
├── preview/[type]/[id]/route.ts  # Preview traduzioni
└── sync/route.ts             # Sincronizza a produzione
```

### Componenti
```
src/components/translations/
└── StagingTranslationManager.tsx  # UI principale
```

### Configurazione
```
src/lib/staging-config.ts     # Config database e lingue
scripts/setup-staging-db.js   # Setup database staging
```

## 🔧 Setup e Configurazione

### 1. Database Staging
```bash
# Eseguito automaticamente
node scripts/setup-staging-db.js crossover.proxy.rlwy.net:36794
```

### 2. Variabili Ambiente
```env
# Produzione (esistenti)
DATABASE_URL=postgresql://postgres:...@ballast.proxy.rlwy.net:42105/railway
DIRECTUS_URL=https://directus-production-93f0.up.railway.app
DIRECTUS_TOKEN=1NtlZnWWAJ0phQWWxCMpRPWCfw3UcO_L

# Staging (automatiche)
STAGING_DB_URL=postgresql://postgres:...@crossover.proxy.rlwy.net:36794/railway
```

### 3. Integrazione nelle Pagine
```tsx
// In qualsiasi pagina di edit
import StagingTranslationManager from '@/components/translations/StagingTranslationManager';

// Aggiungi il componente
<StagingTranslationManager 
  itemType="article"
  itemId={articleId}
  itemTitle={articleTitle}
/>
```

## 🌍 Lingue Supportate

Il sistema supporta le stesse **49 lingue** dei tuoi script esistenti:
- English, French, Spanish, Portuguese, German...
- Totale: 49 lingue con mapping completo

## ⚡ Vantaggi

### Separazione
- ❌ **Prima**: Traduzioni dirette in produzione
- ✅ **Ora**: Traduzioni in staging → Preview → Conferma

### Parallelizzazione  
- ❌ **Prima**: Una traduzione alla volta
- ✅ **Ora**: Più traduzioni contemporaneamente

### Sicurezza
- ❌ **Prima**: Rischio di errori in produzione
- ✅ **Ora**: Test completo prima della pubblicazione

### Controllo
- ❌ **Prima**: Traduzioni immediate
- ✅ **Ora**: Preview e conferma manuale

## 🔍 Monitoraggio

### Log Console
```
🔄 Creating staging translations for article 123 (all)
✅ Synced article 123 translation for en
🚀 Synchronized 5 translations from staging to production
```

### UI Indicators
- 🏗️ **Staging**: Traduzioni in preparazione
- 🚀 **Production**: Traduzioni attive
- ⏳ **Loading**: Operazioni in corso

## 🚨 Note Importanti

1. **Compatibilità**: Sistema retrocompatibile con script esistenti
2. **Performance**: Database separati per evitare conflitti
3. **Sicurezza**: Conferma manuale obbligatoria per sync
4. **Backup**: Staging non sostituisce backup di produzione

## 🤝 Workflow Consigliato

1. **Sviluppo**: Usa staging per testare nuove traduzioni
2. **Review**: Controlla qualità traduzioni in staging  
3. **Deploy**: Sincronizza solo traduzioni approvate
4. **Monitoraggio**: Verifica risultati in produzione 