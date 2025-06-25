import { NextRequest, NextResponse } from 'next/server';
import { RedisCache, CACHE_DURATIONS, CacheKeys, invalidateContentCache } from '../../../../lib/redis-cache';
import directusClient from '../../../../lib/directus';

// GET - Cache statistics and health check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'stats':
      return await getCacheStats();
    case 'clear':
      return await clearCache();
    case 'prepopulate':
      return await prepopulateCache();
    case 'prepopulate-critical':
      return await prepopulateCriticalContent();
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function getCacheStats() {
  try {
    const stats = await RedisCache.getStats();
    return NextResponse.json({
      success: true,
      connected: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: 'Failed to get cache stats'
    }, { status: 500 });
  }
}

async function clearCache() {
  try {
    // Clear all cache patterns
    const patterns = [
      'dest:*',      // All destinations
      'art:*',       // All articles  
      'comp:*',      // All companies
      'latest:*',    // Latest articles
      'homepage:*',  // Homepage content
      'featured:*',  // Featured content
      'menu:*',      // Menu content
      'sidebar:*',   // Sidebar components
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await RedisCache.delPattern(pattern);
      totalDeleted += deleted;
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared: ${totalDeleted} keys deleted`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 });
  }
}

async function prepopulateCache() {
  try {
    const results = {
      regions: 0,
      articles: 0,
      destinations: 0,
      errors: [] as string[]
    };

    const languages = ['it', 'en', 'fr', 'de', 'es'];

    // Pre-populate per ogni lingua
    for (const lang of languages) {
      try {
        // 1. Pre-carica regioni per menu (PRIORITÀ MASSIMA)
        console.log(`🔥 Pre-populating menu regions for ${lang}`);
        const regions = await directusClient.getDestinationsByType('region', lang);
        const menuCacheKey = CacheKeys.menuDestinations('region', lang);
        await RedisCache.set(menuCacheKey, regions, CACHE_DURATIONS.MENU_DESTINATIONS);
        results.regions += regions.length;

        // 2. Pre-carica articoli homepage (PRIORITÀ MASSIMA)
        console.log(`🔥 Pre-populating homepage articles for ${lang}`);
        const homepageArticles = await directusClient.getHomepageArticles(lang);
        const homepageArticlesCacheKey = CacheKeys.latestArticles(lang + '_homepage');
        await RedisCache.set(homepageArticlesCacheKey, homepageArticles, CACHE_DURATIONS.HOMEPAGE_ARTICLES);
        results.articles += homepageArticles.length;

        // 3. Pre-carica latest articles (ALTA PRIORITÀ)
        console.log(`🔥 Pre-populating latest articles for ${lang}`);
        const latestArticles = await directusClient.getLatestArticlesForHomepage(lang);
        const latestArticlesCacheKey = CacheKeys.latestArticles(lang);
        await RedisCache.set(latestArticlesCacheKey, latestArticles, CACHE_DURATIONS.LATEST_ARTICLES);

        // 4. Pre-carica destinazioni homepage (ALTA PRIORITÀ)
        console.log(`🔥 Pre-populating homepage destinations for ${lang}`);
        const homepageDestinations = await directusClient.getHomepageDestinations(lang);
        const homepageDestCacheKey = CacheKeys.homepageDestinations(lang);
        await RedisCache.set(homepageDestCacheKey, homepageDestinations, CACHE_DURATIONS.HOMEPAGE_DESTINATIONS);
        results.destinations += homepageDestinations.length;

        // 5. Pre-carica featured companies (ALTA PRIORITÀ) - RIMOSSO per ora
        // console.log(`🔥 Pre-populating featured companies for ${lang}`);
        // const featuredCompanies = await directusClient.getFeaturedCompanies(lang);
        // const featuredCompaniesCacheKey = CacheKeys.featuredCompanies(lang);
        // await RedisCache.set(featuredCompaniesCacheKey, featuredCompanies, CACHE_DURATIONS.FEATURED_COMPANIES);

      } catch (langError: any) {
        console.error(`Error pre-populating for ${lang}:`, langError);
        results.errors.push(`${lang}: ${langError?.message || 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cache pre-populated successfully`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error pre-populating cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to pre-populate cache'
    }, { status: 500 });
  }
}

// NUOVA FUNZIONE: Pre-populate solo contenuti ultra-critici (veloce)
async function prepopulateCriticalContent() {
  try {
    const results = {
      cached_items: 0,
      languages: 0,
      duration_ms: 0
    };

    const startTime = Date.now();
    const languages = ['it', 'en']; // Solo lingue principali per velocità

    for (const lang of languages) {
      try {
        // SOLO i contenuti più critici con traffico massimo
        
        // 1. Menu regioni (richiesto da ogni pagina)
        const regions = await directusClient.getDestinationsByType('region', lang);
        await RedisCache.set(CacheKeys.menuDestinations('region', lang), regions, CACHE_DURATIONS.MENU_DESTINATIONS);
        results.cached_items += regions.length;

        // 2. Articoli homepage (molto richiesti)
        const homepageArticles = await directusClient.getHomepageArticles(lang);
        await RedisCache.set(CacheKeys.latestArticles(lang + '_homepage'), homepageArticles, CACHE_DURATIONS.HOMEPAGE_ARTICLES);
        results.cached_items += homepageArticles.length;

        // 3. Latest articles (sidebar e homepage)
        const latestArticles = await directusClient.getLatestArticlesForHomepage(lang);
        await RedisCache.set(CacheKeys.latestArticles(lang), latestArticles, CACHE_DURATIONS.LATEST_ARTICLES);
        results.cached_items += (latestArticles.articles?.length || 0);

        results.languages++;
        
      } catch (langError) {
        console.error(`Error in critical pre-population for ${lang}:`, langError);
      }
    }

    results.duration_ms = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Critical content cached in ${results.duration_ms}ms`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in critical pre-population:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to pre-populate critical content'
    }, { status: 500 });
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