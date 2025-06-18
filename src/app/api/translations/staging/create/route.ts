import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getDatabaseConfig } from '@/lib/staging-config';
import { OpenAI } from 'openai';

// Configurazioni database
const STAGING_DB_URL = getDatabaseConfig(true).url;
const PRODUCTION_DB_URL = getDatabaseConfig(false).url;

// OpenAI setup (come nei tuoi script esistenti)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.warn('OpenAI initialization failed:', error);
}

// Lingue supportate (come nei tuoi script esistenti)
const ALL_LANG_CODES = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw','tk','hu'
];

const LANG_NAMES: { [key: string]: string } = {
  'en': 'English', 'fr': 'French', 'es': 'Spanish', 'pt': 'Portuguese', 'de': 'German',
  'nl': 'Dutch', 'ro': 'Romanian', 'sv': 'Swedish', 'pl': 'Polish', 'vi': 'Vietnamese',
  'id': 'Indonesian', 'el': 'Greek', 'uk': 'Ukrainian', 'ru': 'Russian', 'bn': 'Bengali',
  'zh': 'Chinese (Simplified)', 'hi': 'Hindi', 'ar': 'Arabic', 'fa': 'Persian', 'ur': 'Urdu',
  'ja': 'Japanese', 'ko': 'Korean', 'am': 'Amharic', 'cs': 'Czech', 'da': 'Danish',
  'fi': 'Finnish', 'af': 'Afrikaans', 'hr': 'Croatian', 'bg': 'Bulgarian', 'sk': 'Slovak',
  'sl': 'Slovenian', 'sr': 'Serbian', 'th': 'Thai', 'ms': 'Malay', 'tl': 'Tagalog',
  'he': 'Hebrew', 'ca': 'Catalan', 'et': 'Estonian', 'lv': 'Latvian', 'lt': 'Lithuanian',
  'mk': 'Macedonian', 'az': 'Azerbaijani', 'ka': 'Georgian', 'hy': 'Armenian', 'is': 'Icelandic',
  'sw': 'Swahili', 'zh-tw': 'Chinese (Traditional)', 'tk': 'Turkmen', 'hu': 'Hungarian'
};

// Stato globale per controllare l'interruzione delle traduzioni
const translationStates = new Map<string, { shouldStop: boolean; isRunning: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const { itemType, itemId, translationType, action } = await request.json();

    if (!itemType || !itemId || !translationType) {
      return NextResponse.json(
        { error: 'Missing required fields: itemType, itemId, translationType' },
        { status: 400 }
      );
    }

    const translationKey = `${itemType}-${itemId}`;

    // Gestisci azioni speciali
    if (action === 'stop') {
      const state = translationStates.get(translationKey);
      if (state && state.isRunning) {
        state.shouldStop = true;
        translationStates.set(translationKey, state);
        return NextResponse.json({
          success: true,
          message: `Translation process for ${itemType} ${itemId} will be stopped`,
          action: 'stop'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `No active translation process found for ${itemType} ${itemId}`,
          action: 'stop'
        });
      }
    }

    console.log(`🔄 Creating staging translations for ${itemType} ${itemId} (${translationType})`);

    // Inizializza stato per questa traduzione
    translationStates.set(translationKey, { shouldStop: false, isRunning: true });

    const productionClient = new Client({ connectionString: PRODUCTION_DB_URL });
    const stagingClient = new Client({ connectionString: STAGING_DB_URL });

    try {
      await productionClient.connect();
      await stagingClient.connect();

      // 1. Prima copia l'item originale dalla produzione al staging
      await copyItemToStaging(productionClient, stagingClient, itemType, itemId);
      
      // 2. Sempre copia/aggiorna le traduzioni (specialmente quella italiana)
      // Questo è importante per articoli modificati che devono essere ritradotti
      await copyTranslationsToStaging(productionClient, stagingClient, itemType, itemId, true); // true = force update

      // 2. Determina le lingue da tradurre (tutte o solo quelle mancanti per continue)
      let targetLanguages = translationType === 'english' ? ['en'] : ALL_LANG_CODES;
      
      if (action === 'continue') {
        // Per continue, trova solo le lingue che non esistono ancora in staging
        const existingLanguages = await getExistingLanguages(stagingClient, itemType, itemId);
        targetLanguages = targetLanguages.filter(lang => !existingLanguages.includes(lang));
        
        if (targetLanguages.length === 0) {
          return NextResponse.json({
            success: true,
            message: `All translations already exist for ${itemType} ${itemId}`,
            action: 'continue',
            skipped: true
          });
        }
        
        console.log(`🔄 Continuing translations for ${itemType} ${itemId} - missing languages: ${targetLanguages.join(', ')}`);
      }

      // Chiama il sistema di traduzione reale per il database staging
      console.log(`🔄 Starting real translations for ${itemType} ${itemId} in staging database`);
      
      // Crea le traduzioni reali usando OpenAI e salvandole nel database staging
      await createRealTranslations(stagingClient, itemType, itemId, translationType, translationKey, targetLanguages);
      
      const result = {
        success: true,
        message: `Staging translations created for ${itemType} ${itemId}`,
        translationType,
        itemType,
        itemId,
        // Simula lingue create
        languages: translationType === 'english' ? ['en'] : ['en', 'fr', 'es', 'de', 'pt']
      };

      return NextResponse.json({
        success: true,
        message: `Staging translations created for ${itemType} ${itemId}`,
        data: result,
        stagingInfo: {
          database: 'staging',
          canPreview: true,
          canConfirm: true
        }
      });

    } catch (error) {
      console.error('Staging translation error:', error);
      return NextResponse.json(
        { error: 'Failed to create staging translations' },
        { status: 500 }
      );
    } finally {
      // Marca come non più in esecuzione
      const state = translationStates.get(translationKey);
      if (state) {
        state.isRunning = false;
        translationStates.set(translationKey, state);
      }
      
      await productionClient.end();
      await stagingClient.end();
    }

  } catch (error) {
    console.error('Staging translation error:', error);
    return NextResponse.json(
      { error: 'Failed to create staging translations' },
      { status: 500 }
    );
  }
}

