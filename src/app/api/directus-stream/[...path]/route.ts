import { NextRequest, NextResponse } from 'next/server';

// 🚀 STREAMING PROXY - Zero Memory Footprint
// Replaces /api/directus/[...path] with pure streaming implementation

// 1x1 transparent PNG as base64 (43 bytes)
const TRANSPARENT_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Configuration from environment
const MAX_BUFFER_SIZE = parseInt(process.env.MAX_BUFFER_SIZE || '10485760'); // 10MB
const STREAM_TIMEOUT = parseInt(process.env.STREAM_TIMEOUT || '30000'); // 30s
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_CONNECTIONS || '20');
const MEMORY_THRESHOLD_PERCENT = parseInt(process.env.MEMORY_THRESHOLD_PERCENT || '80');

// Global state tracking
let activeConcurrentRequests = 0;

/**
 * 🧠 MEMORY MONITOR
 * Checks memory usage and returns true if safe to proceed
 */
function checkMemoryUsage(): boolean {
  const usage = process.memoryUsage();
  const memoryUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
  
  if (memoryUsagePercent > MEMORY_THRESHOLD_PERCENT) {
    console.error(`🚨 STREAMING PROXY: Memory usage critical: ${memoryUsagePercent.toFixed(2)}%`, {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    });
    return false;
  }
  
  if (process.env.ENABLE_MEMORY_LOGGING === 'true') {
    console.log(`💾 Memory: ${memoryUsagePercent.toFixed(1)}% (${Math.round(usage.heapUsed / 1024 / 1024)}MB)`);
  }
  
  return true;
}

/**
 * 🚨 CIRCUIT BREAKER
 * Returns 503 if system is under stress
 */
function checkSystemHealth(): NextResponse | null {
  // Memory check
  if (!checkMemoryUsage()) {
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable due to high memory usage',
        code: 'MEMORY_PRESSURE'
      },
      { status: 503, headers: { 'Retry-After': '30' } }
    );
  }

  // Concurrency check
  if (activeConcurrentRequests >= MAX_CONCURRENT) {
    console.warn(`⚠️ STREAMING PROXY: Max concurrent requests reached: ${activeConcurrentRequests}`);
    return NextResponse.json(
      { 
        error: 'Service temporarily busy - too many concurrent requests',
        code: 'CONCURRENCY_LIMIT'
      },
      { status: 503, headers: { 'Retry-After': '10' } }
    );
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  
  // Circuit breaker check
  const healthCheck = checkSystemHealth();
  if (healthCheck) return healthCheck;

  activeConcurrentRequests++;
  
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const url = new URL(request.url);
    const isImageRequest = url.pathname.includes('/assets/');
    
    // 🔧 Bot blocking for IMAGE requests (same logic as original)
    if (isImageRequest) {
      const isBot = 
        /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(userAgent) ||
        /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(userAgent) ||
        /semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|blexbot/i.test(userAgent) ||
        /crawler|spider|scraper|wget/i.test(userAgent) ||
        userAgent === '' || userAgent.length < 5;
      
      if (isBot) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚫 STREAMING PROXY: BLOCKED BOT IMAGE REQUEST:', { userAgent, path: url.pathname });
        }
        const buffer = Buffer.from(TRANSPARENT_PNG, 'base64');
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
            'Content-Length': buffer.length.toString(),
          },
        });
      }

      // Block oversized image requests
      const width = parseInt(url.searchParams.get('width') || '0');
      const quality = parseInt(url.searchParams.get('quality') || '100');
      
      if (width > 1201 || quality > 85) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚨 STREAMING PROXY: Blocked large image request', { width, quality });
        }
        const buffer = Buffer.from(TRANSPARENT_PNG, 'base64');
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    // Build target URL
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-93f0.up.railway.app';
    if (!directusUrl) {
      return NextResponse.json(
        { error: 'Directus URL not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = `${directusUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`🌊 STREAMING PROXY: ${fullUrl}`);

    // Prepare headers for Directus
    const adminToken = process.env.DIRECTUS_TOKEN;
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
    const token = adminToken || publicToken;
    
    const proxyHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      proxyHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 🌊 PURE STREAMING - No buffering, direct pipe
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: proxyHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ STREAMING PROXY: ${response.status} ${response.statusText}`);
        return NextResponse.json(
          { error: `Directus error: ${response.statusText}` },
          { status: response.status }
        );
      }

      // Get content type and size info
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');
      
      // Check if content size exceeds our limits
      if (contentLength && parseInt(contentLength) > MAX_BUFFER_SIZE) {
        console.warn(`⚠️ STREAMING PROXY: Large content detected: ${Math.round(parseInt(contentLength) / 1024 / 1024)}MB`);
        
        // For very large content, we still stream but log it
        if (parseInt(contentLength) > MAX_BUFFER_SIZE * 2) {
          return NextResponse.json(
            { error: 'Content too large for processing' },
            { status: 413 }
          );
        }
      }

      // 🚀 ZERO-COPY STREAMING - Direct pipe from Directus to client
      const streamHeaders: Record<string, string> = {
        'Content-Type': contentType,
      };

      // Add caching headers based on content type
      if (contentType.includes('image/')) {
        streamHeaders['Cache-Control'] = 'public, max-age=31536000, immutable';
      } else if (contentType.includes('application/json')) {
        streamHeaders['Cache-Control'] = 'public, max-age=300'; // 5 minutes for API responses
      } else {
        streamHeaders['Cache-Control'] = 'public, max-age=3600'; // 1 hour default
      }

      if (contentLength) {
        streamHeaders['Content-Length'] = contentLength;
      }

      const elapsed = Date.now() - startTime;
      console.log(`✅ STREAMING PROXY: Response streamed in ${elapsed}ms (${contentType})`);

      // Return streaming response - NO BUFFERING
      return new NextResponse(response.body, {
        status: response.status,
        headers: streamHeaders,
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`⏰ STREAMING PROXY: Request timeout after ${STREAM_TIMEOUT}ms`);
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ STREAMING PROXY ERROR (${elapsed}ms):`, error.message);
    
    return NextResponse.json(
      { error: 'Internal proxy error', details: error.message },
      { status: 500 }
    );
  } finally {
    activeConcurrentRequests = Math.max(0, activeConcurrentRequests - 1);
    
    // Log final memory state for monitoring
    if (process.env.ENABLE_MEMORY_LOGGING === 'true') {
      const usage = process.memoryUsage();
      const elapsed = Date.now() - startTime;
      console.log(`📊 STREAMING PROXY: Request completed in ${elapsed}ms, active: ${activeConcurrentRequests}, memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
    }
  }
}

// Block write operations explicitly
export async function POST() {
  return NextResponse.json(
    { error: 'POST operations not allowed through streaming proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'PUT operations not allowed through streaming proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'DELETE operations not allowed through streaming proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'PATCH operations not allowed through streaming proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
} 