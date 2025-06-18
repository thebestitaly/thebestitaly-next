import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createDirectus, rest, readItems, createItem, updateItem, staticToken } from '@directus/sdk';

// Client Directus con autenticazione
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || '')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN || ''));

// TUTTE le 49 lingue supportate (escluso italiano)
const ALL_LANG_CODES = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw','tk','hu'
];

// Solo inglese per traduzione rapida
const ENGLISH_ONLY_CODE = ['en'];

// Mapping codici lingue ai nomi completi per traduzioni più accurate
const LANG_NAMES: { [key: string]: string } = {
  'en': 'English',
  'fr': 'French', 
  'es': 'Spanish',
  'pt': 'Portuguese',
  'de': 'German',
  'nl': 'Dutch',
  'ro': 'Romanian',
  'sv': 'Swedish',
  'pl': 'Polish',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'el': 'Greek',
  'uk': 'Ukrainian',
  'ru': 'Russian',
  'bn': 'Bengali',
  'zh': 'Chinese (Simplified)',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'fa': 'Persian',
  'ur': 'Urdu',
  'ja': 'Japanese',
  'ko': 'Korean',
  'am': 'Amharic',
  'cs': 'Czech',
  'da': 'Danish',
  'fi': 'Finnish',
  'af': 'Afrikaans',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sr': 'Serbian',
  'th': 'Thai',
  'ms': 'Malay',
  'tl': 'Tagalog',
  'he': 'Hebrew',
  'ca': 'Catalan',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'sw': 'Swahili',
  'zh-tw': 'Chinese (Traditional)',
  'tk': 'Turkmen',
  'hu': 'Hungarian'
};

// ATTENZIONE: se il modello non è valido, OpenAI genererà un errore
// Usa un modello più stabile e disponibile
const MODEL = 'gpt-4.1-mini-2025-04-14';

