import fs from 'fs';
import path from 'path';

// TUTTE LE 50 LINGUE SUPPORTATE - ESATTO COME IN languages.ts
const languages = [
  'af', 'am', 'ar', 'az', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 
  'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 
  'hu', 'hy', 'id', 'is', 'it', 'ja', 'ka', 'ko', 'lt', 'lv', 
  'mk', 'ms', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 
  'sv', 'sw', 'th', 'tl', 'tk', 'uk', 'ur', 'vi', 'zh', 'zh-tw'
];

// Funzione per generare XML sitemap
function generateSitemapXML(destinations, lang) {
  const baseUrl = 'https://thebestitaly.eu';
  const currentDate = '2024-01-01T00:00:00.000Z';
  
  const entries = [];
  
  destinations.forEach((destination) => {
    const translation = destination.translations?.find((t) => t.languages_code === lang);
    
    if (translation?.slug_permalink && destination.type) {
      let url = '';
      
      if (destination.type === 'region') {
        url = `${baseUrl}/${lang}/${translation.slug_permalink}`;
        
      } else if (destination.type === 'province') {
        const regionTranslation = destination.region_id?.translations?.find((t) => t.languages_code === lang);
        if (regionTranslation?.slug_permalink) {
          url = `${baseUrl}/${lang}/${regionTranslation.slug_permalink}/${translation.slug_permalink}`;
        }
        
      } else if (destination.type === 'municipality') {
        const regionTranslation = destination.region_id?.translations?.find((t) => t.languages_code === lang);
        const provinceTranslation = destination.province_id?.translations?.find((t) => t.languages_code === lang);
        
        if (regionTranslation?.slug_permalink && provinceTranslation?.slug_permalink) {
          url = `${baseUrl}/${lang}/${regionTranslation.slug_permalink}/${provinceTranslation.slug_permalink}/${translation.slug_permalink}`;
        }
      }

      if (url && url.length < 2000) {
        entries.push({
          url,
          lastModified: currentDate,
          changeFrequency: destination.type === 'region' ? 'yearly' : 'never',
          priority: destination.type === 'region' ? 0.8 : destination.type === 'province' ? 0.7 : 0.6
        });
      }
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return { sitemap, count: entries.length };
}

async function fetchDestinations() {
  console.log('🔄 Fetching destinations from Directus...');
  
  const directusUrl = 'https://thebestitaly.eu/api/directus/items/destinations';
  const allDestinations = [];
  let offset = 0;
  const batchSize = 500; // Ridotto da 8000 a 500
  let hasMore = true;
  
  while (hasMore && offset < 8000) {
    try {
      console.log(`📦 Fetching batch ${Math.floor(offset / batchSize) + 1}: ${offset}-${offset + batchSize}`);
      
      const url = `${directusUrl}?fields=type,region_id.translations.slug_permalink,region_id.translations.languages_code,province_id.translations.slug_permalink,province_id.translations.languages_code,translations.slug_permalink,translations.languages_code&limit=${batchSize}&offset=${offset}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status} for batch ${offset}`);
        break;
      }
      
      const data = await response.json();
      const batch = data.data || [];
      
      if (batch.length === 0) {
        hasMore = false;
      } else {
        allDestinations.push(...batch);
        offset += batchSize;
        console.log(`✅ Batch loaded: ${batch.length} destinations (total: ${allDestinations.length})`);
        
        if (batch.length < batchSize) {
          hasMore = false;
        }
        
        // Pausa tra batch per evitare sovraccarico
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ Error in batch ${offset}:`, error.message);
      break;
    }
  }
  
  return allDestinations;
}

async function generateDestinationsSitemaps() {
  console.log('🚀 Starting destinations sitemap generation for ALL 50 LANGUAGES...');
  
  const outputDir = path.join(process.cwd(), '../public/sitemaps');
  
  // Crea directory se non esiste
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Fetch destinations una volta sola
  const allDestinations = await fetchDestinations();
  console.log(`📍 Fetched ${allDestinations.length} destinations`);
  
  if (allDestinations.length === 0) {
    console.error('❌ No destinations found, aborting...');
    return;
  }
  
  let totalUrls = 0;
  
  // Genera sitemap per ogni lingua
  for (const lang of languages) {
    try {
      console.log(`📄 Generating destinations sitemap for ${lang}... (${languages.indexOf(lang) + 1}/${languages.length})`);
      
      // Filtra destinazioni per lingua
      const langDestinations = allDestinations.filter(dest => 
        dest.translations?.some(t => t.languages_code === lang)
      );
      
      const { sitemap, count } = generateSitemapXML(langDestinations, lang);
      const filename = path.join(outputDir, `destinations-${lang}.xml`);
      
      fs.writeFileSync(filename, sitemap);
      totalUrls += count;
      console.log(`✅ Generated: destinations-${lang}.xml (${count} URLs)`);
      
    } catch (error) {
      console.error(`❌ Error generating ${lang}:`, error.message);
    }
  }
  
  console.log(`🎉 Destinations sitemap generation completed!`);
  console.log(`📊 Total: ${languages.length} files, ${totalUrls} URLs`);
}

// Esegui se chiamato direttamente
generateDestinationsSitemaps();

// Funzione per generare solo una lingua specifica
export async function generateSingleLanguage(lang) {
  console.log(`🚀 Generating destinations sitemap for ${lang}...`);
  
  const outputDir = path.join(process.cwd(), '../public/sitemaps');
  
  // Fetch destinations
  const allDestinations = await fetchDestinations();
  console.log(`📍 Fetched ${allDestinations.length} destinations`);
  
  if (allDestinations.length === 0) {
    console.error('❌ No destinations found');
    return;
  }
  
  // Filtra destinazioni per lingua
  const langDestinations = allDestinations.filter(dest => 
    dest.translations?.some(t => t.languages_code === lang)
  );
  
  const { sitemap, count } = generateSitemapXML(langDestinations, lang);
  const filename = path.join(outputDir, `destinations-${lang}.xml`);
  
  fs.writeFileSync(filename, sitemap);
  console.log(`✅ Generated: destinations-${lang}.xml (${count} URLs)`);
} 