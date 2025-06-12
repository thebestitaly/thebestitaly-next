import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';

  try {
    console.log('Fetching homepage articles for lang:', lang);
    
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

    return NextResponse.json({ data: filteredArticles });
  } catch (error) {
    console.error('Error fetching homepage articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 