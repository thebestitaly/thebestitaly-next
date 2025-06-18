import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getDatabaseConfig } from '@/lib/staging-config';

// Configurazioni database con controllo errori e debug
let STAGING_DB_URL: string;
let PRODUCTION_DB_URL: string;

try {
  // Debug delle variabili d'ambiente
  console.log('🔧 Environment variables check:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    STAGING_DATABASE_URL: !!process.env.STAGING_DATABASE_URL,
    PRODUCTION_DATABASE_URL: !!process.env.PRODUCTION_DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
    STAGING_DATABASE_URL_length: process.env.STAGING_DATABASE_URL?.length || 0,
    DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 50) + '...',
    STAGING_DATABASE_URL_preview: process.env.STAGING_DATABASE_URL?.substring(0, 50) + '...'
  });

  const stagingConfig = getDatabaseConfig(true);
  const productionConfig = getDatabaseConfig(false);
  
  STAGING_DB_URL = stagingConfig.url;
  PRODUCTION_DB_URL = productionConfig.url;
  
  console.log('🔧 Database config loaded:', {
    staging: !!STAGING_DB_URL,
    production: !!PRODUCTION_DB_URL,
    stagingLength: STAGING_DB_URL?.length || 0,
    productionLength: PRODUCTION_DB_URL?.length || 0,
    stagingPreview: STAGING_DB_URL?.substring(0, 50) + '...',
    productionPreview: PRODUCTION_DB_URL?.substring(0, 50) + '...'
  });
} catch (configError) {
  console.error('❌ Error loading database config:', configError);
  // Fallback diretto alle variabili d'ambiente
  STAGING_DB_URL = process.env.STAGING_DATABASE_URL || '';
  PRODUCTION_DB_URL = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL || '';
}

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

  console.log(`🔍 Translation status check: itemType=${itemType}, itemId=${itemId}`);

  if (!itemType || !itemId) {
    console.error('❌ Missing parameters:', { itemType, itemId });
    return NextResponse.json(
      { error: 'Missing itemType or itemId parameters' },
      { status: 400 }
    );
  }

  // Verifica configurazione database
  if (!STAGING_DB_URL || !PRODUCTION_DB_URL) {
    console.error('❌ Database URLs not configured:', {
      staging: !!STAGING_DB_URL,
      production: !!PRODUCTION_DB_URL
    });
    return NextResponse.json(
      { error: 'Database configuration missing' },
      { status: 500 }
    );
  }

  const stagingClient = new Client({ 
    connectionString: STAGING_DB_URL,
    connectionTimeoutMillis: 5000, // 5 secondi timeout
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  const productionClient = new Client({ 
    connectionString: PRODUCTION_DB_URL,
    connectionTimeoutMillis: 5000, // 5 secondi timeout
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to databases...');
    await Promise.all([
      stagingClient.connect(),
      productionClient.connect()
    ]);
    console.log('✅ Connected to both databases');

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

    console.log(`📋 Using table: ${translationTable}, field: ${foreignKeyField}`);

    // Prima verifica se la tabella esiste
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;

    try {
      const [stagingTableCheck, productionTableCheck] = await Promise.all([
        stagingClient.query(tableExistsQuery, [translationTable]),
        productionClient.query(tableExistsQuery, [translationTable])
      ]);

      const stagingTableExists = stagingTableCheck.rows[0]?.exists;
      const productionTableExists = productionTableCheck.rows[0]?.exists;

      console.log(`📊 Table existence: staging=${stagingTableExists}, production=${productionTableExists}`);

      if (!stagingTableExists) {
        return NextResponse.json({
          error: `Table ${translationTable} does not exist in staging database`,
          itemType,
          itemId,
          staging: { count: 0, languages: [] },
          production: { count: 0, languages: [] },
          canSync: false
        });
      }

      if (!productionTableExists) {
        return NextResponse.json({
          error: `Table ${translationTable} does not exist in production database`,
          itemType,
          itemId,
          staging: { count: 0, languages: [] },
          production: { count: 0, languages: [] },
          canSync: false
        });
      }
    } catch (tableCheckError) {
      console.error('❌ Error checking table existence:', tableCheckError);
      return NextResponse.json({
        error: 'Failed to verify table existence',
        details: tableCheckError instanceof Error ? tableCheckError.message : 'Unknown error',
        itemType,
        itemId
      }, { status: 500 });
    }

    const query = `
      SELECT languages_code 
      FROM ${translationTable} 
      WHERE ${foreignKeyField} = $1
    `;

    console.log(`🔍 Executing query: ${query} with itemId=${itemId}`);

    const [stagingResult, productionResult] = await Promise.all([
      stagingClient.query(query, [parseInt(itemId)]),
      productionClient.query(query, [parseInt(itemId)])
    ]);

    console.log(`📊 Results: staging=${stagingResult.rows.length}, production=${productionResult.rows.length}`);

    const stagingLanguages = stagingResult.rows.map((row: any) => ({
      code: row.languages_code
    }));

    const productionLanguages = productionResult.rows.map((row: any) => ({
      code: row.languages_code
    }));

    const result = {
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
    };

    console.log('✅ Status check successful:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Status check error:', error);
    
    // Log dettagliato dell'errore
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to check translation status',
        details: error instanceof Error ? error.message : 'Unknown error',
        itemType,
        itemId
      },
      { status: 500 }
    );
  } finally {
    try {
      await stagingClient.end();
      await productionClient.end();
      console.log('🔌 Database connections closed');
    } catch (closeError) {
      console.error('Error closing connections:', closeError);
    }
  }
} 