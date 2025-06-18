import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { setTranslation, getAllTranslations } from '@/lib/translations-server';

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Tutte le lingue supportate (50+ lingue) - inglese come principale
const ALL_LANGUAGES = [
  'en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur', 'fa', 'tr', 'ko', 
  'vi', 'th', 'id', 'ms', 'tl', 'sw', 'am', 'he', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'sk', 
  'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'el', 'mk', 'az', 'ka', 'hy', 'is', 'af', 
  'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'sq', 'bs', 'me', 'tk'
];

// Nomi delle lingue per OpenAI
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'it': 'Italian',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ur': 'Urdu',
  'fa': 'Persian',
  'tr': 'Turkish',
  'ko': 'Korean',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'sw': 'Swahili',
  'am': 'Amharic',
  'he': 'Hebrew',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'pl': 'Polish',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'el': 'Greek',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'af': 'Afrikaans',
  'ca': 'Catalan',
  'eu': 'Basque',
  'gl': 'Galician',
  'cy': 'Welsh',
  'ga': 'Irish',
  'mt': 'Maltese',
  'sq': 'Albanian',
  'bs': 'Bosnian',
  'me': 'Montenegrin',
  'tk': 'Turkmen'
};

// POST - Traduci automaticamente una chiave di traduzione
export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { keyName, section, englishText, translationType = 'all' } = body;

    if (!keyName || !section || !englishText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: keyName, section, englishText' },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting auto-translation for key: ${keyName} (${section})`);

    // Determina le lingue target (escludi inglese che è già fornito)
    const targetLanguages = translationType === 'italian' 
      ? ['it'] 
      : ALL_LANGUAGES.filter(lang => lang !== 'en'); // Escludi inglese

    const translations: Record<string, string> = { en: englishText };
    let successCount = 0;
    let errorCount = 0;

    // Traduci in ogni lingua
    for (const lang of targetLanguages) {
      try {
        console.log(`🌍 Translating to ${LANGUAGE_NAMES[lang]} (${lang})...`);
        
        const translatedText = await translateUIText(englishText, LANGUAGE_NAMES[lang], section);
        translations[lang] = translatedText;
        successCount++;
        
        // Piccola pausa per evitare rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error translating to ${lang}:`, error);
        errorCount++;
        // Continua con le altre traduzioni anche se una fallisce
      }
    }

    // Salva tutte le traduzioni
    await setTranslation(keyName, section, translations);

    console.log(`✅ Translation completed: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: `Translation completed for ${keyName}`,
      translationsCompleted: successCount,
      totalLanguages: targetLanguages.length,
      errors: errorCount,
      translations: translations // Restituisci le traduzioni per aggiornamento real-time
    });

  } catch (error) {
    console.error('Error in auto-translation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-translate' },
      { status: 500 }
    );
  }
}

// Funzione per tradurre testo UI
async function translateUIText(
  text: string,
  targetLanguage: string,
  section: string
): Promise<string> {
  if (!openai || !text) {
    throw new Error('OpenAI not available or text is empty');
  }

  // Prompt specifico per traduzioni UI
  const prompt = `You are translating user interface text for a travel website about Italy called "TheBestItaly".

Section: ${section}
Source text (English): ${text}
Target language: ${targetLanguage}

Please translate this UI text to ${targetLanguage}. Keep it:
- only translations , no comment.

Translation:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200
    });

    const translation = response.choices[0]?.message?.content?.trim();

    if (!translation) {
      throw new Error('Empty translation received from OpenAI');
    }

    return translation;

  } catch (error) {
    console.error(`Translation error for ${targetLanguage}:`, error);
    throw error;
  }
} 