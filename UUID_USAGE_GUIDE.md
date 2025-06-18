# 🎯 Guida Utilizzo UUID - TheBestItaly

Ora che hai aggiunto UUID a tutte le collections, ecco come utilizzarli strategicamente per **evitare di esporre ID numerici** nelle query e URL pubblici.

## 📊 **Situazione Attuale**

### ✅ **Collections con UUID:**
- `articles.uuid_id`
- `companies.uuid_id` 
- `categorias.uuid_id`
- `destinations.uuid_id`

### 🎯 **Strategia d'uso:**
- **ID numerici**: Collegamenti interni, performance critiche
- **UUID**: API pubbliche, URL, riferimenti esterni

## 🔄 **Come Sostituire le Query con ID Numerici**

### **1. URL con UUID invece di Slug**

**Prima (espone pattern prevedibili):**
```
/magazine/guida-ristoranti-italia    ← Slug prevedibile
/poi/azienda-esempio                 ← Slug prevedibile
```

**Dopo (sicuro con UUID):**
```
/magazine/uuid/a1b2c3d4-e5f6-7890-abcd-ef1234567890    ← Imprevedibile
/poi/uuid/b2c3d4e5-f6g7-8901-bcde-f21234567891        ← Sicuro
```

### **2. API Response senza ID numerici**

**Prima (espone ID interni):**
```json
{
  "id": "123",
  "title": "Articolo",
  "category_id": {"id": "5"}, 
  "destination_id": "89"
}
```

**Dopo (solo UUID pubblici):**
```json
{
  "uuid_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Articolo", 
  "category_uuid": "b2c3d4e5-f6g7-8901-bcde-f21234567891",
  "destination_uuid": "c3d4e5f6-g7h8-9012-cdef-321234567892"
}
```

## 🛠️ **Implementazione Pratica**

### **1. Nuove Route UUID**

Crea route alternative che usano UUID:

```typescript
// app/[lang]/magazine/uuid/[uuid]/page.tsx
export default async function MagazineUUIDPage({ params }: { 
  params: { lang: string; uuid: string } 
}) {
  const article = await directusClient.getArticleByUUID(params.uuid, params.lang);
  // ... resto uguale
}

// app/[lang]/poi/uuid/[uuid]/page.tsx  
export default async function PoiUUIDPage({ params }: {
  params: { lang: string; uuid: string }
}) {
  const company = await directusClient.getCompanyByUUID(params.uuid, params.lang);
  // ... resto uguale
}
```

### **2. API Endpoints UUID**

```typescript
// app/api/articles/uuid/[uuid]/route.ts
export async function GET(request: Request, { params }: { params: { uuid: string } }) {
  const article = await directusClient.getArticleByUUID(params.uuid, 'en');
  
  // Rimuovi ID numerici dalla response
  const publicArticle = {
    uuid_id: article.uuid_id,
    title: article.translations[0]?.titolo_articolo,
    category_uuid: article.category_id?.uuid_id,
    destination_uuid: article.destination_uuid, 
    // NO: id, category_id.id, destination_id
  };
  
  return Response.json(publicArticle);
}
```

### **3. Components con UUID**

Aggiorna i componenti per supportare UUID:

```typescript
// components/ArticleCard.tsx
interface ArticleCardProps {
  article: Article;
  useUUID?: boolean; // Flag per usare UUID o slug
}

export default function ArticleCard({ article, useUUID = false }: ArticleCardProps) {
  const href = useUUID 
    ? `/magazine/uuid/${article.uuid_id}`
    : `/magazine/${article.translations[0]?.slug_permalink}`;
    
  return (
    <Link href={href}>
      {/* ... contenuto */}
    </Link>
  );
}
```

## 🔐 **Vantaggi di Sicurezza**

### **Prima (ID numerici esposti):**
```
❌ /api/articles/1
❌ /api/articles/2  
❌ /api/articles/3
   → Enumerazione facile, pattern prevedibili
```

### **Dopo (UUID):**
```
✅ /api/articles/uuid/a1b2c3d4-e5f6-7890-abcd-ef1234567890
✅ /api/articles/uuid/b2c3d4e5-f6g7-8901-bcde-f21234567891
   → Impossibile da enumerare, sicuro
```

## 📈 **Strategia di Migrazione Graduale**

### **Fase 1: Coesistenza (ATTUALE)**
```typescript
// Entrambi funzionano
await directusClient.getArticleBySlug(slug, lang);      // ← Esistente
await directusClient.getArticleByUUID(uuid, lang);     // ← Nuovo
```

### **Fase 2: URL Duali**
```typescript
// Supporta entrambi i formati
/magazine/articolo-slug                    // ← Slug tradizionale  
/magazine/uuid/a1b2c3d4-e5f6-7890-...    // ← UUID sicuro
```

### **Fase 3: API Solo UUID**
```typescript
// Solo UUID per nuove API
/api/v2/articles/uuid/[uuid]              // ← Solo UUID
/api/v1/articles/[slug]                   // ← Deprecato gradualmente
```

## 🎯 **Casi d'Uso Specifici**

### **Per API Pubbliche (USA UUID):**
- Link sharing
- API esterne
- Mobile app
- Syndication feeds

### **Per Performance Interne (USA ID numerici):**
- Join database
- Relazioni complesse
- Aggregazioni
- Report interni

## 🔧 **Helper Functions**

Crea utility per conversioni:

```typescript
// utils/uuid-helpers.ts
export async function getUUIDFromId(table: string, id: string): Promise<string | null> {
  // Converti ID numerico in UUID quando necessario
}

export async function getIdFromUUID(table: string, uuid: string): Promise<string | null> {
  // Converti UUID in ID numerico per performance interne
}

export function generatePublicURL(entity: Article | Company | Destination): string {
  // Genera URL pubblico con UUID
  return `/entity/uuid/${entity.uuid_id}`;
}
```

## 📋 **Checklist Implementazione**

- [ ] ✅ UUID aggiunti al database
- [ ] ✅ Interfacce TypeScript aggiornate  
- [ ] ✅ Funzioni `getByUUID()` create
- [ ] 🔄 Route UUID create
- [ ] 🔄 API endpoints UUID
- [ ] 🔄 Components aggiornati con flag UUID
- [ ] 🔄 URL pubblici migrati a UUID
- [ ] 🔄 Tests aggiornati

## 🚀 **Prossimo Step**

**Vuoi che iniziamo con un caso specifico?**

1. **Creare route UUID** per articles?
2. **API endpoints UUID** per companies? 
3. **Aggiornare components** per supportare entrambi?

**Dimmi quale preferisci e procediamo step by step!** 🎯 