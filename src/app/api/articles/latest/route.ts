import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    console.log('🔥 [LATEST ARTICLES API] Fetching for lang:', lang);
    
    // Direct call - cache managed at Redis layer
    const latestArticlesData: any = await directusClient.getLatestArticlesForHomepage(lang);
    
    const response = {
      data: latestArticlesData || [],
      total: latestArticlesData?.length || 0
    };
    
    console.log(`✅ [LATEST ARTICLES API] Returning ${response.data.length} articles for ${lang}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [LATEST ARTICLES API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 