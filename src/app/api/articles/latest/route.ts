import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';
import { getCache, setCache, CacheKeys } from '../../../../lib/redis-cache';

// Cache duration: 12 hours for latest articles
const LATEST_ARTICLES_TTL = 60 * 60 * 12; // 12 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    console.log('Fetching latest articles for lang:', lang);
    
    // Check cache first
    const cacheKey = CacheKeys.latestArticles(lang);
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      console.log(`✅ Cache HIT for latest articles ${lang}: ${cachedData.data?.length || 0} articles`);
      return NextResponse.json(cachedData);
    }
    
    console.log(`📭 Cache MISS for latest articles ${lang}, fetching from Directus`);
    
    // Fetch fresh data
    const latestArticlesData: any = await directusClient.getLatestArticlesForHomepage(lang);
    
    const response = {
      data: latestArticlesData || [],
      total: latestArticlesData?.length || 0
    };
    
    // Save to cache
    await setCache(cacheKey, response, LATEST_ARTICLES_TTL);
    console.log(`💾 Cached latest articles for ${lang}: ${response.data.length} articles`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 