// Conditional OpenAI initialization to prevent build failures
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.warn('[API] OpenAI initialization failed:', error);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API] *** DEBUG HANDLER - GET ARTICLE INFO ***');
  
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'ID articolo mancante' }, { status: 400 });
  }

  try {
    // Recupera informazioni sull'articolo
    const rawArticles = await directus.request(
      readItems('articles', {
        filter: { id: { _eq: id } },
        fields: [
          'id',
          'status',
          'translations.titolo_articolo',
          'translations.seo_summary',
          'translations.description',
          'translations.slug_permalink',
          'translations.languages_code'
        ],
        limit: 1,
      })
    );

    const article = Array.isArray(rawArticles) ? rawArticles[0] : null;
    
    if (!article) {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }

    // Trova la traduzione italiana
    const italianTranslation = article.translations?.find((t: any) => t.languages_code === 'it');
    
    // Conta le traduzioni esistenti
    const existingLanguages = article.translations?.map((t: any) => t.languages_code) || [];
    
    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        status: article.status,
        hasItalianTranslation: !!italianTranslation,
        existingLanguages: existingLanguages,
        totalTranslations: existingLanguages.length,
        italianContent: italianTranslation ? {
          titolo: italianTranslation.titolo_articolo?.substring(0, 100) + '...',
          seoLength: italianTranslation.seo_summary?.length || 0,
          descriptionLength: italianTranslation.description?.length || 0,
          hasSlug: !!italianTranslation.slug_permalink
        } : null
      },
      openaiAvailable: !!openai,
      model: MODEL,
      supportedLanguages: ALL_LANG_CODES.length
    });
    
  } catch (error) {
    console.error('[API] Errore nel debug:', error);
    return NextResponse.json({ 
      error: 'Errore nel recupero informazioni articolo',
      details: String(error)
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API] *** HANDLER TRANSLATE ARTICLE ***');

  // LOG delle variabili d'ambiente
  console.log('[API] process.env.DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? 'Present' : 'Missing');
  console.log('[API] DIRECTUS_TOKEN preview:', process.env.DIRECTUS_TOKEN ? 
    `${process.env.DIRECTUS_TOKEN.substring(0, 4)}...${process.env.DIRECTUS_TOKEN.slice(-4)}` : 'N/A');
  console.log('[API] process.env.NEXT_PUBLIC_DIRECTUS_URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
  console.log('[API] OPENAI_API_KEY presente?', process.env.OPENAI_API_KEY ? '✓' : '✗');

  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ 
      error: 'ID articolo mancante' 
    }, { status: 400 });
  }

  console.log('[API] ID articolo:', id);

  // Leggi il parametro 'type' dal body della richiesta
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.log('[API] Nessun body JSON, uso default');
    body = {};
  }

  const translationType = body.type || 'all'; // Default: tutte le lingue
  console.log('[API] Tipo di traduzione:', translationType);

  // Determina le lingue da tradurre in base al tipo
  const targetLanguages = translationType === 'english' ? ENGLISH_ONLY_CODE : ALL_LANG_CODES;
  console.log('[API] Lingue target:', targetLanguages.length, 'lingue -', targetLanguages.join(', '));

  let rawArticles: any;

  try {
    console.log('[API] Recupero articolo da Directus...');
    console.log('[API] Query filter:', { id: { _eq: id } });
    
    rawArticles = await directus.request(
      readItems('articles', {
        filter: { id: { _eq: id } },
        fields: [
          'id',
          'translations.titolo_articolo',
          'translations.seo_summary',
          'translations.description',
          'translations.slug_permalink'
        ],
        deep: { translations: { _filter: { languages_code: { _eq: 'it' } } } },
        limit: 1,
      })
    );
    
    console.log('[API] Raw articles response:', JSON.stringify(rawArticles, null, 2));
  } catch (err) {
    console.error('[API] Errore nel recupero articolo:', err);
    return NextResponse.json({ 
      error: 'Errore nel recupero articolo', 
      details: String(err) 
    }, { status: 500 });
  }

  let article: any;
  if (Array.isArray(rawArticles)) {
    article = rawArticles[0];
    console.log('[API] Article found (array):', JSON.stringify(article, null, 2));
  } else {
    article = undefined;
    console.log('[API] No articles found or invalid response format');
  }

  const it = article?.translations?.[0];
  console.log('[API] Italian translation:', JSON.stringify(it, null, 2));
  
  if (!it) {
    console.error('[API] Articolo italiano non trovato');
    return NextResponse.json({ error: 'Articolo italiano non trovato' }, { status: 404 });
  }

  // Verifica contenuti da tradurre
  console.log('[API] Contenuti da tradurre:');
  console.log('- Titolo:', it.titolo_articolo ? `"${it.titolo_articolo.substring(0, 50)}..."` : 'MISSING');
  console.log('- SEO Summary:', it.seo_summary ? `"${it.seo_summary.substring(0, 50)}..."` : 'MISSING');
  console.log('- Description:', it.description ? `"${it.description.substring(0, 50)}..."` : 'MISSING');

  console.log('[API] Articolo trovato, inizio traduzione in', targetLanguages.length, 'lingue');

  const translationResults = [];
  const errors = [];

  // Traduci nelle lingue selezionate
  for (const lang of targetLanguages) {
    try {
      console.log(`\n[API] === TRADUZIONE IN ${lang.toUpperCase()} (${LANG_NAMES[lang]}) ===`);
      
      // Traduci tutti i campi usando il nome completo della lingua
      console.log(`[API] Inizio traduzione parallela dei 3 campi per ${LANG_NAMES[lang]}...`);
      const [titolo, seo, description] = await Promise.all([
        translate(it.titolo_articolo, 'Italian', LANG_NAMES[lang], 'titolo'),
        translate(it.seo_summary, 'Italian', LANG_NAMES[lang], 'seo'),
        translate(it.description, 'Italian', LANG_NAMES[lang], 'content')
      ]);

      console.log(`[API] Traduzioni ${LANG_NAMES[lang]} completate:`);
      console.log(`- Titolo: "${titolo?.substring(0, 50)}..." (${titolo?.length || 0} chars)`);
      console.log(`- SEO: "${seo?.substring(0, 50)}..." (${seo?.length || 0} chars)`);
      console.log(`- Description: "${description?.substring(0, 50)}..." (${description?.length || 0} chars)`);

      // Controlla se esiste già una traduzione per questa lingua
      console.log(`[API] Controllo traduzione esistente per ${LANG_NAMES[lang]} (${lang})...`);
      const existingTranslations = await directus.request(
        readItems('articles_translations', {
          filter: { 
            articles_id: { _eq: article.id },
            languages_code: { _eq: lang }
          },
          fields: ['id'],
          limit: 1
        })
      );

      console.log(`[API] Traduzioni esistenti per ${LANG_NAMES[lang]}:`, existingTranslations?.length || 0);

      if (existingTranslations && existingTranslations.length > 0) {
        // Aggiorna traduzione esistente
        console.log(`[API] Aggiornamento traduzione esistente per ${LANG_NAMES[lang]} (ID: ${existingTranslations[0].id})...`);
        await directus.request(
          updateItem('articles_translations', existingTranslations[0].id, {
            titolo_articolo: titolo,
            seo_summary: seo,
            description: description,
            slug_permalink: it.slug_permalink, // Il slug rimane uguale
          })
        );
        console.log(`[API] ✅ Aggiornata traduzione esistente per ${LANG_NAMES[lang]}`);
      } else {
        // Crea nuova traduzione
        console.log(`[API] Creazione nuova traduzione per ${LANG_NAMES[lang]}...`);
        const newTranslation = await directus.request(
          createItem('articles_translations', {
            titolo_articolo: titolo,
            seo_summary: seo,
            description: description,
            slug_permalink: it.slug_permalink,
            languages_code: lang,
            articles_id: article.id,
          })
        );
        console.log(`[API] ✅ Creata nuova traduzione per ${LANG_NAMES[lang]} (ID: ${newTranslation?.id})`);
      }

      translationResults.push({ language: lang, success: true });
      
    } catch (translateError) {
      console.error(`[API] ❌ ERRORE nella traduzione per ${LANG_NAMES[lang]} (${lang}):`, translateError);
      console.error(`[API] Error stack:`, translateError instanceof Error ? translateError.stack : 'No stack trace');
      console.error(`[API] Error message:`, translateError instanceof Error ? translateError.message : String(translateError));
      
      // Aggiungi informazioni più dettagliate sull'errore
      const errorInfo = {
        language: lang,
        languageName: LANG_NAMES[lang],
        error: translateError instanceof Error ? translateError.message : String(translateError),
        errorType: translateError instanceof Error ? translateError.constructor.name : typeof translateError,
        timestamp: new Date().toISOString()
      };
      
      errors.push(errorInfo);
    }
  }

  console.log(`[API] Completate ${translationResults.length} traduzioni su ${targetLanguages.length}`);
  console.log(`[API] Errori: ${errors.length}`);

  return NextResponse.json({ 
    success: true,
    translationsCompleted: translationResults.length,
    totalLanguages: targetLanguages.length,
    languagesTranslated: translationResults.map(t => t.language),
    errors: errors.length > 0 ? errors : undefined,
    type: translationType
  });
}