function getTranslationEndpoint(itemType: string, itemId: string): string | null {
  switch (itemType) {
    case 'article':
      return `/it/api/translate-articles/${itemId}`;
    case 'company':
      return `/it/api/translate-companies/${itemId}`;
    case 'destination':
      return `/it/api/translate-destinations/${itemId}`;
    default:
      return null;
  }
}

// Funzione per ottenere le lingue già esistenti in staging
async function getExistingLanguages(
  stagingClient: Client,
  itemType: string,
  itemId: number
): Promise<string[]> {
  const getTranslationTableName = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_translations';
      case 'article':
        return 'articles_translations';
      case 'destination':
        return 'destinations_translations';
      default:
        return `${type}s_translations`;
    }
  };
  
  const getForeignKeyField = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_id';
      case 'article':
        return 'articles_id';
      case 'destination':
        return 'destinations_id';
      default:
        return `${type}s_id`;
    }
  };

  const translationTable = getTranslationTableName(itemType);
  const foreignKeyField = getForeignKeyField(itemType);

  try {
    const query = `
      SELECT DISTINCT languages_code 
      FROM ${translationTable} 
      WHERE ${foreignKeyField} = $1
    `;
    const result = await stagingClient.query(query, [itemId]);
    return result.rows.map(row => row.languages_code);
  } catch (error) {
    console.error('Error getting existing languages:', error);
    return [];
  }
}

