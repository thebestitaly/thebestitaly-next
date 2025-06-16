import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    console.log('📝 Admin: Updating article...', id);
    console.log('Request body:', body);
    
    // Validate required fields
    if (!body.titolo_articolo || !body.description) {
      return NextResponse.json(
        { error: 'Titolo e descrizione sono obbligatori' },
        { status: 400 }
      );
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_TOKEN;

    if (!directusUrl || !token) {
      console.error('❌ Missing Directus configuration');
      return NextResponse.json(
        { error: 'Configurazione Directus mancante' },
        { status: 500 }
      );
    }

    // Update article main fields (featured_status, image, category, destination)
    const articlePayload: any = {
      featured_status: body.featured_status || 'none'
    };

    if (body.image) {
      articlePayload.image = body.image;
    }

    if (body.category_id !== undefined) {
      articlePayload.category_id = body.category_id;
    }

    if (body.destination_id !== undefined) {
      articlePayload.destination_id = body.destination_id;
    }

    console.log('Updating article with payload:', articlePayload);

    const articleResponse = await fetch(`${directusUrl}/items/articles/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articlePayload),
    });

    if (!articleResponse.ok) {
      const errorData = await articleResponse.json();
      console.error('Directus article update error:', errorData);
      return NextResponse.json(
        { error: 'Errore aggiornamento articolo', details: errorData },
        { status: articleResponse.status }
      );
    }

    const article = await articleResponse.json();
    console.log('✅ Article updated:', article.data);

    // Find existing Italian translation
    const translationsResponse = await fetch(`${directusUrl}/items/articles_translations?filter[articles_id][_eq]=${id}&filter[languages_code][_eq]=it`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!translationsResponse.ok) {
      throw new Error('Errore ricerca traduzione esistente');
    }

    const translationsData = await translationsResponse.json();
    const existingTranslation = translationsData.data?.[0];

    // Update or create Italian translation
    const translationPayload = {
      titolo_articolo: body.titolo_articolo,
      description: body.description,
      seo_title: body.seo_title || '',
      seo_summary: body.seo_summary || '',
      slug_permalink: body.slug_permalink || ''
    };

    let translation;

    if (existingTranslation) {
      // Update existing translation
      console.log('Updating existing translation:', existingTranslation.id);
      
      const translationResponse = await fetch(`${directusUrl}/items/articles_translations/${existingTranslation.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(translationPayload),
      });

      if (!translationResponse.ok) {
        const errorData = await translationResponse.json();
        console.error('Directus translation update error:', errorData);
        return NextResponse.json(
          { error: 'Errore aggiornamento traduzione', details: errorData },
          { status: translationResponse.status }
        );
      }

      translation = await translationResponse.json();
    } else {
      // Create new translation
      console.log('Creating new translation...');
      
      const newTranslationPayload = {
        ...translationPayload,
        articles_id: parseInt(id),
        languages_code: 'it'
      };

      const translationResponse = await fetch(`${directusUrl}/items/articles_translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTranslationPayload),
      });

      if (!translationResponse.ok) {
        const errorData = await translationResponse.json();
        console.error('Directus translation creation error:', errorData);
        return NextResponse.json(
          { error: 'Errore creazione traduzione', details: errorData },
          { status: translationResponse.status }
        );
      }

      translation = await translationResponse.json();
    }

    console.log('✅ Translation updated/created:', translation.data);

    return NextResponse.json({
      success: true,
      article: article.data,
      translation: translation.data
    });

  } catch (error: any) {
    console.error('❌ Error updating article:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante l\'aggiornamento dell\'articolo',
        details: error.message
      },
      { status: 500 }
    );
  }
} 