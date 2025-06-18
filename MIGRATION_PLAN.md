# Piano di Migrazione da ID Numerici a UUID

## Situazione Attuale

### ✅ Già UUID (String)
- **Articles**: `id: string` 
- **Destinations**: `id: string`

### ❌ Da convertire a UUID
- **Companies**: `id: number` → `id: string`
- **Categories**: `id: number` → `id: string`

## Strategia di Migrazione

### 1. BACKUP COMPLETO
```bash
# Backup del database prima di iniziare
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. FASE 1: Preparazione Database (Directus)

#### A. Aggiungere nuove colonne UUID temporanee
```sql
-- Companies
ALTER TABLE companies ADD COLUMN uuid_temp UUID DEFAULT gen_random_uuid();
UPDATE companies SET uuid_temp = gen_random_uuid() WHERE uuid_temp IS NULL;

-- Categories  
ALTER TABLE categorias ADD COLUMN uuid_temp UUID DEFAULT gen_random_uuid();
UPDATE categorias SET uuid_temp = gen_random_uuid() WHERE uuid_temp IS NULL;

-- Creare indici per le nuove colonne
CREATE UNIQUE INDEX companies_uuid_temp_idx ON companies(uuid_temp);
CREATE UNIQUE INDEX categorias_uuid_temp_idx ON categorias(uuid_temp);
```

#### B. Aggiornare le foreign key con UUID temporanei
```sql
-- Companies: aggiornare company_id references
ALTER TABLE companies ADD COLUMN category_uuid_temp UUID;
UPDATE companies SET category_uuid_temp = (
    SELECT uuid_temp FROM categorias WHERE categorias.id = companies.category_id
);

-- Articles: aggiornare category_id references  
ALTER TABLE articles ADD COLUMN category_uuid_temp UUID;
UPDATE articles SET category_uuid_temp = (
    SELECT uuid_temp FROM categorias WHERE categorias.id = articles.category_id
);
```

### 3. FASE 2: Aggiornamento Codice

#### A. Aggiornare le interfacce TypeScript
```typescript
// In src/lib/directus.ts

export interface Company {
  id: string; // era number
  // ... resto invariato
  category_id: string; // era number
  destination_id: string; // era number (già string nelle destinations)
}

export interface Category {
  id: string; // era number
  // ... resto invariato
}
```

#### B. Aggiornare tutte le query e riferimenti nel codice
- Rimuovere `parseInt()` e `parseFloat()` per gli ID
- Aggiornare tutti i filtri da `{ _eq: number }` a `{ _eq: string }`
- Aggiornare le funzioni che manipolano ID numerici

### 4. FASE 3: Testing e Validazione

#### A. Test Environment
1. Creare ambiente di test con dati migrati
2. Testare tutte le funzionalità CRUD
3. Verificare che tutti i riferimenti funzionino

#### B. Validazione dati
```sql
-- Verificare che non ci siano orphan records
SELECT * FROM companies WHERE category_uuid_temp NOT IN (SELECT uuid_temp FROM categorias);
SELECT * FROM articles WHERE category_uuid_temp NOT IN (SELECT uuid_temp FROM categorias);
```

### 5. FASE 4: Migrazione Finale (Downtime necessario)

#### A. Rinominare le colonne
```sql
-- Companies
ALTER TABLE companies RENAME COLUMN id TO id_old;
ALTER TABLE companies RENAME COLUMN uuid_temp TO id;
ALTER TABLE companies RENAME COLUMN category_id TO category_id_old;
ALTER TABLE companies RENAME COLUMN category_uuid_temp TO category_id;

-- Categories
ALTER TABLE categorias RENAME COLUMN id TO id_old;
ALTER TABLE categorias RENAME COLUMN uuid_temp TO id;

-- Articles  
ALTER TABLE articles RENAME COLUMN category_id TO category_id_old;
ALTER TABLE articles RENAME COLUMN category_uuid_temp TO category_id;
```

#### B. Aggiornare Primary Keys e Foreign Keys
```sql
-- Rimuovere vecchi constraint
ALTER TABLE companies DROP CONSTRAINT companies_pkey;
ALTER TABLE categorias DROP CONSTRAINT categorias_pkey;

-- Creare nuovi primary keys
ALTER TABLE companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE categorias ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);

-- Ricreare foreign keys
ALTER TABLE companies ADD CONSTRAINT fk_companies_category 
    FOREIGN KEY (category_id) REFERENCES categorias(id);
ALTER TABLE articles ADD CONSTRAINT fk_articles_category 
    FOREIGN KEY (category_id) REFERENCES categorias(id);
```

### 6. FASE 5: Cleanup

#### A. Rimuovere colonne temporanee (dopo verifica completa)
```sql
ALTER TABLE companies DROP COLUMN id_old;
ALTER TABLE companies DROP COLUMN category_id_old;
ALTER TABLE categorias DROP COLUMN id_old;  
ALTER TABLE articles DROP COLUMN category_id_old;
```

## Rollback Plan

In caso di problemi:
```sql
-- Ripristinare dal backup
psql your_database < backup_file.sql

-- O rinominare le colonne al contrario se la migrazione è parziale
ALTER TABLE companies RENAME COLUMN id TO uuid_temp;
ALTER TABLE companies RENAME COLUMN id_old TO id;
-- etc...
```

## Checklist Pre-Migrazione

- [ ] Backup completo del database
- [ ] Ambiente di test preparato
- [ ] Codice aggiornato e testato
- [ ] Tutti i team informati del downtime
- [ ] Piano di rollback testato
- [ ] Monitoraggio preparato per post-migrazione

## Stima Tempi

- **Preparazione**: 2-3 giorni
- **Sviluppo codice**: 2-3 giorni  
- **Testing**: 1-2 giorni
- **Migrazione finale**: 2-4 ore (con downtime di ~30-60 minuti)

## Note Importanti

1. **Downtime**: La migrazione finale richiederà un breve downtime
2. **Testing**: Testare intensivamente prima della migrazione
3. **Backup**: Mantenere backup multipli durante il processo
4. **Monitoring**: Monitorare attentamente post-migrazione
5. **UUID Performance**: Gli UUID sono leggermente più lenti degli INT, ma la differenza è trascurabile per la maggior parte delle applicazioni 