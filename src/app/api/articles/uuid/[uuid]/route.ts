import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const resolvedParams = await params;
    const { uuid } = resolvedParams;
    
    // Estrai la lingua dalla query string o usa default
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'it';
    
    console.log(`🔍 API: Fetching article by UUID: ${uuid} (lang: ${lang})`);
    
    // Usa la nuova funzione UUID
    const article = await directusClient.getArticleByUUID(uuid, lang);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Crea response pubblica SENZA ID numerici
    const publicArticle = {
      uuid_id: article.uuid_id,
      title: article.translations[0]?.titolo_articolo,
      description: article.translations[0]?.description,
      summary: article.translations[0]?.seo_summary,
      slug: article.translations[0]?.slug_permalink,
      image: article.image,
      date_created: article.date_created,
      featured_status: article.featured_status,
      
      // UUID delle relazioni (NO ID numerici)
      category: article.category_id ? {
        uuid_id: article.category_id.uuid_id,
        name: article.category_id.translations[0]?.nome_categoria,
        slug: article.category_id.translations[0]?.slug_permalink
        // NO: id (nascosto)
      } : null,
      
      // URL pubblico (slug-based)
      public_url: `/${lang}/magazine/${article.translations[0]?.slug_permalink}`,
      
      // API links (UUID-based)  
      api_links: {
        self: `/api/articles/uuid/${article.uuid_id}`,
        category: article.category_id?.uuid_id ? `/api/categories/uuid/${article.category_id.uuid_id}` : null
      }
    };
    
    return NextResponse.json(publicArticle);
    
  } catch (error) {
    console.error('Error in article UUID API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 