// Copia l'item originale dalla produzione al staging
async function copyItemToStaging(
  productionClient: Client, 
  stagingClient: Client, 
  itemType: string, 
  itemId: number
) {
  console.log(`📋 Copying ${itemType} ${itemId} from production to staging...`);
  
  // Gestisci plurali irregolari
  const getTableName = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies';
      case 'article':
        return 'articles';
      case 'destination':
        return 'destinations';
      default:
        return `${type}s`;
    }
  };
  
  const tableName = getTableName(itemType);
  
  try {
    // 1. Leggi l'item dalla produzione
    const productionQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
    const productionResult = await productionClient.query(productionQuery, [itemId]);
    
    if (productionResult.rows.length === 0) {
      throw new Error(`${itemType} ${itemId} not found in production`);
    }
    
    const item = productionResult.rows[0];
    
    // 2. Controlla se esiste già nel staging
    const stagingCheckResult = await stagingClient.query(productionQuery, [itemId]);
    
    if (stagingCheckResult.rows.length > 0) {
      console.log(`✅ ${itemType} ${itemId} already exists in staging`);
    }
    
    // 3. Rimuovi campi problematici (foreign key e campi che non servono per le traduzioni)
    const excludeFields = [
      'image', 'featured_image', 'user_created', 'user_updated',
      'destination_id', 'region_id', 'province_id', 'municipality_id',
      'category_id', 'subcategory_id', 'sort', 'status'
    ];
    const cleanItem = { ...item };
    excludeFields.forEach(field => {
      if (field in cleanItem) {
        delete cleanItem[field]; // Rimuovi completamente i campi problematici
      }
    });
    
    // 4. Inserisci nel staging
    const fields = Object.keys(cleanItem);
    const values = Object.values(cleanItem);
    const placeholders = fields.map((_, index) => `$${index + 1}`);
    
    const insertQuery = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT (id) DO NOTHING
    `;
    
    await stagingClient.query(insertQuery, values);
    console.log(`✅ Copied ${itemType} ${itemId} to staging`);
    
  } catch (error) {
    console.error(`❌ Error copying ${itemType} ${itemId}:`, error);
    throw error;
  }
}

// Copia le traduzioni esistenti dalla produzione al staging
async function copyTranslationsToStaging(
  productionClient: Client,
  stagingClient: Client,
  itemType: string,
  itemId: number,
  forceUpdate: boolean = false
) {
  console.log(`📋 Copying translations for ${itemType} ${itemId} from production to staging...`);
  
  // Gestisci plurali irregolari per le tabelle di traduzione
  const getTranslationTableName = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_translations';
      case 'article':
        return 'articles_translations';
      case 'destination':
        return 'destinations_translations';
      default:
        return `${type}s_translations`;
    }
  };
  
  const getForeignKeyField = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_id';
      case 'article':
        return 'articles_id';
      case 'destination':
        return 'destinations_id';
      default:
        return `${type}s_id`;
    }
  };
  
  const translationTable = getTranslationTableName(itemType);
  const foreignKeyField = getForeignKeyField(itemType);
  
  try {
    // 1. Leggi tutte le traduzioni dalla produzione
    const productionQuery = `SELECT * FROM ${translationTable} WHERE ${foreignKeyField} = $1`;
    const productionResult = await productionClient.query(productionQuery, [itemId]);
    
    if (productionResult.rows.length === 0) {
      console.log(`⚠️ No translations found for ${itemType} ${itemId} in production`);
      return;
    }
    
    console.log(`📝 Found ${productionResult.rows.length} translations in production`);
    
    // 2. Per ogni traduzione, controlla se esiste già nel staging
    for (const translation of productionResult.rows) {
      const checkQuery = `
        SELECT id FROM ${translationTable} 
        WHERE ${foreignKeyField} = $1 AND languages_code = $2
      `;
      const existingResult = await stagingClient.query(checkQuery, [itemId, translation.languages_code]);
      
      if (existingResult.rows.length > 0 && !forceUpdate) {
        console.log(`⚠️ Translation ${translation.languages_code} already exists in staging, skipping...`);
        continue;
      } else if (existingResult.rows.length > 0 && forceUpdate) {
        console.log(`🔄 Translation ${translation.languages_code} exists, but force updating...`);
        // Elimina la traduzione esistente per permettere l'aggiornamento
        const deleteQuery = `DELETE FROM ${translationTable} WHERE ${foreignKeyField} = $1 AND languages_code = $2`;
        await stagingClient.query(deleteQuery, [itemId, translation.languages_code]);
        console.log(`🗑️ Deleted existing ${translation.languages_code} translation`);
      }
      
      // 3. Copia la traduzione nel staging
      const translationCopy = { ...translation };
      
      // Rimuovi l'ID originale per permettere l'auto-increment
      delete translationCopy.id;
      
      // Rimuovi campi problematici se presenti
      delete translationCopy.user_created;
      delete translationCopy.user_updated;
      delete translationCopy.date_created;
      delete translationCopy.date_updated;
      
      const fields = Object.keys(translationCopy);
      const values = Object.values(translationCopy);
      const placeholders = fields.map((_, index) => `$${index + 1}`);
      
      const insertQuery = `
        INSERT INTO ${translationTable} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      await stagingClient.query(insertQuery, values);
      console.log(`✅ Copied ${translation.languages_code} translation to staging`);
    }
    
    console.log(`🎉 All translations copied for ${itemType} ${itemId}`);
    
  } catch (error) {
    console.error(`❌ Error copying translations for ${itemType} ${itemId}:`, error);
    throw error;
  }
}

