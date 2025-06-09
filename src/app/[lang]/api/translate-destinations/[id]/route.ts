import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createDirectus, rest, readItems, createItem, updateItem, staticToken } from '@directus/sdk';

// Client Directus con autenticazione
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || '')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN || ''));

// Per i test, usiamo solo le prime 3 lingue
const TEST_LANGS = ['en', 'fr', 'es'];

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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API] *** HANDLER POST TRADUZIONE DESTINAZIONI ***');

  // LOG delle variabili d'ambiente
  console.log('[API] process.env.DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? 'Present' : 'Missing');
  console.log('[API] DIRECTUS_TOKEN preview:', process.env.DIRECTUS_TOKEN ? 
    `${process.env.DIRECTUS_TOKEN.substring(0, 4)}...${process.env.DIRECTUS_TOKEN.slice(-4)}` : 'N/A');
  console.log('[API] process.env.NEXT_PUBLIC_DIRECTUS_URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
  console.log('[API] OPENAI_API_KEY presente?', process.env.OPENAI_API_KEY ? '✓' : '✗');

  const { id } = await params;
  console.log('[API] ID destinazione ricevuto:', id);
  
  if (!id) {
    console.error('[API] Errore: id destinazione mancante');
    return NextResponse.json({ error: 'Missing destination id' }, { status: 400 });
  }

  // Test connessione OpenAI
  try {
    console.log('[API] Testing OpenAI connection...');
    const testResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Hello, this is a test.' }],
      temperature: 0.3,
      max_tokens: 10,
    });
    console.log('[API] OpenAI test successful:', testResponse.choices[0]?.message?.content);
  } catch (openaiError) {
    console.error('[API] OpenAI test failed:', openaiError);
    return NextResponse.json({ 
      error: 'OpenAI connection failed', 
      details: String(openaiError) 
    }, { status: 500 });
  }

  // Recupera la destinazione in italiano da Directus
  let rawDestinations;
  try {
    console.log('[API] Recupero destinazione da Directus...');
    console.log('[API] Query filter:', { id: { _eq: id } });
    
    rawDestinations = await directus.request(
      readItems('destinations', {
        filter: { id: { _eq: id } },
        fields: [
          'id',
          'type',
          'translations.destination_name',
          'translations.seo_title',
          'translations.seo_summary',
          'translations.description',
          'translations.slug_permalink'
        ],
        deep: { translations: { _filter: { languages_code: { _eq: 'it' } } } },
        limit: 1,
      })
    );
    
    console.log('[API] Raw destinations response:', JSON.stringify(rawDestinations, null, 2));
  } catch (err) {
    console.error('[API] Errore nel recupero destinazione:', err);
    return NextResponse.json({ 
      error: 'Errore nel recupero destinazione', 
      details: String(err) 
    }, { status: 500 });
  }

  let destination: any;
  if (Array.isArray(rawDestinations)) {
    destination = rawDestinations[0];
    console.log('[API] Destination found (array):', JSON.stringify(destination, null, 2));
  } else {
    destination = undefined;
    console.log('[API] No destinations found or invalid response format');
  }

  const it = destination?.translations?.[0];
  console.log('[API] Italian translation:', JSON.stringify(it, null, 2));
  
  if (!it) {
    console.error('[API] Destinazione italiana non trovata');
    return NextResponse.json({ error: 'Destinazione italiana non trovata' }, { status: 404 });
  }

  // Verifica contenuti da tradurre
  console.log('[API] Contenuti da tradurre:');
  console.log('- Nome:', it.destination_name ? `"${it.destination_name.substring(0, 50)}..."` : 'MISSING');
  console.log('- SEO Title:', it.seo_title ? `"${it.seo_title.substring(0, 50)}..."` : 'MISSING');
  console.log('- SEO Summary:', it.seo_summary ? `"${it.seo_summary.substring(0, 50)}..."` : 'MISSING');
  console.log('- Description:', it.description ? `"${it.description.substring(0, 50)}..."` : 'MISSING');

  console.log('[API] Destinazione trovata, inizio traduzione in', TEST_LANGS.length, 'lingue (modalità test)');

  const translationResults = [];
  const errors = [];

  // Traduci solo in 3 lingue per test
  for (const lang of TEST_LANGS) {
    try {
      console.log(`\n[API] === TRADUZIONE DESTINAZIONE IN ${lang.toUpperCase()} (${LANG_NAMES[lang]}) ===`);
      
      // Traduci tutti i campi usando il nome completo della lingua
      console.log(`[API] Inizio traduzione parallela dei campi per ${LANG_NAMES[lang]}...`);
      const [destinationName, seoTitle, seoSummary, description] = await Promise.all([
        translate(it.destination_name, 'Italian', LANG_NAMES[lang], 'destination_name'),
        translate(it.seo_title, 'Italian', LANG_NAMES[lang], 'seo_title'),
        translate(it.seo_summary, 'Italian', LANG_NAMES[lang], 'seo_summary'),
        translate(it.description, 'Italian', LANG_NAMES[lang], 'description')
      ]);

      console.log(`[API] Traduzioni ${LANG_NAMES[lang]} completate:`);
      console.log(`- Nome: "${destinationName?.substring(0, 50)}..." (${destinationName?.length || 0} chars)`);
      console.log(`- SEO Title: "${seoTitle?.substring(0, 50)}..." (${seoTitle?.length || 0} chars)`);
      console.log(`- SEO Summary: "${seoSummary?.substring(0, 50)}..." (${seoSummary?.length || 0} chars)`);
      console.log(`- Description: "${description?.substring(0, 50)}..." (${description?.length || 0} chars)`);

      // Controlla se esiste già una traduzione per questa lingua
      console.log(`[API] Controllo traduzione esistente per ${LANG_NAMES[lang]} (${lang})...`);
      const existingTranslations = await directus.request(
        readItems('destinations_translations', {
          filter: { 
            destinations_id: { _eq: destination.id },
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
          updateItem('destinations_translations', existingTranslations[0].id, {
            destination_name: destinationName,
            seo_title: seoTitle,
            seo_summary: seoSummary,
            description: description,
            slug_permalink: it.slug_permalink, // Il slug rimane uguale
          })
        );
        console.log(`[API] ✅ Aggiornata traduzione esistente per ${LANG_NAMES[lang]}`);
      } else {
        // Crea nuova traduzione
        console.log(`[API] Creazione nuova traduzione per ${LANG_NAMES[lang]}...`);
        const newTranslation = await directus.request(
          createItem('destinations_translations', {
            destination_name: destinationName,
            seo_title: seoTitle,
            seo_summary: seoSummary,
            description: description,
            slug_permalink: it.slug_permalink,
            languages_code: lang,
            destinations_id: destination.id,
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
async function translate(text: string, source: string, target: string, type: 'destination_name' | 'seo_title' | 'seo_summary' | 'description') {
  console.log(`[TRANSLATE] Inizio traduzione ${type} da ${source} a ${target}`);
  
  if (!text || text.trim() === '') {
    console.log(`[TRANSLATE] Testo vuoto per ${type}, restituisco stringa vuota`);
    return '';
  }

  let prompt: string;
  let maxTokens: number;

  if (type === 'description') {
    prompt = `You are an expert translator specializing in tourism and travel content. 
Translate the following destination description from ${source} to ${target}, maintaining EXACTLY the Markdown formatting if present.
Keep all links, images, titles and document structure intact.
Maintain the professional tone suitable for tourism and travel context.
Translate ONLY the text content, preserving all Markdown syntax.

Original description:
${text}

Respond with ONLY the translation, without comments or \`\`\``;
    maxTokens = Math.min(Math.floor((text?.length || 0) / 2) + 500, 4000);
  } else if (type === 'destination_name') {
    prompt = `Translate the following destination name from ${source} to ${target}.
Keep it natural and appropriate for tourism content.
If it's a proper noun (place name), keep it as is unless there's an established translation.

Original name: ${text}

Respond with ONLY the translation:`;
    maxTokens = 50;
  } else if (type === 'seo_title') {
    prompt = `Translate the following destination SEO title from ${source} to ${target}.
Keep it concise and SEO-optimized for tourism content.
Maintain professional tone and marketing appeal.

Original title: ${text}

Respond with ONLY the translation:`;
    maxTokens = 100;
  } else { // seo_summary
    prompt = `Translate the following destination SEO summary from ${source} to ${target}.
Keep it concise and SEO-optimized for tourism content.
Maintain professional tone and marketing appeal.

Original summary: ${text}

Respond with ONLY the translation:`;
    maxTokens = 200;
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