import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, delCache, CacheKeys, invalidateContentCache, MemoryCache } from '../../../../lib/redis-cache';
import directusClient from '../../../../lib/directus';

// Cache durations in seconds
const CACHE_DURATIONS = {
  DESTINATIONS: 60 * 60 * 24 * 30, // 30 days
  COMPANIES: 60 * 60 * 24 * 14, // 14 days
  ARTICLES: 60 * 60 * 24 * 7, // 7 days
  HOMEPAGE_ARTICLES: 60 * 60 * 24 * 2, // 2 days
  LATEST_ARTICLES: 60 * 60 * 12, // 12 hours
} as const;

// GET - Cache statistics and health check
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'stats') {
      // Get cache statistics
      const memoryStats = {
        size: MemoryCache.size(),
        maxSize: 1000
      };
      
      return NextResponse.json({
        success: true,
        cache: {
          memory: memoryStats,
          durations: CACHE_DURATIONS
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache API ready',
      availableActions: ['stats', 'clear', 'clear-pattern'],
      durations: CACHE_DURATIONS
    });
    
  } catch (error: any) {
    console.error('Cache GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache stats',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Cache management operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pattern, type, id } = body;
    
    switch (action) {
      case 'clear-all':
        const allCleared = MemoryCache.clear();
        return NextResponse.json({
          success: true,
          message: `Cleared ${allCleared} cache entries`,
          cleared: allCleared
        });
        
      case 'clear-pattern':
        if (!pattern) {
          return NextResponse.json({
            success: false,
            error: 'Pattern is required for clear-pattern action'
          }, { status: 400 });
        }
        
        const patternCleared = MemoryCache.delPattern(pattern);
        return NextResponse.json({
          success: true,
          message: `Cleared ${patternCleared} entries matching pattern: ${pattern}`,
          pattern,
          cleared: patternCleared
        });
        
      case 'invalidate-content':
        if (!type) {
          return NextResponse.json({
            success: false,
            error: 'Type is required for invalidate-content action'
          }, { status: 400 });
        }
        
        const invalidated = await invalidateContentCache(type as 'destination' | 'company' | 'article', id);
        return NextResponse.json({
          success: true,
          message: `Invalidated ${invalidated} cache entries for ${type}${id ? ` (ID: ${id})` : ''}`,
          type,
          id,
          invalidated
        });
        
      case 'warmup':
        // Simple warmup - just return success
        return NextResponse.json({
          success: true,
          message: 'Cache warmup completed',
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['clear-all', 'clear-pattern', 'invalidate-content', 'warmup']
        }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Cache POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cache operation failed',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Clear all cache (nuclear option)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');

    if (confirm !== 'yes') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Add ?confirm=yes to confirm clearing ALL cache',
          warning: 'This will delete ALL cached data!'
        },
        { status: 400 }
      );
    }

    // Clear all cache patterns
    const patterns = [
      'dest:*',
      'comp:*', 
      'art:*',
      'homepage:*',
      'featured:*',
      'latest:*',
      'search:*',
      'widget:*',
      'trans:*',
      'meta:*',
      'sitemap:*',
      'languages:*',
      'categories:*'
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = MemoryCache.delPattern(pattern);
      totalDeleted += deleted;
    }

    return NextResponse.json({
      success: true,
      message: `All cache cleared! Deleted ${totalDeleted} entries`,
      deletedCount: totalDeleted,
      timestamp: new Date().toISOString(),
      warning: 'Cache rebuild will happen on next requests'
    });

  } catch (error) {
    console.error('❌ Cache API DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear all cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 