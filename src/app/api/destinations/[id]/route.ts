import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';
import { getCache, setCache, CacheKeys } from '../../../../lib/redis-cache';

// Cache duration: 30 days for destinations (very stable data)
const DESTINATIONS_TTL = 60 * 60 * 24 * 30; // 30 days

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'it';
    
    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' }, 
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = CacheKeys.destination(id, lang);
    const cachedDestination = await getCache(cacheKey);
    
    if (cachedDestination) {
      console.log(`✅ Cache HIT for destination ${id} (${lang})`);
      return NextResponse.json({ 
        success: true, 
        data: cachedDestination,
        cached: true
      });
    }
    
    console.log(`📭 Cache MISS for destination ${id} (${lang}), fetching from Directus`);
    
    // Fetch fresh data
    const destination: any = await directusClient.getDestinationById(id, lang);

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' }, 
        { status: 404 }
      );
    }

    // Save to cache with long TTL (destinations rarely change)
    await setCache(cacheKey, destination, DESTINATIONS_TTL);
    console.log(`💾 Cached destination ${id} (${lang}) for ${DESTINATIONS_TTL/86400} days`);

    return NextResponse.json({ 
      success: true, 
      data: destination,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destination' }, 
      { status: 500 }
    );
  }
} 