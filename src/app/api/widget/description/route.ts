import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';

interface DescriptionParams {
  type: 'articolo' | 'destinazione' | 'azienda';
  id: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DescriptionParams = await request.json();
    const { type, id, language } = body;

    console.log('🔍 Widget Description Request:', { type, id, language });

    if (!type || !id || !language) {
      return NextResponse.json(
        { error: 'Parametri mancanti: type, id, language sono obbligatori' },
        { status: 400 }
      );
    }

    let description = '';

    switch (type) {
      case 'destinazione':
        description = await getDestinationDescription(id, language);
        break;
      case 'azienda':
        description = await getCompanyDescription(id, language);
        break;
      case 'articolo':
        description = await getArticleDescription(id, language);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo non valido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ description }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200', // Cache 10 min
      },
    });

  } catch (error) {
    console.error('❌ Widget Description Error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

async function getDestinationDescription(id: string, language: string): Promise<string> {
  try {
    // Query leggera solo per la description
    const response = await directusClient.get('/items/destinations', {
      params: {
        'filter[id][_eq]': id,
        'fields[]': [
          'translations.description'
        ],
        'deep[translations][_filter][languages_code][_eq]': language,
        limit: 1
      }
    });

    const destination = response.data?.data[0];
    const translation = destination?.translations?.[0];
    
    return translation?.description || 'Scopri questa meravigliosa destinazione italiana.';
  } catch (error) {
    console.error('❌ Error fetching destination description:', error);
    return 'Scopri questa meravigliosa destinazione italiana.';
  }
}

async function getCompanyDescription(id: string, language: string): Promise<string> {
  try {
    const response = await directusClient.get('/items/companies', {
      params: {
        'filter[id][_eq]': id,
        'fields[]': [
          'description',
          'translations.description'
        ],
        'deep[translations][_filter][languages_code][_eq]': language,
        limit: 1
      }
    });

    const company = response.data?.data[0];
    const translation = company?.translations?.[0];
    
    return translation?.description || company?.description || 'Eccellenza italiana di qualità premium.';
  } catch (error) {
    console.error('❌ Error fetching company description:', error);
    return 'Eccellenza italiana di qualità premium.';
  }
}

async function getArticleDescription(id: string, language: string): Promise<string> {
  try {
    const response = await directusClient.get('/items/articles', {
      params: {
        'filter[id][_eq]': id,
        'fields[]': [
          'translations.description'
        ],
        'deep[translations][_filter][languages_code][_eq]': language,
        limit: 1
      }
    });

    const article = response.data?.data[0];
    const translation = article?.translations?.[0];
    
    return translation?.description || 'Leggi il nostro ultimo articolo sulla cultura italiana.';
  } catch (error) {
    console.error('❌ Error fetching article description:', error);
    return 'Leggi il nostro ultimo articolo sulla cultura italiana.';
  }
} 