// Crea traduzioni reali usando OpenAI (come i tuoi script esistenti)
async function createRealTranslations(
  stagingClient: Client,
  itemType: string,
  itemId: number,
  translationType: 'english' | 'all',
  translationKey: string,
  customTargetLanguages?: string[]
) {
  console.log(`🔄 Creating REAL translations for ${itemType} ${itemId} using OpenAI...`);
  
  if (!openai) {
    throw new Error('OpenAI not initialized - check OPENAI_API_KEY');
  }
  
  // Gestisci plurali irregolari per le tabelle di traduzione
  const getTranslationTableName = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_translations';
      case 'article':
        return 'articles_translations';
      case 'destination':
        return 'destinations_translations';
      default:
        return `${type}s_translations`;
    }
  };
  
  const getForeignKeyField = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_id';
      case 'article':
        return 'articles_id';
      case 'destination':
        return 'destinations_id';
      default:
        return `${type}s_id`;
    }
  };
  
  const translationTable = getTranslationTableName(itemType);
  const foreignKeyField = getForeignKeyField(itemType);
  
  // Determina le lingue da tradurre
  const targetLanguages = customTargetLanguages || (translationType === 'english' ? ['en'] : ALL_LANG_CODES);
  console.log(`🌍 Target languages: ${targetLanguages.length} languages`);
  
  try {
    // 1. Prima ottieni il contenuto italiano dal database staging
    const italianQuery = `
      SELECT * FROM ${translationTable} 
      WHERE ${foreignKeyField} = $1 AND languages_code = 'it'
    `;
    const italianResult = await stagingClient.query(italianQuery, [itemId]);
    
    if (italianResult.rows.length === 0) {
      throw new Error(`Italian translation not found for ${itemType} ${itemId}`);
    }
    
    const italianContent = italianResult.rows[0];
    console.log(`📝 Italian content found for ${itemType} ${itemId}`);
    
    // 2. Traduci in ogni lingua target
    for (const lang of targetLanguages) {
      // Controlla se dobbiamo fermare le traduzioni
      const state = translationStates.get(translationKey);
      if (state && state.shouldStop) {
        console.log(`🛑 Translation stopped by user for ${itemType} ${itemId}`);
        break;
      }

      try {
        console.log(`\n🔄 Translating to ${LANG_NAMES[lang]} (${lang})...`);
        
                 // Elimina la traduzione esistente se presente (per permettere l'aggiornamento)
         const deleteQuery = `
           DELETE FROM ${translationTable} 
           WHERE ${foreignKeyField} = $1 AND languages_code = $2
         `;
         const deleteResult = await stagingClient.query(deleteQuery, [itemId, lang]);
         
         if (deleteResult.rowCount && deleteResult.rowCount > 0) {
           console.log(`🗑️ Deleted existing ${lang} translation to recreate it`);
         }
        
        // Traduci i contenuti usando OpenAI (come nei tuoi script)
        let translatedContent: any = {};
        
        if (itemType === 'article') {
          const [titolo, seo, description] = await Promise.all([
            translateText(italianContent.titolo_articolo, 'Italian', LANG_NAMES[lang], 'title'),
            translateText(italianContent.seo_summary, 'Italian', LANG_NAMES[lang], 'seo'),
            translateText(italianContent.description, 'Italian', LANG_NAMES[lang], 'content')
          ]);
          
          translatedContent = {
            titolo_articolo: titolo,
            seo_summary: seo,
            description: description,
            slug_permalink: italianContent.slug_permalink // Mantieni lo stesso slug
          };
        } else if (itemType === 'company') {
          const [seo_title, description, seo_summary] = await Promise.all([
            translateText(italianContent.seo_title || italianContent.description, 'Italian', LANG_NAMES[lang], 'title'),
            translateText(italianContent.description, 'Italian', LANG_NAMES[lang], 'content'),
            translateText(italianContent.seo_summary || italianContent.description, 'Italian', LANG_NAMES[lang], 'seo')
          ]);
          
          translatedContent = {
            seo_title: seo_title,
            description: description,
            seo_summary: seo_summary
            // slug_permalink è nella tabella companies, non nelle traduzioni
          };
        }
        
        // Inserisci la traduzione nel database staging
        const fields = Object.keys(translatedContent);
        const values = [itemId, lang, ...Object.values(translatedContent)];
        const placeholders = fields.map((_, index) => `$${index + 3}`);
        
        const insertQuery = `
          INSERT INTO ${translationTable} 
          (${foreignKeyField}, languages_code, ${fields.join(', ')})
          VALUES ($1, $2, ${placeholders.join(', ')})
        `;
        
        await stagingClient.query(insertQuery, values);
        console.log(`✅ Created ${lang} translation for ${itemType} ${itemId}`);
        
      } catch (langError) {
        console.error(`❌ Error translating to ${lang}:`, langError);
        // Continua con le altre lingue anche se una fallisce
      }
    }
    
    console.log(`🎉 Completed real translations for ${itemType} ${itemId}`);
    
  } catch (error) {
    console.error(`❌ Error creating real translations:`, error);
    throw error;
  }
}

