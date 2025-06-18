import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  const debug = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    variables: {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0,
        preview: process.env.DATABASE_URL?.substring(0, 50) + '...' || 'NOT_SET'
      },
      STAGING_DATABASE_URL: {
        exists: !!process.env.STAGING_DATABASE_URL,
        length: process.env.STAGING_DATABASE_URL?.length || 0,
        preview: process.env.STAGING_DATABASE_URL?.substring(0, 50) + '...' || 'NOT_SET'
      },
      PRODUCTION_DATABASE_URL: {
        exists: !!process.env.PRODUCTION_DATABASE_URL,
        length: process.env.PRODUCTION_DATABASE_URL?.length || 0,
        preview: process.env.PRODUCTION_DATABASE_URL?.substring(0, 50) + '...' || 'NOT_SET'
      }
    },
    connections: {
      staging: null as any,
      production: null as any
    }
  };

  // Test connessioni database
  const stagingUrl = process.env.STAGING_DATABASE_URL;
  const productionUrl = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;

  // Test connessione staging
  if (stagingUrl) {
    try {
      const stagingClient = new Client({ 
        connectionString: stagingUrl,
        connectionTimeoutMillis: 5000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await stagingClient.connect();
      
      const result = await stagingClient.query('SELECT current_database(), version()');
      debug.connections.staging = {
        status: 'SUCCESS',
        database: result.rows[0]?.current_database,
        version: result.rows[0]?.version?.substring(0, 50) + '...'
      };
      
      await stagingClient.end();
    } catch (error) {
      debug.connections.staging = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } else {
    debug.connections.staging = {
      status: 'NO_URL',
      error: 'STAGING_DATABASE_URL not set'
    };
  }

  // Test connessione production
  if (productionUrl) {
    try {
      const productionClient = new Client({ 
        connectionString: productionUrl,
        connectionTimeoutMillis: 5000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await productionClient.connect();
      
      const result = await productionClient.query('SELECT current_database(), version()');
      debug.connections.production = {
        status: 'SUCCESS',
        database: result.rows[0]?.current_database,
        version: result.rows[0]?.version?.substring(0, 50) + '...'
      };
      
      await productionClient.end();
    } catch (error) {
      debug.connections.production = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } else {
    debug.connections.production = {
      status: 'NO_URL',
      error: 'DATABASE_URL not set'
    };
  }

  return NextResponse.json(debug, { status: 200 });
} 