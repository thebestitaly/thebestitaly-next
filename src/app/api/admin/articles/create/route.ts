import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Admin: Creating article...');
    
    const body = await request.json();
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

    // Create article con tutti i campi base
    const articlePayload: any = {
      date_created: new Date().toISOString(),
      featured_status: body.featured_status || 'none',
      category_id: body.category ? parseInt(body.category) : null,
      status: 'published' // Pubblica direttamente
    };

    if (body.image) {
      articlePayload.image = body.image;
    }

    console.log('Creating article with payload:', articlePayload);

    const articleResponse = await fetch(`${directusUrl}/items/articles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articlePayload),
    });

    if (!articleResponse.ok) {
      const errorData = await articleResponse.json();
      console.error('Directus article error:', errorData);
      return NextResponse.json(
        { error: 'Errore creazione articolo', details: errorData },
        { status: articleResponse.status }
      );
    }

    const article = await articleResponse.json();
    console.log('✅ Article created:', article.data);

    // Create Italian translation
    const translationPayload = {
      articles_id: article.data.id,
      languages_code: 'it',
      titolo_articolo: body.titolo_articolo,
      description: body.description,
      seo_title: body.seo_title || '',
      seo_summary: body.seo_summary || '',
      slug_permalink: body.slug_permalink || ''
    };

    console.log('Creating translation with payload:', translationPayload);

    const translationResponse = await fetch(`${directusUrl}/items/articles_translations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translationPayload),
    });

    if (!translationResponse.ok) {
      const errorData = await translationResponse.json();
      console.error('Directus translation error:', errorData);
      return NextResponse.json(
        { error: 'Errore creazione traduzione', details: errorData },
        { status: translationResponse.status }
      );
    }

    const translation = await translationResponse.json();
    console.log('✅ Translation created:', translation.data);

    // Create additional image relations if provided
    if (body.additionalImages && body.additionalImages.length > 0) {
      console.log('Creating image relations...');
      for (const imageId of body.additionalImages) {
        try {
          const relationPayload = {
            articles_id: article.data.id,
            directus_files_id: imageId
          };

          await fetch(`${directusUrl}/items/articles_files`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(relationPayload),
          });

          console.log('✅ Image relation created for:', imageId);
        } catch (err) {
          console.error('Error creating image relation:', err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      article: article.data,
      translation: translation.data
    });

  } catch (error: any) {
    console.error('❌ Error creating article:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante la creazione dell\'articolo',
        details: error.message
      },
      { status: 500 }
    );
  }
} 