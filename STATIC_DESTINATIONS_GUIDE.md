# 🚀 Sistema Cache Statico per Destinazioni

## Panoramica

Il sistema di cache statico per destinazioni ottimizza drasticamente le performance per i dati delle destinazioni (regioni, province, comuni) che sono essenzialmente statici nel tempo.

### Vantaggi del Sistema
- **Performance Ultra-Rapida**: Dati serviti direttamente dal file system
- **Riduzione Carico Database**: Meno query a Directus
- **Cache Resiliente**: Fallback automatico alle API tradizionali
- **Gestione Intelligente**: TTL lunghi con invalidazione controllata

## Architettura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Component     │    │   Static Cache   │    │   Directus API  │
│  (DestSidebar)  │────│   (File System)  │────│   (Fallback)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌──────────────────┐
                    │   Redis Cache    │
                    │  (30-60 giorni)  │
                    └──────────────────┘
```

## File e Componenti

### Core Files
- `src/lib/static-destinations.ts` - Logica principale del cache statico
- `src/components/destinations/DestinationSidebar.tsx` - Componente ottimizzato
- `scripts/generate-static-destinations.js` - Script di generazione
- `src/app/api/admin/static-cache/route.ts` - API endpoint di gestione

### Dati Generati
I dati statici vengono salvati in:
```
.next/static-destinations/
├── destinations-it-1.0.json
├── destinations-en-1.0.json
├── destinations-fr-1.0.json
├── destinations-de-1.0.json
└── destinations-es-1.0.json
```

## Struttura Dati

```typescript
interface StaticDestinationData {
  version: string;
  timestamp: number;
  data: {
    regionProvinces: Record<string, Record<string, Destination[]>>;
    provinceMunicipalities: Record<string, Record<string, Destination[]>>;
    destinationDetails: Record<string, Record<string, Destination>>;
  };
}
```

## Configurazione Cache

### TTL Settings (src/lib/redis-cache.ts)
```typescript
CACHE_DURATIONS = {
  DESTINATIONS: 60 * 60 * 24 * 30,        // 30 giorni
  RELATED_DESTINATIONS: 60 * 60 * 24 * 14, // 14 giorni
  MENU_DESTINATIONS: 60 * 60 * 24 * 30,    // 30 giorni
}
```

### React Query Settings (DestinationSidebar.tsx)
```typescript
staleTime: 1000 * 60 * 60 * 24 * 30,  // 30 giorni
gcTime: 1000 * 60 * 60 * 24 * 60,     // 60 giorni
```

## Utilizzo

### Comandi NPM

```bash
# Genera dati statici per tutte le lingue
npm run static:generate

# Genera solo per italiano
npm run static:generate:it

# Verifica stato del cache
npm run static:status

# Mostra aiuto
npm run static:help
```

### Script Manuale
```bash
# Genera dati statici
node scripts/generate-static-destinations.js generate

# Genera per lingua specifica
node scripts/generate-static-destinations.js generate it

# Verifica stato
node scripts/generate-static-destinations.js status
```

### API Endpoints

#### GET /api/admin/static-cache
Ottieni lo stato del cache statico
```json
{
  "success": true,
  "cache_status": {
    "it": { "exists": true, "valid": true, "timestamp": 1703123456789 },
    "en": { "exists": true, "valid": true, "timestamp": 1703123456789 }
  }
}
```

#### POST /api/admin/static-cache
Genera o invalida cache
```json
// Genera dati statici
{
  "action": "generate",
  "languages": ["it", "en"]
}

// Invalida cache
{
  "action": "invalidate",
  "languages": ["it"]
}
```

#### DELETE /api/admin/static-cache
Invalida tutto il cache statico

## Funzioni API Ottimizzate

### getProvincesForRegion(regionId, lang)
```typescript
// ULTRA-VELOCE: Serve da cache statico se disponibile
const provinces = await getProvincesForRegion('1', 'it');
```

### getMunicipalitiesForProvince(provinceId, lang)
```typescript
// ULTRA-VELOCE: Serve da cache statico se disponibile
const municipalities = await getMunicipalitiesForProvince('1', 'it');
```

### getDestinationDetails(destinationId, lang)
```typescript
// ULTRA-VELOCE: Serve da cache statico se disponibile
const destination = await getDestinationDetails('1', 'it');
```

## Performance Comparison

### Prima (API tradizionale)
```
🐌 Query Database: ~300-800ms
🐌 Network Latency: ~50-200ms
🐌 Redis Miss: Richiesta completa ogni volta
Total: ~350-1000ms per sidebar
```

### Dopo (Cache Statico)
```
⚡ File System Read: ~1-5ms
⚡ Cache Hit: Dati immediatamente disponibili
⚡ No Network: Tutto locale
Total: ~1-10ms per sidebar (100x più veloce!)
```

## Workflow di Aggiornamento

### Quando Rigenerare i Dati
1. **Manualmente**: Quando sai che i dati sono cambiati
2. **Periodicamente**: Script cron settimanale/mensile
3. **On-Demand**: Tramite API admin quando necessario

### Processo di Rigenerazione
1. Invalida cache esistente (opzionale)
2. Fetch fresh data da Directus
3. Genera nuovi file statici
4. Aggiorna timestamp e versione
5. I componenti usano automaticamente i nuovi dati

## Fallback e Resilienza

### Fallback Automatico
Se il cache statico non è disponibile:
1. Usa Redis cache (se disponibile)
2. Usa memory cache (in-process)
3. Query diretta a Directus (ultimo resort)

### Gestione Errori
- File corrotti: Rigenerazione automatica
- Network issues: Uso cache locale
- Directus down: Serve da cache fino a recovery

## Monitoraggio

### Log Messages
```
🚀 STATIC HIT: Province per regione 1 (it)    // Cache hit
📡 STATIC MISS: Province per regione 1 (it)   // Cache miss -> API
⚠️ Cache statico scaduto per it               // Needs refresh
```

### Metriche Importanti
- **Hit Rate**: % di richieste servite da cache statico
- **Miss Rate**: % di richieste che usano API fallback  
- **Freshness**: Età del cache statico
- **Size**: Dimensione file statici

## Best Practices

### Deployment
1. Genera dati statici durante build (opzionale)
2. Deploy con dati pre-generati per performance immediate
3. Setup processo di refresh periodico

### Development
```bash
# Durante sviluppo, genera cache locale
npm run static:generate:it

# Verifica stato prima del deploy
npm run static:status
```

### Production
```bash
# Setup cron job per refresh settimanale
0 2 * * 0 cd /app && npm run static:generate

# Monitor status via API
curl https://yoursite.com/api/admin/static-cache
```

## Troubleshooting

### Cache Non Funziona
1. Verifica permessi directory `.next/static-destinations/`
2. Controlla log per errori di generazione
3. Verifica versione cache vs sistema

### Performance Non Migliorata
1. Controlla log per hit rate
2. Verifica che i componenti usino funzioni statiche
3. Monitor network requests in DevTools

### Dati Obsoleti
1. Invalida cache: `DELETE /api/admin/static-cache`
2. Rigenera: `POST /api/admin/static-cache`
3. Verifica timestamp nei file generati

## Estensioni Future

### Possibili Miglioramenti
- Build-time static generation in Next.js
- CDN distribution per dati statici
- Compression dei file JSON
- Diff-based updates invece di full refresh
- Background refresh process

### Integration Points
- CI/CD pipeline per auto-refresh
- Admin panel per gestione cache
- Metrics dashboard per monitoring
- Webhook da Directus per auto-invalidation 