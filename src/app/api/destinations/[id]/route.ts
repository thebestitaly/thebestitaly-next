import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';
import { RedisCache, CACHE_DURATIONS, CacheKeys } from '../../../../lib/redis-cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'it';
    const resolvedParams = await params;
    const destinationId = resolvedParams.id;

    console.log(`Fetching destination ${destinationId} for lang: ${lang}`);
    
    // CACHE ULTRA-AGGRESSIVA per destinazioni singole
    const cacheKey = CacheKeys.destination(destinationId, lang);
    const cachedDestination = await RedisCache.get<any>(cacheKey);
    
    if (cachedDestination) {
      console.log(`✅ Cache HIT for destination ${destinationId} (${lang})`);
      return NextResponse.json(cachedDestination);
    }
    
    console.log(`📭 Cache MISS for destination ${destinationId} (${lang}), fetching from Directus`);
    
    // Ottieni la destinazione dal directus client
    const destination = await directusClient.getDestinationById(destinationId, lang);
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    // SALVA IN CACHE con TTL ottimizzato per destinazioni (contenuto ultra-stabile)
    await RedisCache.set(cacheKey, destination, CACHE_DURATIONS.DESTINATION_DETAIL);
    console.log(`💾 Cached destination ${destinationId} for ${lang} (TTL: ${CACHE_DURATIONS.DESTINATION_DETAIL}s)`);

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json({ error: 'Failed to fetch destination' }, { status: 500 });
  }
} 