import { NextRequest, NextResponse } from 'next/server';
import { getTranslation, getTranslationsForSection } from '@/lib/translations-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'menu';
    const lang = searchParams.get('lang') || 'it';

    console.log(`🧪 Testing translations for ${section} in ${lang}`);

    // Test singola traduzione
    const singleTranslation = await getTranslation('destinations', lang, section);
    
    // Test sezione completa
    const sectionTranslations = await getTranslationsForSection(section, lang);

    // Test chiavi specifiche per sezione
    let specificTests = {};
    
    if (section === 'menu') {
      specificTests = {
        destinations: await getTranslation('destinations', lang, 'menu'),
        magazine: await getTranslation('magazine', lang, 'menu'),
        search: await getTranslation('search', lang, 'menu'),
        experience: await getTranslation('experience', lang, 'menu')
      };
    } else if (section === 'infothebest') {
      specificTests = {
        title: await getTranslation('title', lang, 'infothebest'),
        subtitle: await getTranslation('subtitle', lang, 'infothebest'),
        description: await getTranslation('description', lang, 'infothebest')
      };
    }

    return NextResponse.json({
      success: true,
      section,
      language: lang,
      tests: {
        singleTranslation: {
          key: 'destinations',
          value: singleTranslation
        },
        sectionTranslations: {
          count: Object.keys(sectionTranslations).length,
          keys: Object.keys(sectionTranslations),
          sample: Object.entries(sectionTranslations).slice(0, 5).reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
          }, {} as Record<string, string>)
        },
        specificTests
      },
      metadata: {
        timestamp: new Date().toISOString(),
        cacheStatus: 'fresh'
      }
    });

  } catch (error) {
    console.error('❌ Errore nel test traduzioni:', error);
    return NextResponse.json({
      error: 'Errore nel test delle traduzioni',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
} 