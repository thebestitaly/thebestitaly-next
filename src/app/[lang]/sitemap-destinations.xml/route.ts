import { NextRequest } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Force dynamic rendering - NON pre-generare durante il build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  
  try {
    // Prova a servire il file statico pre-generato
    const staticSitemapPath = join(process.cwd(), 'public', 'sitemaps', `destinations-${lang}.xml`);
    
    if (existsSync(staticSitemapPath)) {
      console.log(`📄 Serving static destinations sitemap for ${lang}`);
      
      const sitemap = readFileSync(staticSitemapPath, 'utf-8');
      
      return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000', // 1 anno
          'X-Cache-Status': 'STATIC'
        },
      });
    }
    
    // Fallback: sitemap vuota se il file statico non esiste
    console.log(`⚠️ Static destinations sitemap not found for ${lang}, serving empty`);
    
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Destinations sitemap not yet generated for ${lang} -->
</urlset>`;
    
    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Cache-Status': 'EMPTY'
      },
    });
    
  } catch (error) {
    console.error(`💥 Error serving destinations sitemap for ${lang}:`, error);
    
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new Response(errorSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'X-Cache-Status': 'ERROR'
      },
    });
  }
} 