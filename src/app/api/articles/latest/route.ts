import { NextRequest, NextResponse } from 'next/server';
import directusWebClient from '../../../../lib/directus-web';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    console.log('🔥 [LATEST ARTICLES API] Fetching for lang:', lang);
    
    // Get latest articles (not featured) - exclude featured articles and category 9
    const latestArticlesData: any = await directusWebClient.getArticles({
      lang,
      fields: 'full',
      limit: 12,
      filters: {
        featured_status: { _neq: 'homepage' }, // Exclude featured articles
        category_id: { _neq: 9 } // Exclude category 9
      }
    });
    
    // Convert to array if needed
    const articles = Array.isArray(latestArticlesData) ? latestArticlesData : (latestArticlesData ? [latestArticlesData] : []);
    
    const response = {
      data: articles,
      total: articles.length
    };
    
    console.log(`✅ [LATEST ARTICLES API] Returning ${response.data.length} latest articles for ${lang}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [LATEST ARTICLES API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 