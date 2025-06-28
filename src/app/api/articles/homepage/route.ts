import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';
import { getCache, setCache, CacheKeys } from '../../../../lib/redis-cache';

// Cache duration: 2 days for homepage articles
const HOMEPAGE_ARTICLES_TTL = 60 * 60 * 24 * 2; // 2 days

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';

  try {
    console.log('Fetching homepage articles for lang:', lang);
    
    // Check cache first
    const cacheKey = CacheKeys.homepageArticles(lang);
    const cachedArticles = await getCache(cacheKey);
    
    if (cachedArticles) {
      console.log(`✅ Cache HIT for homepage articles ${lang}: ${cachedArticles.length} articles`);
      return NextResponse.json({ data: cachedArticles });
    }
    
    console.log(`📭 Cache MISS for homepage articles ${lang}, fetching from Directus`);
    
    // Fetch fresh data
    const articles = await directusClient.getHomepageArticles(lang);
    
    console.log('Raw articles from Directus:', articles?.length || 0);
    
    // Filter category translations to keep only the requested language
    const filteredArticles = articles.map((article: any) => {
      if (article.category_id?.translations) {
        console.log('Category translations for article', article.id, ':', article.category_id.translations);
        
        const categoryTranslation = article.category_id.translations.find(
          (t: any) => t.languages_code === lang
        );
        
        console.log('Found translation for lang', lang, ':', categoryTranslation);
        
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

    console.log('Filtered articles:', filteredArticles?.length || 0);

    // Save to cache
    await setCache(cacheKey, filteredArticles, HOMEPAGE_ARTICLES_TTL);
    console.log(`💾 Cached homepage articles for ${lang}: ${filteredArticles.length} articles`);

    return NextResponse.json({ data: filteredArticles });
  } catch (error) {
    console.error('Error fetching homepage articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 