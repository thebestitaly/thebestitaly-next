import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getDatabaseConfig } from '@/lib/staging-config';

// Configurazioni database
const STAGING_DB_URL = getDatabaseConfig(true).url;
const PRODUCTION_DB_URL = getDatabaseConfig(false).url;

interface SyncRequest {
  itemType: 'article' | 'company' | 'destination';
  itemId: number;
  languages?: string[]; // Se non specificato, sincronizza tutte
  confirmSync: boolean;
}

export async function POST(request: NextRequest) {
  const stagingClient = new Client({ connectionString: STAGING_DB_URL });
  const productionClient = new Client({ connectionString: PRODUCTION_DB_URL });

  try {
    const { itemType, itemId, languages, confirmSync }: SyncRequest = await request.json();

    if (!itemType || !itemId || !confirmSync) {
      return NextResponse.json(
        { error: 'Missing required fields or confirmation' },
        { status: 400 }
      );
    }

    console.log(`🔄 Syncing ${itemType} ${itemId} translations from staging to production`);

    await stagingClient.connect();
    await productionClient.connect();

    let syncCount = 0;
    const errors: string[] = [];

    // Gestisci plurali irregolari per le tabelle di traduzione
    const getTranslationTableName = (type: string): string => {
      switch (type) {
        case 'company':
          return 'companies_translations';
        case 'article':
          return 'articles_translations';
        case 'destination':
          return 'destinations_translations';
        default:
          return `${type}s_translations`;
      }
    };
    
    const getForeignKeyField = (type: string): string => {
      switch (type) {
        case 'company':
          return 'companies_id';
        case 'article':
          return 'articles_id';
        case 'destination':
          return 'destinations_id';
        default:
          return `${type}s_id`;
      }
    };

    // Determina la tabella delle traduzioni
    const translationTable = getTranslationTableName(itemType);
    const foreignKeyField = getForeignKeyField(itemType);

    // Query per ottenere le traduzioni dalla staging
    let stagingQuery = `
      SELECT * FROM ${translationTable} 
      WHERE ${foreignKeyField} = $1
    `;
    
    const queryParams: any[] = [itemId];
    
    if (languages && languages.length > 0) {
      stagingQuery += ` AND languages_code = ANY($2)`;
      queryParams.push(languages);
    }

    const stagingResult = await stagingClient.query(stagingQuery, queryParams);

    if (stagingResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No translations found in staging for ${itemType} ${itemId}` },
        { status: 404 }
      );
    }

    // Per ogni traduzione, fai upsert in produzione
    for (const translation of stagingResult.rows) {
      try {
        console.log(`🔍 Original translation data for ${translation.languages_code}:`, Object.keys(translation));
        
        // Rimuovi tutti i campi problematici che potrebbero non esistere in produzione
        const translationData = { ...translation };
        const fieldsToRemove = ['id', 'date_created', 'date_updated', 'user_created', 'user_updated'];
        
        fieldsToRemove.forEach(field => {
          if (field in translationData) {
            delete translationData[field];
            console.log(`🗑️ Removed field: ${field}`);
          }
        });

        console.log(`✅ Clean translation data for ${translation.languages_code}:`, Object.keys(translationData));

        // Costruisci query di upsert
        const fields = Object.keys(translationData);
        const values = Object.values(translationData);
        const placeholders = fields.map((_, index) => `$${index + 1}`);

        // Prima elimina la traduzione esistente se presente
        const deleteQuery = `
          DELETE FROM ${translationTable} 
          WHERE ${foreignKeyField} = $1 AND languages_code = $2
        `;
        
        const deleteResult = await productionClient.query(deleteQuery, [translation[foreignKeyField], translation.languages_code]);
        
        if (deleteResult.rowCount && deleteResult.rowCount > 0) {
          console.log(`🗑️ Deleted existing ${translation.languages_code} translation from production`);
        }

        // Poi inserisci la nuova traduzione
        const insertQuery = `
          INSERT INTO ${translationTable} (${fields.join(', ')})
          VALUES (${placeholders.join(', ')})
        `;

        console.log(`📝 SQL Query for ${translation.languages_code}:`, insertQuery);
        console.log(`📝 Values:`, values);

        await productionClient.query(insertQuery, values);
        syncCount++;

        console.log(`✅ Synced ${itemType} ${itemId} translation for ${translation.languages_code}`);

      } catch (error) {
        const errorMsg = `Failed to sync ${translation.languages_code}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronized ${syncCount} translations from staging to production`,
      itemType,
      itemId,
      syncedCount: syncCount,
      totalFound: stagingResult.rows.length,
      errors: errors.length > 0 ? errors : undefined,
      syncedLanguages: stagingResult.rows.map((row: any) => row.languages_code)
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync translations' },
      { status: 500 }
    );
  } finally {
    await stagingClient.end();
    await productionClient.end();
  }
}

// API per ottenere lo stato delle traduzioni (staging vs produzione)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');

  if (!itemType || !itemId) {
    return NextResponse.json(
      { error: 'Missing itemType or itemId parameters' },
      { status: 400 }
    );
  }

  const stagingClient = new Client({ connectionString: STAGING_DB_URL });
  const productionClient = new Client({ connectionString: PRODUCTION_DB_URL });

  try {
    await stagingClient.connect();
    await productionClient.connect();

    // Gestisci plurali irregolari per le tabelle di traduzione
    const getTranslationTableName = (type: string): string => {
      switch (type) {
        case 'company':
          return 'companies_translations';
        case 'article':
          return 'articles_translations';
        case 'destination':
          return 'destinations_translations';
        default:
          return `${type}s_translations`;
      }
    };
    
    const getForeignKeyField = (type: string): string => {
      switch (type) {
        case 'company':
          return 'companies_id';
        case 'article':
          return 'articles_id';
        case 'destination':
          return 'destinations_id';
        default:
          return `${type}s_id`;
      }
    };

    const translationTable = getTranslationTableName(itemType);
    const foreignKeyField = getForeignKeyField(itemType);

    const query = `
      SELECT languages_code 
      FROM ${translationTable} 
      WHERE ${foreignKeyField} = $1
    `;

    const [stagingResult, productionResult] = await Promise.all([
      stagingClient.query(query, [parseInt(itemId)]),
      productionClient.query(query, [parseInt(itemId)])
    ]);

    const stagingLanguages = stagingResult.rows.map((row: any) => ({
      code: row.languages_code
    }));

    const productionLanguages = productionResult.rows.map((row: any) => ({
      code: row.languages_code
    }));

    return NextResponse.json({
      itemType,
      itemId: parseInt(itemId),
      staging: {
        count: stagingLanguages.length,
        languages: stagingLanguages
      },
      production: {
        count: productionLanguages.length,
        languages: productionLanguages
      },
      canSync: stagingLanguages.length > 0
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check translation status' },
      { status: 500 }
    );
  } finally {
    await stagingClient.end();
    await productionClient.end();
  }
} 