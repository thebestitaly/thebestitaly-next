import { NextRequest, NextResponse } from 'next/server';

// Proxy per le operazioni di LETTURA del DirectusClient
// Le operazioni di SCRITTURA usano le API routes dedicate in /api/admin/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const url = new URL(request.url);
    const isImageRequest = url.pathname.includes('/assets/');
    
    // 🔧 ONLY block bots for IMAGE requests to save costs
    if (isImageRequest) {
      const isBot = 
        // Major search engines and social crawlers
        /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(userAgent) ||
        /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(userAgent) ||
        // SEO tools and monitoring
        /semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|blexbot/i.test(userAgent) ||
        // Bot patterns (removed curl for testing)
        /crawler|spider|scraper|wget/i.test(userAgent) ||
        // Empty or very short user agents (suspicious)
        userAgent === '' || userAgent.length < 5
      
      if (isBot) {
        console.log('🚫 BLOCKED BOT IMAGE REQUEST:', { userAgent, path: url.pathname });
        return new NextResponse('Bot access to images blocked - cost control', { status: 403 });
      }
    }
    
    if (isImageRequest) {
      const width = parseInt(url.searchParams.get('width') || '0');
      const quality = parseInt(url.searchParams.get('quality') || '100');
      
      // 🔧 ALLOW optimized images but block VERY large ones
      // Our optimized presets: MICRO (24x24), THUMBNAIL (60x60), CARD (150x100), HERO_MOBILE (300x200), HERO_DESKTOP (400x180)
      // Emergency: Allow up to 1000px but block original size images (usually 1920px+)
      if (width > 1000 || quality > 85) {
        console.log('🚨 EMERGENCY: Blocked large image request', { width, quality, userAgent });
        return new NextResponse('Image too large - emergency cost control', { status: 429 });
      }
    }

    // 🚨 CRITICAL FIX: NEVER forward directly to Railway!
    // Always use the Railway URL but through our domain for Cloudflare cache
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-93f0.up.railway.app';
    
    if (!directusUrl) {
      return NextResponse.json(
        { error: 'Directus URL not configured' },
        { status: 500 }
      );
    }

    // Await params per Next.js 15+
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = `${directusUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`📖 Directus Proxy (VIA PROXY): GET ${fullUrl}`);

    // Forward della richiesta a Directus con token di lettura
    // Prova prima il token admin, poi quello pubblico
    const adminToken = process.env.DIRECTUS_TOKEN;
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
    const token = adminToken || publicToken;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No Directus token found for authentication');
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`❌ Directus proxy error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Directus error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check content type to handle different response types
    const contentType = response.headers.get('content-type');
    
    // If it's an image or other binary content, return it directly
    if (contentType && !contentType.includes('application/json')) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        },
      });
    }

    // Try to parse JSON, but handle cases where it might not be valid JSON
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (jsonError) {
      // If JSON parsing fails, return the raw text
      const text = await response.text();
      return new NextResponse(text, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'text/plain',
        },
      });
    }

  } catch (error: any) {
    console.error('❌ Directus proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', details: error.message },
      { status: 500 }
    );
  }
}

// Blocchiamo esplicitamente le operazioni di scrittura
export async function POST() {
  return NextResponse.json(
    { error: 'POST operations not allowed through proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'PUT operations not allowed through proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'DELETE operations not allowed through proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'PATCH operations not allowed through proxy. Use /api/admin/ routes.' },
    { status: 405 }
  );
} 