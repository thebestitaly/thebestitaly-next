import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';
import { RedisCache, CACHE_DURATIONS, CacheKeys } from '../../../../lib/redis-cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';

  try {
    console.log('Fetching homepage articles for lang:', lang);
    
    // NUOVA IMPLEMENTAZIONE CACHE: Controlla prima Redis
    const cacheKey = CacheKeys.latestArticles(lang + '_homepage');
    const cachedArticles = await RedisCache.get<any[]>(cacheKey);
    
    if (cachedArticles) {
      console.log(`✅ Cache HIT for homepage articles ${lang}: ${cachedArticles.length} articles`);
      return NextResponse.json({ data: cachedArticles });
    }
    
    console.log(`📭 Cache MISS for homepage articles ${lang}, fetching from Directus`);
    
    // Ottieni gli articoli featured homepage
    const articles = await directusClient.getHomepageArticles(lang);
    
    console.log('Raw articles from Directus:', articles?.length || 0);
    
    // Filtra le traduzioni delle categorie per mantenere solo quella della lingua richiesta
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

    // SALVA IN CACHE con TTL ottimizzato per homepage
    await RedisCache.set(cacheKey, filteredArticles, CACHE_DURATIONS.HOMEPAGE_ARTICLES);
    console.log(`💾 Cached homepage articles for ${lang}: ${filteredArticles.length} articles`);

    return NextResponse.json({ data: filteredArticles });
  } catch (error) {
    console.error('Error fetching homepage articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 