import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getDatabaseConfig } from '@/lib/staging-config';

const STAGING_DB_URL = getDatabaseConfig(true).url;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';

  if (!type || !id) {
    return NextResponse.json(
      { error: 'Missing type or id parameters' },
      { status: 400 }
    );
  }

  const stagingClient = new Client({ connectionString: STAGING_DB_URL });

  try {
    await stagingClient.connect();

    // Gestisci plurali irregolari per le tabelle di traduzione
    const getTranslationTableName = (itemType: string): string => {
      switch (itemType) {
        case 'company':
          return 'companies_translations';
        case 'article':
          return 'articles_translations';
        case 'destination':
          return 'destinations_translations';
        default:
          return `${itemType}s_translations`;
      }
    };
    
    const getForeignKeyField = (itemType: string): string => {
      switch (itemType) {
        case 'company':
          return 'companies_id';
        case 'article':
          return 'articles_id';
        case 'destination':
          return 'destinations_id';
        default:
          return `${itemType}s_id`;
      }
    };

    const translationTable = getTranslationTableName(type);
    const foreignKeyField = getForeignKeyField(type);

    // Query per ottenere la traduzione specifica
    const query = `
      SELECT * FROM ${translationTable} 
      WHERE ${foreignKeyField} = $1 AND languages_code = $2
    `;

    const result = await stagingClient.query(query, [parseInt(id), lang]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: `Translation not found for ${type} ${id} in ${lang}` },
        { status: 404 }
      );
    }

    const translation = result.rows[0];

    // Formatta il contenuto in base al tipo
    let content = '';
    
    if (type === 'article') {
      content = `# ${translation.titolo_articolo || 'Untitled'}

## SEO Summary
${translation.seo_summary || 'No SEO summary available'}

## Content
${translation.description || 'No content available'}`;
    } else if (type === 'company') {
      content = `# ${translation.seo_title || 'Company'}

## SEO Summary
${translation.seo_summary || 'No SEO summary available'}

## Description
${translation.description || 'No description available'}`;
    } else if (type === 'destination') {
      content = `# ${translation.destination_name || 'Destination'}

## SEO Summary
${translation.seo_summary || 'No SEO summary available'}

## Description
${translation.description || 'No description available'}`;
    }

    return NextResponse.json({
      success: true,
      itemType: type,
      itemId: parseInt(id),
      language: lang,
      content: content,
      rawData: translation
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translation preview' },
      { status: 500 }
    );
  } finally {
    await stagingClient.end();
  }
} 