export const getDirectusImageUrl = (
  assetId: string, 
  options?: {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'inside' | 'outside';
    quality?: number;
  }
) => {
  if (!assetId) return '';
  
  // 🔧 HANDLE BOTH ASSET IDs AND FULL URLs
  let actualAssetId = assetId;
  
  // If it's already a full URL (starts with http or contains cdn.thebestitaly.eu)
  if (assetId.startsWith('http') || assetId.includes('cdn.thebestitaly.eu')) {
    // Extract asset ID from various URL formats
    const urlPatterns = [
      /\/assets\/([a-f0-9-]+)/i,  // Standard Directus assets URL
      /assets\/([a-f0-9-]+)/i,    // Without leading slash
    ];
    
    for (const pattern of urlPatterns) {
      const match = assetId.match(pattern);
      if (match && match[1]) {
        actualAssetId = match[1];
        break;
      }
    }
    
    // If we couldn't extract an ID, return the original URL
    if (actualAssetId === assetId) {
      console.warn('Could not extract asset ID from URL:', assetId);
      return assetId; // Return the original URL as-is
    }
  }
  
  // ✅ USE CDN DIRECTLY: Point directly to cdn.thebestitaly.eu
  const baseUrl = `https://cdn.thebestitaly.eu/assets/${actualAssetId}`;
  
  if (!options) return baseUrl;
  
  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.fit) params.append('fit', options.fit);
  if (options.quality) params.append('quality', options.quality.toString());
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// 🚨 EMERGENCY: Optimized image presets to reduce traffic
export const getOptimizedImageUrl = (
  assetId: string,
  preset: 'MICRO' | 'THUMBNAIL' | 'CARD' | 'HERO_MOBILE' | 'HERO_DESKTOP' = 'CARD'
) => {
  if (!assetId) return '';
  
  const presets = {
    MICRO: { width: 48, height: 48, quality: 45 },
    THUMBNAIL: { width: 150, height: 120, quality: 55 },
    CARD: { width: 300, height: 200, quality: 60 },
    HERO_MOBILE: { width: 800, height: 500, quality: 75 },
    HERO_DESKTOP: { width: 980, height: 560, quality: 80 }
  };
  
  return getDirectusImageUrl(assetId, { ...presets[preset], fit: 'cover' });
};

