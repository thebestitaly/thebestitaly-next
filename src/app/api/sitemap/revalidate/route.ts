import { NextRequest, NextResponse } from 'next/server';

// Riferimento alla cache delle sitemap (stesso Map usato in sitemap.xml)
// In produzione, questo dovrebbe essere sostituito con Redis o un altro store persistente
const sitemapCache = new Map<string, { data: string; timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    // Verifica token di autorizzazione
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SITEMAP_REVALIDATE_TOKEN || 'your-secret-token';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { lang, action } = body;

    if (action === 'clear-all') {
      // Pulisci tutta la cache
      sitemapCache.clear();
      console.log('All sitemap cache cleared');
      
      return NextResponse.json({
        success: true,
        message: 'All sitemap cache cleared',
        clearedEntries: 'all'
      });
    }

    if (action === 'clear-lang' && lang) {
      // Pulisci cache per una lingua specifica
      const cacheKey = `sitemap-${lang}`;
      const deleted = sitemapCache.delete(cacheKey);
      
      console.log(`Sitemap cache cleared for language: ${lang}`);
      
      return NextResponse.json({
        success: true,
        message: `Sitemap cache cleared for language: ${lang}`,
        clearedEntries: deleted ? 1 : 0
      });
    }

    if (action === 'status') {
      // Mostra stato della cache
      const cacheStatus = Array.from(sitemapCache.entries()).map(([key, value]) => ({
        key,
        timestamp: new Date(value.timestamp).toISOString(),
        age: Math.round((Date.now() - value.timestamp) / 1000 / 60), // età in minuti
        size: Math.round(value.data.length / 1024) // dimensione in KB
      }));

      return NextResponse.json({
        success: true,
        cacheEntries: cacheStatus.length,
        entries: cacheStatus
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: clear-all, clear-lang, or status' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in sitemap revalidate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET per controllare lo stato della cache
  try {
    const cacheStatus = Array.from(sitemapCache.entries()).map(([key, value]) => ({
      key,
      timestamp: new Date(value.timestamp).toISOString(),
      age: Math.round((Date.now() - value.timestamp) / 1000 / 60), // età in minuti
      size: Math.round(value.data.length / 1024) // dimensione in KB
    }));

    return NextResponse.json({
      success: true,
      cacheEntries: cacheStatus.length,
      entries: cacheStatus,
      cacheDuration: '24 hours',
      usage: {
        description: 'POST with Bearer token to clear cache',
        actions: {
          'clear-all': 'Clear all sitemap cache',
          'clear-lang': 'Clear cache for specific language (requires lang parameter)',
          'status': 'Get cache status'
        }
      }
    });

  } catch (error) {
    console.error('Error getting sitemap cache status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 