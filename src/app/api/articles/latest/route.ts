import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';
import { RedisCache, CACHE_DURATIONS, CacheKeys } from '../../../../lib/redis-cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    console.log('Fetching latest articles for lang:', lang);
    
    // CACHE IMPLEMENTATION: Controlla prima Redis
    const cacheKey = CacheKeys.latestArticles(lang);
    const cachedArticles = await RedisCache.get<any>(cacheKey);
    
    if (cachedArticles) {
      console.log(`✅ Cache HIT for latest articles ${lang}: ${cachedArticles.articles?.length || 0} articles`);
      return NextResponse.json(cachedArticles);
    }
    
    console.log(`📭 Cache MISS for latest articles ${lang}, fetching from Directus`);
    
    // Ottieni gli articoli dal directus client
    const result = await directusClient.getLatestArticlesForHomepage(lang);
    
    // SALVA IN CACHE con TTL ottimizzato
    await RedisCache.set(cacheKey, result, CACHE_DURATIONS.LATEST_ARTICLES);
    console.log(`💾 Cached latest articles for ${lang}: ${result.articles?.length || 0} articles`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return NextResponse.json({ error: 'Failed to fetch latest articles' }, { status: 500 });
  }
} 