import { NextRequest, NextResponse } from 'next/server';
import directusWebClient from '../../../../lib/directus-web';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';

  try {
    console.log('🔥 [HOMEPAGE ARTICLES API] Fetching for lang:', lang);
    
    // Direct call - cache managed at Redis layer
    const articles = await directusWebClient.getHomepageArticles(lang);
    
    console.log('📊 [HOMEPAGE ARTICLES API] Raw articles from Directus:', articles?.length || 0);
    
    // Filter category translations to keep only the requested language
    const filteredArticles = articles.map((article: any) => {
      if (article.category_id?.translations) {
        console.log('🔍 Category translations for article', article.id, ':', article.category_id.translations);
        
        const categoryTranslation = article.category_id.translations.find(
          (t: any) => t.languages_code === lang
        );
        
        console.log('✅ Found translation for lang', lang, ':', categoryTranslation);
        
        return {
          ...article,
          category_id: {
            ...article.category_id,
            translations: categoryTranslation ? [categoryTranslation] : []
          }
        };
      }
      return article;
    });

    console.log(`✅ [HOMEPAGE ARTICLES API] Returning ${filteredArticles?.length || 0} articles for ${lang}`);

    return NextResponse.json({ data: filteredArticles });
  } catch (error) {
    console.error('❌ [HOMEPAGE ARTICLES API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 