import { NextRequest, NextResponse } from 'next/server';
import { RedisCache, invalidateContentCache } from '@/lib/redis-cache';

// GET - Cache statistics and health check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = await RedisCache.getStats();
      const ping = await RedisCache.ping();
      
      return NextResponse.json({
        success: true,
        connected: ping,
        stats: stats,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'ping') {
      const ping = await RedisCache.ping();
      return NextResponse.json({
        success: true,
        connected: ping,
        message: ping ? 'Redis is connected' : 'Redis is not connected'
      });
    }

    // Default: return basic info
    const ping = await RedisCache.ping();
    return NextResponse.json({
      success: true,
      connected: ping,
      message: 'Redis cache API is working',
      availableActions: [
        'GET ?action=stats - Get cache statistics',
        'GET ?action=ping - Check Redis connection',
        'POST - Clear cache (with body: {action, type, id})',
        'DELETE - Clear all cache'
      ]
    });

  } catch (error) {
    console.error('❌ Cache API GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cache information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Clear specific cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, id, pattern } = body;

    if (action === 'clear-content') {
      if (!type || !['destination', 'company', 'article'].includes(type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid type. Must be: destination, company, or article' },
          { status: 400 }
        );
      }

      await invalidateContentCache(type, id);
      
      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${type}${id ? ` ID: ${id}` : ' (all)'}`,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'clear-pattern') {
      if (!pattern) {
        return NextResponse.json(
          { success: false, error: 'Pattern is required' },
          { status: 400 }
        );
      }

      const deletedCount = await RedisCache.delPattern(pattern);
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${deletedCount} cache entries matching pattern: ${pattern}`,
        deletedCount,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'clear-key') {
      if (!body.key) {
        return NextResponse.json(
          { success: false, error: 'Key is required' },
          { status: 400 }
        );
      }

      const deleted = await RedisCache.del(body.key);
      
      return NextResponse.json({
        success: true,
        message: `Cache key ${deleted ? 'deleted' : 'not found'}: ${body.key}`,
        deleted,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: clear-content, clear-pattern, or clear-key' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Cache API POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
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
      const deleted = await RedisCache.delPattern(pattern);
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