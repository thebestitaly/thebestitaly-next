import { NextRequest, NextResponse } from 'next/server';
import directusWebClient from '../../../../lib/directus-web';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 [CACHE CLEAR API] Starting cache clear...');
    
    // Clear all caches
    await directusWebClient.forceClearAllCache();
    
    console.log('✅ [CACHE CLEAR API] Cache cleared successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [CACHE CLEAR API] Error clearing cache:', error);
    return NextResponse.json({ 
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 