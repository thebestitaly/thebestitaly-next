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
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API] *** HANDLER TRANSLATE COMPANY ***');

  // LOG delle variabili d'ambiente
  console.log('[API] process.env.DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? 'Present' : 'Missing');
  console.log('[API] DIRECTUS_TOKEN preview:', process.env.DIRECTUS_TOKEN ? 
    `${process.env.DIRECTUS_TOKEN.substring(0, 4)}...${process.env.DIRECTUS_TOKEN.slice(-4)}` : 'N/A');
  console.log('[API] process.env.NEXT_PUBLIC_DIRECTUS_URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
  console.log('[API] OPENAI_API_KEY presente?', process.env.OPENAI_API_KEY ? '✓' : '✗');

  const { id } = await params;
  console.log('[API] ID company ricevuto:', id);
  
  if (!id) {
    console.error('[API] Errore: id company mancante');
    return NextResponse.json({ error: 'Missing company id' }, { status: 400 });
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

  // Recupera la company in italiano da Directus
  let rawCompanies;
  try {
    console.log('[API] Recupero company da Directus...');
    console.log('[API] Query filter:', { id: { _eq: id } });
    
    rawCompanies = await directus.request(
      readItems('companies', {
        filter: { id: { _eq: id } },
        fields: [
          'id',
          'company_name',
          'website',
          'email',
          'phone',
          'translations.description',
          'translations.seo_title',
          'translations.seo_summary',
          'translations.slug_permalink'
        ],
        deep: { translations: { _filter: { languages_code: { _eq: 'it' } } } },
        limit: 1,
      })
    );
    
    console.log('[API] Raw companies response:', JSON.stringify(rawCompanies, null, 2));
  } catch (err) {
    console.error('[API] Errore nel recupero company:', err);
    return NextResponse.json({ 
      error: 'Errore nel recupero company', 
      details: String(err) 
    }, { status: 500 });
  }

  let company: any;
  if (Array.isArray(rawCompanies)) {
    company = rawCompanies[0];
    console.log('[API] Company found (array):', JSON.stringify(company, null, 2));
  } else {
    company = undefined;
    console.log('[API] No companies found or invalid response format');
  }

  const it = company?.translations?.[0];
  console.log('[API] Italian translation:', JSON.stringify(it, null, 2));
  
  if (!it) {
    console.error('[API] Company italiana non trovata');
    return NextResponse.json({ error: 'Company italiana non trovata' }, { status: 404 });
  }

  // Verifica contenuti da tradurre
  console.log('[API] Contenuti da tradurre:');
  console.log('- Description:', it.description ? `"${it.description.substring(0, 50)}..."` : 'MISSING');
  console.log('- SEO Title:', it.seo_title ? `"${it.seo_title.substring(0, 50)}..."` : 'MISSING');
  console.log('- SEO Summary:', it.seo_summary ? `"${it.seo_summary.substring(0, 50)}..."` : 'MISSING');

  console.log('[API] Company trovata, inizio traduzione in', TEST_LANGS.length, 'lingue (modalità test)');

  const translationResults = [];
  const errors = [];

  // Traduci solo in 3 lingue per test
  for (const lang of TEST_LANGS) {
    try {
      console.log(`\n[API] === TRADUZIONE COMPANY IN ${lang.toUpperCase()} (${LANG_NAMES[lang]}) ===`);
      
      // Traduci tutti i campi usando il nome completo della lingua
      console.log(`[API] Inizio traduzione parallela dei campi per ${LANG_NAMES[lang]}...`);
      const [description, seoTitle, seoSummary] = await Promise.all([
        translate(it.description, 'Italian', LANG_NAMES[lang], 'description'),
        translate(it.seo_title, 'Italian', LANG_NAMES[lang], 'seo_title'),
        translate(it.seo_summary, 'Italian', LANG_NAMES[lang], 'seo_summary')
      ]);

      console.log(`[API] Traduzioni ${LANG_NAMES[lang]} completate:`);
      console.log(`- Description: "${description?.substring(0, 50)}..." (${description?.length || 0} chars)`);
      console.log(`- SEO Title: "${seoTitle?.substring(0, 50)}..." (${seoTitle?.length || 0} chars)`);
      console.log(`- SEO Summary: "${seoSummary?.substring(0, 50)}..." (${seoSummary?.length || 0} chars)`);

      // Controlla se esiste già una traduzione per questa lingua
      console.log(`[API] Controllo traduzione esistente per ${LANG_NAMES[lang]} (${lang})...`);
      const existingTranslations = await directus.request(
        readItems('companies_translations', {
          filter: { 
            companies_id: { _eq: company.id },
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
          updateItem('companies_translations', existingTranslations[0].id, {
            description: description,
            seo_title: seoTitle,
            seo_summary: seoSummary,
            slug_permalink: it.slug_permalink, // Il slug rimane uguale
          })
        );
        console.log(`[API] ✅ Aggiornata traduzione esistente per ${LANG_NAMES[lang]}`);
      } else {
        // Crea nuova traduzione
        console.log(`[API] Creazione nuova traduzione per ${LANG_NAMES[lang]}...`);
        const newTranslation = await directus.request(
          createItem('companies_translations', {
            description: description,
            seo_title: seoTitle,
            seo_summary: seoSummary,
            slug_permalink: it.slug_permalink,
            languages_code: lang,
            companies_id: company.id,
          })
        );
        console.log(`[API] ✅ Creata nuova traduzione per ${LANG_NAMES[lang]} (ID: ${newTranslation?.id})`);
      }

      translationResults.push({ language: lang, success: true });
      
    } catch (err) {
      console.error(`[API] ❌ Errore traduzione ${LANG_NAMES[lang]}:`, err);
      
      // Migliore serializzazione dell'errore
      let errorMessage = 'Errore sconosciuto';
      let errorDetails = String(err);
      
      if (err instanceof Error) {
        errorMessage = err.message;
        errorDetails = `${err.name}: ${err.message}`;
        if (err.stack) {
          console.error(`[API] Stack trace for ${LANG_NAMES[lang]}:`, err.stack);
        }
      } else if (typeof err === 'object' && err !== null) {
        try {
          errorDetails = JSON.stringify(err, null, 2);
        } catch {
          errorDetails = Object.prototype.toString.call(err);
        }
      }
      
      console.error(`[API] Error details for ${LANG_NAMES[lang]}:`, errorDetails);
      
      errors.push({ 
        language: lang, 
        error: errorDetails,
        message: errorMessage,
        type: err instanceof Error ? err.constructor.name : typeof err
      });
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
async function translate(text: string, source: string, target: string, type: 'description' | 'seo_title' | 'seo_summary') {
  console.log(`[TRANSLATE] Inizio traduzione ${type} da ${source} a ${target}`);
  
  if (!text || text.trim() === '') {
    console.log(`[TRANSLATE] Testo vuoto per ${type}, restituisco stringa vuota`);
    return '';
  }

  let prompt: string;
  let maxTokens: number;

  if (type === 'description') {
    prompt = `You are an expert translator specializing in business and tourism content. 
Translate the following company description from ${source} to ${target}, maintaining EXACTLY the Markdown formatting if present.
Keep all links, images, titles and document structure intact.
Maintain the professional tone suitable for business context.
Translate ONLY the text content, preserving all Markdown syntax.

Original description:
${text}

Respond with ONLY the translation, without comments or \`\`\``;
    maxTokens = Math.min(Math.floor((text?.length || 0) / 2) + 500, 4000);
  } else if (type === 'seo_title') {
    prompt = `Translate the following company SEO title from ${source} to ${target}.
Keep it concise and SEO-optimized for business content.
Maintain professional tone and marketing appeal.

Original title: ${text}

Respond with ONLY the translation:`;
    maxTokens = 100;
  } else { // seo_summary
    prompt = `Translate the following company SEO summary from ${source} to ${target}.
Keep it concise and SEO-optimized for business content.
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