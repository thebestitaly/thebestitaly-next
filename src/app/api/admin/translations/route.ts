import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllTranslationKeys, 
  setTranslation, 
  deleteTranslation,
  getAllTranslations,
  refreshTranslationCache
} from '@/lib/translations-server';

// GET - Ottieni tutte le traduzioni o chiavi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'keys' | 'translations'
    const language = searchParams.get('language') || 'it';
    const section = searchParams.get('section');

    if (type === 'keys') {
      // Restituisci solo le chiavi per gestione admin
      const keys = await getAllTranslationKeys();
      return NextResponse.json({ success: true, keys });
    } else {
      // Restituisci traduzioni
      const translations = await getAllTranslations(language);
      
      if (section) {
        return NextResponse.json({ 
          success: true, 
          translations: translations[section] || {} 
        });
      }
      
      return NextResponse.json({ success: true, translations });
    }
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// POST - Aggiungi o aggiorna una traduzione
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyName, section, translations, description } = body;

    if (!keyName || !section || !translations) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: keyName, section, translations' },
        { status: 400 }
      );
    }

    await setTranslation(keyName, section, translations, description);

    return NextResponse.json({ 
      success: true, 
      message: `Translation ${keyName} saved successfully` 
    });
  } catch (error) {
    console.error('Error saving translation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina una traduzione
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyName = searchParams.get('keyName');

    if (!keyName) {
      return NextResponse.json(
        { success: false, error: 'Missing keyName parameter' },
        { status: 400 }
      );
    }

    await deleteTranslation(keyName);

    return NextResponse.json({ 
      success: true, 
      message: `Translation ${keyName} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}

// PUT - Refresh cache
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'refresh-cache') {
      await refreshTranslationCache();
      return NextResponse.json({ 
        success: true, 
        message: 'Translation cache refreshed successfully' 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh cache' },
      { status: 500 }
    );
  }
} 