// Mappatura completa delle bandiere disponibili su Directus
// Tutte le 50 bandiere caricate nella cartella "flags"
const FLAGS_MAPPING: Record<string, string> = {
  'af': '387f89db-8ca1-478d-a77e-f6c2481627ba', // Afrikaans
  'am': 'f4ea327a-9462-491c-86ac-3b04d73e173a', // Amarico
  'ar': '442c2c38-35c4-4079-9e06-414333dd8ea8', // Arabo
  'az': 'f7794474-d640-4d07-b3a0-de18c80c0bfb', // Azerbaigiano
  'bg': 'ca00dfb5-9d82-4f02-89fc-39c6e9ccb47b', // Bulgaro
  'bn': 'c4ccc1f2-2c77-4ea6-9a3b-7fae54538243', // Bengalese
  'ca': 'ec6fd2f5-c18d-4a07-a05f-ff08eb1b44c8', // Catalano
  'cs': '0b05bcc3-738e-4431-bc3e-777b1e6e6901', // Ceco
  'da': '81cca1ee-f204-412d-a8f6-08964c3af3e9', // Danese
  'de': 'ee3ffc10-19ec-46d2-9a46-33c33d30d19e', // Tedesco
  'el': 'fc6c2f0a-4681-4ad2-bc4b-911a1336a1ba', // Greco
  'en': '1172f24b-9c97-4cd8-a333-8d8c38a546a7', // Inglese
  'es': 'd800d8fd-ee24-4a5f-a47e-e1ee8a1284be', // Spagnolo
  'et': 'd579a65b-215c-4c5f-bcc7-cb639e0f22c2', // Estone
  'fa': '3feea98d-b2b3-4bb3-8fa5-a08fde56e876', // Persiano/Farsi
  'fi': '4b254dc4-a0ce-418a-bc55-c2f31c6ac0a7', // Finlandese
  'fr': '191604e9-f28b-47cc-bbf5-90b81967ea05', // Francese
  'he': '8c36e7fc-e5c5-459b-b9ca-a59e43029a2b', // Ebraico
  'hi': '857427b6-19fd-411c-a99e-b74f849e2abb', // Hindi
  'hr': '27e4651c-f0f3-4605-b0a8-a913bc41dd81', // Croato
  'hu': '8bdd952e-23ba-488e-b7f3-2c7f47d12dad', // Ungherese
  'hy': '1abf0d83-bb21-4717-9b60-c4bf8fc94859', // Armeno
  'id': '294cfec4-8921-45a2-befd-07e6e1dbc452', // Indonesiano
  'is': '9b35d099-2e72-4390-a158-f92085dc823f', // Islandese
  'it': '29fce2a3-35d3-4f17-be36-c1784088dceb', // Italiano
  'ja': 'bb8a3d79-82b1-437d-8e4c-b67588dc3b6e', // Giapponese
  'ka': '7c54e3f6-e0a3-41a9-b05e-b34c02dc6be5', // Georgiano
  'ko': 'e1afe581-0b0f-442c-a6aa-8886ab66c4db', // Coreano
  'lt': 'dd0c739e-492d-4bf2-b1e3-3b2140cc26d4', // Lituano
  'lv': '6649d18c-2c50-4bb8-bb6d-96d56bf1da61', // Lettone
  'mk': '3267e53a-e03d-415c-804e-af1c62381c43', // Macedone
  'ms': '72f1f11e-d804-43bd-b819-23899574fbd4', // Malese
  'nl': 'cadac93e-8732-4329-9f97-99ed4c5bc145', // Olandese
  'pl': '10f5adcc-6106-4e4e-88ad-a70ae920e877', // Polacco
  'pt': '69fdd861-54f0-4a39-80c9-672bd15cf645', // Portoghese
  'ro': '26e9617a-7016-4211-aaa0-0f16168e9924', // Rumeno
  'ru': '342cb55d-0d8b-4781-a359-a0602f327b6d', // Russo
  'sk': 'fb0f97fd-f320-4e96-b2c0-c6a97c606286', // Slovacco
  'sl': '5ed7bb32-1b33-4075-b5e1-d679a020fd30', // Sloveno
  'sr': 'a4803848-4177-41d1-896b-721a0b0f3305', // Serbo
  'sv': 'f265d407-df83-4bb9-a28a-d7574dd781c5', // Svedese
  'sw': 'ef1706e9-86d5-404e-9194-75f047cabada', // Swahili
  'th': 'e2732153-9e41-46b6-bb3b-ef877623df59', // Tailandese
  'tk': 'be57a60e-c509-4087-8b82-490f93f2af58', // Turkmeno
  'tl': 'd355a2dc-17a0-4fcb-8fde-6ff885c66d12', // Filippino (Tagalog)
  'uk': '7497b67a-11fc-45c0-9204-4c56a4d682f1', // Ucraino
  'ur': '35392828-4017-493d-a6ce-7092fe3b262b', // Urdu
  'vi': '2e5623c1-c476-4406-96eb-b2b4a43623be', // Vietnamita
  'zh': '11fad2c3-272f-46f3-8fa3-ee39e1c1b85c', // Cinese semplificato
  'zh-tw': 'b04fc1ba-05b8-4771-923c-a449c1d5a7a7', // Cinese tradizionale
};

/**
 * Genera l'URL CDN per le immagini delle bandiere da Directus
 * @param languageCode - Il codice della lingua (es: 'it', 'en', 'fr')
 * @returns URL completo dell'immagine della bandiera su CDN
 */
export function getFlagImageUrl(languageCode: string): string {
  // Cerca l'UUID per il codice lingua
  const uuid = FLAGS_MAPPING[languageCode];
  
  if (uuid) {
    return `https://cdn.thebestitaly.eu/assets/${uuid}`;
  }
  
  // Fallback all'immagine locale se non trovata su Directus
  return `/images/flags/${languageCode}.svg`;
}