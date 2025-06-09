import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createDirectus, rest, readItems, createItem, updateItem } from '@directus/sdk';

// Client Directus
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || '').with(rest());

// Tutte le 50 lingue supportate
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

const MODEL = 'gpt-4.1-mini-2025-04-14';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mapping dei nomi dei campi per i prompt
const FIELD_NAMES = {
  titolo_articolo: 'titolo dell\'articolo',
  seo_summary: 'riassunto SEO',
  description: 'contenuto dell\'articolo in Markdown'
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API] *** HANDLER TRANSLATE SINGLE FIELD ***');
  
  const { id } = await params;
  const body = await req.json();
  const { field, value } = body;

  console.log('[API] ID articolo:', id);
  console.log('[API] Campo da tradurre:', field);
  console.log('[API] Valore da tradurre:', value?.substring(0, 100) + '...');

  if (!id || !field || !value) {
    return NextResponse.json({ 
      error: 'Missing required parameters: id, field, value' 
    }, { status: 400 });
  }

  if (!['titolo_articolo', 'seo_summary', 'description'].includes(field)) {
    return NextResponse.json({ 
      error: 'Invalid field. Must be: titolo_articolo, seo_summary, or description' 
    }, { status: 400 });
  }

  // Verifica che l'articolo esista
  let article;
  try {
    const rawArticles = await directus.request(
      readItems('articles', {
        filter: { id: { _eq: id } },
        fields: ['id'],
        limit: 1,
      })
    );
    
    if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }
    
    article = rawArticles[0];
  } catch (err) {
    console.error('[API] Errore nel recupero articolo:', err);
    return NextResponse.json({ 
      error: 'Errore nel recupero articolo', 
      details: String(err) 
    }, { status: 500 });
  }

  // Traduci il campo in tutte le 50 lingue
  const translations = [];
  const errors = [];

  for (const lang of ALL_LANGS) {
    try {
      console.log(`[API] Traducendo ${field} in ${LANG_NAMES[lang]} (${lang})...`);
      
      const translatedValue = await translateText(value, 'Italian', LANG_NAMES[lang], field);
      
      translations.push({
        language: lang,
        languageName: LANG_NAMES[lang],
        field,
        value: translatedValue
      });

      // Salva o aggiorna la traduzione
      try {
        // Prima controlla se esiste già una traduzione per questa lingua
        const existingTranslations = await directus.request(
          readItems('articles_translations', {
            filter: { 
              articles_id: { _eq: article.id },
              languages_code: { _eq: lang }
            },
            fields: ['id', field],
            limit: 1
          })
        );

        if (existingTranslations && existingTranslations.length > 0) {
          // Aggiorna la traduzione esistente
          await directus.request(
            updateItem('articles_translations', existingTranslations[0].id, {
              [field]: translatedValue
            })
          );
          console.log(`[API] Aggiornata traduzione esistente per ${LANG_NAMES[lang]} (${lang})`);
        } else {
          // Crea una nuova traduzione
          await directus.request(
            createItem('articles_translations', {
              [field]: translatedValue,
              languages_code: lang,
              articles_id: article.id,
            })
          );
          console.log(`[API] Creata nuova traduzione per ${LANG_NAMES[lang]} (${lang})`);
        }
      } catch (saveErr) {
        console.error(`[API] Errore nel salvare traduzione per ${LANG_NAMES[lang]} (${lang}):`, saveErr);
        errors.push({ language: lang, languageName: LANG_NAMES[lang], error: String(saveErr) });
      }
    } catch (translateErr) {
      console.error(`[API] Errore nella traduzione per ${LANG_NAMES[lang]} (${lang}):`, translateErr);
      errors.push({ language: lang, languageName: LANG_NAMES[lang], error: String(translateErr) });
    }
  }

  console.log(`[API] Completate ${translations.length} traduzioni su ${ALL_LANGS.length}`);
  console.log(`[API] Errori: ${errors.length}`);

  return NextResponse.json({ 
    success: true,
    field,
    translationsCompleted: translations.length,
    totalLanguages: ALL_LANGS.length,
    languagesTranslated: translations.map(t => `${t.languageName} (${t.language})`),
    errors: errors.length > 0 ? errors : undefined
  });
}

// Funzione helper migliorata per tradurre il testo usando nomi completi delle lingue
async function translateText(
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string, 
  fieldType: string
): Promise<string> {
  const fieldName = FIELD_NAMES[fieldType as keyof typeof FIELD_NAMES] || fieldType;
  
  let prompt: string;
  let maxTokens: number;
  
  if (fieldType === 'description') {
    prompt = `You are an expert translator specializing in tourism and travel content. 
Translate the following ${fieldName} from ${sourceLanguage} to ${targetLanguage}, maintaining EXACTLY the Markdown formatting.
Keep all links, images, titles and document structure intact.
Maintain the professional tone suitable for tourism context.
Translate ONLY the text content, preserving all Markdown syntax.

Original content:
${text}

Respond with ONLY the translation, without comments or \`\`\``;
    maxTokens = Math.min(Math.floor((text?.length || 0) / 2) + 500, 4000);
  } else if (fieldType === 'seo_summary') {
    prompt = `Translate the following ${fieldName} from ${sourceLanguage} to ${targetLanguage}.
Keep it concise and SEO-optimized for tourism content.
Maintain professional tone and marketing appeal.

Original text: ${text}

Respond with ONLY the translation:`;
    maxTokens = 200;
  } else { // titolo_articolo
    prompt = `Translate the following ${fieldName} from ${sourceLanguage} to ${targetLanguage}.
Keep it engaging and suitable for tourism content.
Maintain the same tone and appeal.

Original title: ${text}

Respond with ONLY the translation:`;
    maxTokens = 100;
  }
  
  try {
    console.log(`[TRANSLATE] Chiamata OpenAI per ${fieldType} (${sourceLanguage} → ${targetLanguage})...`);
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
    });

    const result = response.choices[0].message.content?.trim() || '';
    console.log(`[TRANSLATE] Traduzione ${fieldType} completata (${result.length} caratteri):`, result.substring(0, 50) + '...');
    
    if (!result) {
      console.warn(`[TRANSLATE] WARNING: Traduzione vuota per ${fieldType}!`);
    }
    
    return result;
  } catch (translateError) {
    console.error(`[TRANSLATE] Errore nella traduzione ${fieldType}:`, translateError);
    throw translateError;
  }
} 