// Funzione migliorata per tradurre con nomi completi delle lingue
async function translate(text: string, source: string, target: string, type: 'titolo' | 'seo' | 'content') {
  console.log(`[TRANSLATE] Inizio traduzione ${type} da ${source} a ${target}`);
  
  // Check if OpenAI is available
  if (!openai) {
    throw new Error('OpenAI not available - missing API key');
  }
  
  if (!text || text.trim() === '') {
    console.log(`[TRANSLATE] Testo vuoto per ${type}, restituisco stringa vuota`);
    return '';
  }

  let prompt: string;
  let maxTokens: number;

  if (type === 'content') {
    prompt = `You are an expert translator specializing in tourism and travel content. 
Translate the following article content from ${source} to ${target}, maintaining EXACTLY the Markdown formatting.
Keep all links, images, titles and document structure intact.
Maintain the professional tone suitable for tourism context.
Translate ONLY the text content, preserving all Markdown syntax.

Original content:
${text}

Respond with ONLY the translation, without comments or \`\`\``;
    maxTokens = Math.min(Math.floor((text?.length || 0) / 2) + 500, 4000);
  } else if (type === 'seo') {
    prompt = `Translate the following SEO summary from ${source} to ${target}.
Keep it concise and SEO-optimized for tourism content.
Maintain professional tone and marketing appeal.

Original text: ${text}

Respond with ONLY the translation:`;
    maxTokens = 1000;
  } else { // titolo
    prompt = `Translate the following article title from ${source} to ${target}.
Keep it engaging and suitable for tourism content.
Maintain the same tone and appeal.

Original title: ${text}

Respond with ONLY the translation:`;
    maxTokens = 1000;
  }
  
  try {
    console.log(`[TRANSLATE] Chiamata OpenAI per ${type} (${source} → ${target})...`);
    console.log(`[TRANSLATE] Model: ${MODEL}, Max tokens: ${maxTokens}`);
    console.log(`[TRANSLATE] Text length: ${text.length} characters`);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
    });

    const result = response.choices[0].message.content?.trim() || '';
    console.log(`[TRANSLATE] ✅ Traduzione ${type} completata (${result.length} caratteri):`, result.substring(0, 100) + '...');
    
    if (!result) {
      console.warn(`[TRANSLATE] ⚠️ WARNING: Traduzione vuota per ${type}!`);
    }
    
    return result;
  } catch (translateError) {
    console.error(`[TRANSLATE] ❌ ERRORE nella traduzione ${type} (${source} → ${target}):`, translateError);
    console.error(`[TRANSLATE] Error details:`, {
      name: translateError instanceof Error ? translateError.name : 'Unknown',
      message: translateError instanceof Error ? translateError.message : String(translateError),
      stack: translateError instanceof Error ? translateError.stack : 'No stack',
      type: type,
      source: source,
      target: target,
      textLength: text?.length || 0,
      model: MODEL,
      maxTokens: maxTokens
    });
    
    // Re-throw l'errore con più contesto
    const enhancedError = new Error(`Translation failed for ${type} (${source} → ${target}): ${translateError instanceof Error ? translateError.message : String(translateError)}`);
    enhancedError.cause = translateError;
    throw enhancedError;
  }
}