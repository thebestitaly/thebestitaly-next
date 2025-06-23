import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';

interface DescriptionParams {
  type: 'articolo' | 'destinazione' | 'azienda';
  uuid: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DescriptionParams = await request.json();
    const { type, uuid, language } = body;

    console.log('🔍 Widget Description Request:', { type, uuid, language });

    if (!type || !uuid || !language) {
      return NextResponse.json(
        { error: 'Parametri mancanti: type, uuid, language sono obbligatori' },
        { status: 400 }
      );
    }

    let description = '';

    switch (type) {
      case 'destinazione':
        description = await getDestinationDescription(uuid, language);
        break;
      case 'azienda':
        description = await getCompanyDescription(uuid, language);
        break;
      case 'articolo':
        description = await getArticleDescription(uuid, language);
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

async function getDestinationDescription(uuid: string, language: string): Promise<string> {
  try {
    // Query leggera solo per la description usando UUID
    const response = await directusClient.get('/items/destinations', {
      params: {
        'filter[uuid_id][_eq]': uuid,
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

async function getCompanyDescription(uuid: string, language: string): Promise<string> {
  try {
    const response = await directusClient.get('/items/companies', {
      params: {
        'filter[uuid_id][_eq]': uuid,
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

async function getArticleDescription(uuid: string, language: string): Promise<string> {
  try {
    const response = await directusClient.get('/items/articles', {
      params: {
        'filter[uuid_id][_eq]': uuid,
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