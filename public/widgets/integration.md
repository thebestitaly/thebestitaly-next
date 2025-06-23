# Widget TheBestItaly - Guida Integrazione

## 🎯 Come Integrare il Widget su Siti Esterni

Il widget è ora completamente funzionale e può essere integrato su qualsiasi sito web esterno.

### 📍 URL del Widget
```
https://tuodominio.com/api/widget/example.html
```

### 🔧 Integrazione in un iframe
```html
<iframe 
    src="https://tuodominio.com/api/widget/example.html" 
    width="100%" 
    height="600" 
    frameborder="0"
    title="Widget TheBestItaly">
</iframe>
```

### 🎨 Personalizzazione CSS
Il widget può essere stilizzato tramite CSS personalizzato:

```css
/* Rimuovi bordi iframe */
iframe[title="Widget TheBestItaly"] {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Container responsive */
.widget-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
```

### 📊 Funzionalità Disponibili

#### ✅ Ricerca Reale
- **Database**: Collegato a Directus
- **Tipi**: Articoli, Destinazioni, Aziende
- **Lingue**: 50 lingue supportate
- **Cache**: 5 minuti per performance ottimali

#### ✅ URL Esterni
Ogni risultato include:
- `slug_permalink`: Slug dell'elemento
- `external_url`: URL completo per accesso esterno
- `uuid`: **ID univoco dell'elemento (raccomandato per integrazioni)**
- `id`: ID numerico (deprecato ma ancora supportato)

#### ✅ Responsive Design
- **Small**: 320px, compatto
- **Medium**: 384px, standard
- **Full**: 100% width, per grandi schermi

### 🔗 API Endpoints

#### POST `/api/widget/search`
Ricerca nel database:

```json
{
  "type": "articolo|destinazione|azienda",
  "query": "termini di ricerca",
  "language": "it",
  "limit": 5
}
```

#### GET `/api/widget/search` (Nuovo - UUID)
Recupera contenuto specifico tramite UUID:

```
GET /api/widget/search?type=destinazione&uuid=550e8400-e29b-41d4-a716-446655440000&language=it
```

**Risposta:**
```json
[
  {
    "id": "123",
    "uuid": "uuid-123",
    "title": "Titolo Contenuto",
    "description": "Descrizione...",
    "image": "https://...",
    "type": "azienda",
    "language": "it",
    "location": "Milano, Italia",
    "category": "Fashion",
    "slug_permalink": "prada-spa",
    "external_url": "https://thebestitaly.eu/it/aziende/lombardia/milano/prada-spa"
  }
]
```

### 🚀 Esempi di Integrazione

#### WordPress
```php
// functions.php
function add_thebestitaly_widget() {
    return '<iframe src="https://tuodominio.com/api/widget/example.html" width="100%" height="600" frameborder="0"></iframe>';
}
add_shortcode('thebestitaly_widget', 'add_thebestitaly_widget');

// Uso: [thebestitaly_widget]
```

#### React/Next.js
```jsx
import React from 'react';

const TheBestItalyWidget = ({ width = "100%", height = "600px" }) => {
  return (
    <iframe
      src="https://tuodominio.com/api/widget/example.html"
      width={width}
      height={height}
      frameBorder="0"
      title="Widget TheBestItaly"
      style={{ borderRadius: '12px' }}
    />
  );
};

export default TheBestItalyWidget;
```

#### HTML Statico
```html
<!DOCTYPE html>
<html>
<head>
    <title>Il Mio Sito con Widget TheBestItaly</title>
    <style>
        .widget-container {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }
        .widget-frame {
            width: 100%;
            height: 600px;
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <h1>Scopri l'Italia con TheBestItaly</h1>
        <iframe 
            class="widget-frame"
            src="https://tuodominio.com/api/widget/example.html"
            title="Widget TheBestItaly">
        </iframe>
    </div>
</body>
</html>
```

### 📱 Responsive Breakpoints

Il widget si adatta automaticamente:

- **Mobile** (< 480px): Layout compatto
- **Tablet** (480px - 768px): Layout medium
- **Desktop** (> 768px): Layout full

### 🔒 Sicurezza

#### Headers di Sicurezza
L'API include:
- `Cache-Control`: Cache ottimizzata
- CORS: Configurato per domini esterni
- Rate Limiting: Protezione da abusi

#### Dominio Whitelist
Per maggiore sicurezza, aggiungi controllo domini:

```typescript
// route.ts
const allowedDomains = [
  'https://miosito.com',
  'https://partner.com'
];

const origin = request.headers.get('origin');
if (!allowedDomains.includes(origin)) {
  return new NextResponse('Unauthorized', { status: 403 });
}
```

### 📈 Analytics

#### Eventi Tracciati
Il widget traccia automaticamente:
- Ricerche effettuate
- Contenuti selezionati
- Link esterni aperti
- Cambi di lingua

#### Google Analytics
```javascript
// Aggiungi in <head>
gtag('event', 'widget_search', {
  'search_term': term,
  'content_type': type,
  'language': language
});
```

### 🛠️ Troubleshooting

#### Problemi Comuni

**Il widget non carica:**
- Verifica l'URL del dominio
- Controlla i CORS headers
- Verifica che Directus sia raggiungibile

**Ricerca non funziona:**
- Controlla i log del server
- Verifica la connessione a Directus
- Controlla le variabili d'ambiente

**Dropdown lingue non si apre:**
- Verifica che JavaScript sia abilitato
- Controlla la console per errori
- Verifica che Tailwind CSS sia caricato

### 📞 Supporto

Per problemi di integrazione:
1. Controlla i log della console browser
2. Verifica i log del server
3. Testa l'API `/api/widget/search` direttamente

Il widget è ora pronto per essere utilizzato su qualsiasi sito esterno! 🚀 