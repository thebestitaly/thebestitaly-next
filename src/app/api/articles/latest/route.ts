import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'it';

  try {
    console.log('Fetching latest articles for lang:', lang);
    
    // Ottieni gli ultimi articoli (non featured)
    const articles = await directusClient.getLatestArticlesForHomepage(lang);
    
    console.log('Raw latest articles from Directus:', articles?.length || 0);
    
    // Filtra le traduzioni delle categorie per mantenere solo quella della lingua richiesta
    const filteredArticles = articles.map((article: any) => {
      if (article.category_id?.translations) {
        const categoryTranslation = article.category_id.translations.find(
          (t: any) => t.languages_code === lang
        );
        
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

    console.log('Filtered latest articles:', filteredArticles?.length || 0);

    return NextResponse.json({ data: filteredArticles });
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
} 