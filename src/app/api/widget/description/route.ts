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
    console.log(`🔍 Looking for destination with identifier: ${uuid}`);
    
    let destinationId;
    let destinationType;
    
    // Se l'uuid è un identificatore temporaneo, estrai tipo e ID
    if (uuid.startsWith('destination-')) {
      const matches = uuid.match(/^destination-(\w+)-(\d+)-/);
      if (matches) {
        const [, type, destId] = matches;
        destinationId = parseInt(destId);
        destinationType = type;
        console.log(`🔍 Parsing temporary ID: ${type}-${destinationId}`);
      }
    } else {
      // Prova a trovare la destinazione con uuid_id reale
      const [regions, provinces, municipalities] = await Promise.all([
        directusClient.getDestinations({ type: 'region', lang: language }),
        directusClient.getDestinations({ type: 'province', lang: language }),
        directusClient.getDestinations({ type: 'municipality', lang: language })
      ]);
      
      const allDestinations = [...regions, ...provinces, ...municipalities];
      const destination = allDestinations.find((d: any) => d.uuid_id === uuid);
      
      if (destination) {
        destinationId = destination.id;
        destinationType = destination.type;
      }
    }
    
    if (destinationId) {
      // Chiamata diretta a Directus per caricare la description completa
      console.log(`📖 Loading full description for destination ${destinationType}-${destinationId}`);
      
      const response = await directusClient.get('/items/destinations', {
        params: {
          'filter[id][_eq]': destinationId,
          'fields[]': [
            'translations.description'  // Solo la description completa
          ],
          'deep[translations][_filter][languages_code][_eq]': language,
          limit: 1
        }
      });

      const destination = response.data?.data[0];
      const translation = destination?.translations?.[0];
      const description = translation?.description;
      
      if (description && description.trim()) {
        console.log(`✅ Found full destination description, length: ${description.length}`);
        return description;
      } else {
        console.log(`⚠️ No full description found, using fallback`);
        return 'Scopri questa meravigliosa destinazione italiana con i suoi paesaggi mozzafiato, la sua ricca storia e le tradizioni uniche che la rendono una meta imperdibile.';
      }
    } else {
      console.log(`❌ Destination not found with identifier: ${uuid}`);
      return 'Scopri questa meravigliosa destinazione italiana.';
    }
  } catch (error) {
    console.error('❌ Error fetching destination description:', error);
    return 'Scopri questa meravigliosa destinazione italiana.';
  }
}

async function getCompanyDescription(uuid: string, language: string): Promise<string> {
  try {
    console.log(`🔍 Looking for company with identifier: ${uuid}`);
    
    // Usa la stessa funzione che funziona in search
    const allCompanies = await directusClient.getCompaniesForListing(language, {});
    
    let company;
    
    // Prima prova con uuid_id
    company = allCompanies.find((c: any) => c.uuid_id === uuid);
    
    // Se non trovato e l'uuid sembra un identificatore temporaneo, estrai l'ID
    if (!company && uuid.startsWith('company-')) {
      const matches = uuid.match(/^company-(\d+)-/);
      if (matches) {
        const companyId = parseInt(matches[1]);
        company = allCompanies.find((c: any) => c.id === companyId);
        console.log(`🔍 Found via temporary ID: ${companyId}`);
      }
    }

    if (company) {
      const translation = company?.translations?.[0];
      const description = translation?.description || company?.description || 'Eccellenza italiana di qualità premium.';
      console.log(`✅ Found company description, length: ${description.length}`);
      return description;
    } else {
      console.log(`❌ Company not found with identifier: ${uuid}`);
      return 'Eccellenza italiana di qualità premium.';
    }
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