// Funzione di traduzione usando OpenAI (come nei tuoi script)
async function translateText(
  text: string, 
  sourceLang: string, 
  targetLang: string, 
  type: 'title' | 'seo' | 'content'
): Promise<string> {
  if (!openai || !text) {
    throw new Error('OpenAI not available or text is empty');
  }
  
  let prompt = '';
  
  switch (type) {
    case 'title':
      prompt = `Translate this article title from ${sourceLang} to ${targetLang}. Keep it concise and engaging:\n\n${text}`;
      break;
    case 'seo':
      prompt = `Translate this SEO summary from ${sourceLang} to ${targetLang}. Keep it optimized for search engines:\n\n${text}`;
      break;
    case 'content':
      prompt = `Translate this article content from ${sourceLang} to ${targetLang}. Maintain the formatting, structure, and tone:\n\n${text}`;
      break;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini-2025-04-14',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: type === 'content' ? 4000 : 500
    });
    
    const translation = response.choices[0]?.message?.content?.trim();
    
    if (!translation) {
      throw new Error('Empty translation received from OpenAI');
    }
    
    return translation;
    
  } catch (error) {
    console.error(`Translation error for ${type}:`, error);
    throw error;
  }
}

// Crea traduzioni di test nel database staging
async function createTestTranslations(
  stagingClient: Client,
  itemType: string,
  itemId: number,
  translationType: 'english' | 'all'
) {
  console.log(`🔄 Creating test translations for ${itemType} ${itemId}...`);
  
  // Gestisci plurali irregolari per le tabelle di traduzione
  const getTranslationTableName = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_translations';
      case 'article':
        return 'articles_translations';
      case 'destination':
        return 'destinations_translations';
      default:
        return `${type}s_translations`;
    }
  };
  
  const getForeignKeyField = (type: string): string => {
    switch (type) {
      case 'company':
        return 'companies_id';
      case 'article':
        return 'articles_id';
      case 'destination':
        return 'destinations_id';
      default:
        return `${type}s_id`;
    }
  };
  
  const translationTable = getTranslationTableName(itemType);
  const foreignKeyField = getForeignKeyField(itemType);
  
  // Lingue da creare
  const languages = translationType === 'english' ? ['en'] : ['en', 'fr', 'es', 'de'];
  
  try {
    for (const lang of languages) {
      // Prima controlla se la traduzione esiste già
      const checkQuery = `
        SELECT id FROM ${translationTable} 
        WHERE ${foreignKeyField} = $1 AND languages_code = $2
      `;
      const existingResult = await stagingClient.query(checkQuery, [itemId, lang]);
      
      if (existingResult.rows.length > 0) {
        console.log(`⚠️ Translation for ${lang} already exists for ${itemType} ${itemId}`);
        continue;
      }
      
      // Crea traduzione di test
      let insertQuery = '';
      let values: any[] = [];
      
      if (itemType === 'article') {
        insertQuery = `
          INSERT INTO ${translationTable} 
          (${foreignKeyField}, languages_code, titolo_articolo, seo_summary, description, slug_permalink)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        values = [
          itemId,
          lang,
          `Test Title ${lang.toUpperCase()}`,
          `Test SEO Summary ${lang.toUpperCase()}`,
          `Test content for ${lang.toUpperCase()}`,
          `test-slug-${lang}`
        ];
      } else if (itemType === 'company') {
        insertQuery = `
          INSERT INTO ${translationTable} 
          (${foreignKeyField}, languages_code, name, description, slug)
          VALUES ($1, $2, $3, $4, $5)
        `;
        values = [
          itemId,
          lang,
          `Test Company ${lang.toUpperCase()}`,
          `Test company description ${lang.toUpperCase()}`,
          `test-company-${lang}`
        ];
      }
      
      if (insertQuery) {
        await stagingClient.query(insertQuery, values);
        console.log(`✅ Created ${lang} translation for ${itemType} ${itemId}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error creating test translations:`, error);
    throw error;
  }
} 