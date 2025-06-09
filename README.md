# 🇮🇹 TheBest Italy - Tourism Platform

Piattaforma di turismo multilingue per promuovere l'Italia con sistema di gestione contenuti avanzato e traduzioni automatiche.

## ✨ Funzionalità Principali

- 🌍 **50 lingue supportate** con traduzioni automatiche AI
- 📝 **Area riservata** per gestione articoli, aziende e destinazioni  
- 🖼️ **Upload immagini** con integrazione Directus
- 🔄 **Traduzioni in tempo reale** con OpenAI GPT-4
- 📱 **Design responsive** ottimizzato per mobile
- 🚀 **Performance elevate** con Next.js 15

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Directus CMS
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4 per traduzioni
- **Deploy:** Vercel + Railway

## 🚀 Quick Start

### 1. Clone del Repository

```bash
git clone https://github.com/yourusername/thebestitaly-next-final
cd thebestitaly-next-final
```

### 2. Installazione Dipendenze

```bash
npm install
```

### 3. Configurazione Environment

```bash
# Copia il file di esempio
cp .env.example .env.local

# Modifica .env.local con i tuoi valori:
# - NEXT_PUBLIC_DIRECTUS_URL
# - DIRECTUS_TOKEN  
# - OPENAI_API_KEY
```

### 4. Avvio Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📚 API Endpoints

### Traduzioni Articoli
- `POST /api/translate-articles/[id]` - Traduce articolo completo
- `POST /api/translate-articles/[id]/field` - Traduce singolo campo
- `DELETE /api/translate-articles/[id]/delete-all` - Elimina tutte le traduzioni

### Traduzioni Aziende
- `POST /api/translate-companies/[id]` - Traduce azienda completa
- `DELETE /api/translate-companies/[id]/delete-all` - Elimina traduzioni azienda

### Traduzioni Destinazioni
- `POST /api/translate-destinations/[id]` - Traduce destinazione completa

## 🎯 Area Riservata

Accedi a `/it/reserved` per:

- ✏️ **Gestire articoli** - Modifica, traduci, pubblica
- 🏢 **Gestire aziende** - Informazioni e contenuti business  
- 🗺️ **Gestire destinazioni** - Luoghi e attrazioni turistiche
- 🖼️ **Upload immagini** - Gestione media con Directus
- 🌍 **Traduzioni AI** - Sistema automatico multi-lingua

## 🌐 Lingue Supportate

Il sistema supporta 50 lingue tra cui:
EN, FR, ES, PT, DE, NL, RO, SV, PL, VI, ID, EL, UK, RU, BN, ZH, HI, AR, FA, UR, JA, KO, AM, CS, DA, FI, AF, HR, BG, SK, SL, SR, TH, MS, TL, HE, CA, ET, LV, LT, MK, AZ, KA, HY, IS, SW, ZH-TW

## 📦 Deploy

### Vercel (Frontend)
```bash
# Collega repository GitHub a Vercel
# Configura environment variables
# Deploy automatico ad ogni push
```

### Railway (Backend/Directus)
```bash
# Template Directus pronto
# Database PostgreSQL incluso  
# SSL e backup automatici
```

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 🆘 Supporto

Per supporto, apri un issue su GitHub o contatta il team sviluppo.

---

⭐ **Ricordati di dare una stella al repository se ti è stato utile!**
