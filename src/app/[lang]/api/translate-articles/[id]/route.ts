import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createDirectus, rest, readItems, createItem, updateItem, staticToken } from '@directus/sdk';

// Client Directus con autenticazione
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || '')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN || ''));

// TUTTE le 50 lingue supportate con nomi completi
const ALL_LANGS = [
  'en','fr','es','pt','de','nl','ro','sv','pl','vi','id','el','uk','ru',
  'bn','zh','hi','ar','fa','ur','ja','ko','am','cs','da','fi','af','hr',
  'bg','sk','sl','sr','th','ms','tl','he','ca','et','lv','lt','mk','az',
  'ka','hy','is','sw','zh-tw'
];

// Mapping sigle lingue ai nomi completi per traduzioni più accurate
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
  'tl': 'Filipino',
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
  'zh-tw': 'Chinese (Traditional)'
};

// Per i test, usiamo solo le prime 3 lingue
const TEST_LANGS = ['en', 'fr', 'es'];

// ATTENZIONE: se il modello non è valido, OpenAI genererà un errore
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

  console.log('[API] Articolo trovato, inizio traduzione in', TEST_LANGS.length, 'lingue (modalità test)');

  const translationResults = [];
  const errors = [];

  // Traduci solo in 3 lingue per test
  for (const lang of TEST_LANGS) {
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
      console.error(`[API] Errore nella traduzione per ${LANG_NAMES[lang]}:`, translateError);
      errors.push({ language: lang, error: String(translateError) });
    }
  }

  console.log(`[API] Completate ${translationResults.length} traduzioni su ${TEST_LANGS.length}`);
  console.log(`[API] Errori: ${errors.length}`);

  return NextResponse.json({ 
    success: true,
    translationsCompleted: translationResults.length,
    totalLanguages: TEST_LANGS.length,
    languagesTranslated: translationResults.map(t => t.language),
    errors: errors.length > 0 ? errors : undefined
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
    maxTokens = 200;
  } else { // titolo
    prompt = `Translate the following article title from ${source} to ${target}.
Keep it engaging and suitable for tourism content.
Maintain the same tone and appeal.

Original title: ${text}

Respond with ONLY the translation:`;
    maxTokens = 100;
  }
  
  try {
    console.log(`[TRANSLATE] Chiamata OpenAI per ${type} (${source} → ${target})...`);
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
    });

    const result = response.choices[0].message.content?.trim() || '';
    console.log(`[TRANSLATE] Traduzione ${type} completata (${result.length} caratteri):`, result.substring(0, 100) + '...');
    
    if (!result) {
      console.warn(`[TRANSLATE] WARNING: Traduzione vuota per ${type}!`);
    }
    
    return result;
  } catch (translateError) {
    console.error(`[TRANSLATE] Errore nella traduzione ${type}:`, translateError);
    throw translateError;
  }
}