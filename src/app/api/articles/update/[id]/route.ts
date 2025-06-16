import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.titolo_articolo || !body.description) {
      return NextResponse.json(
        { error: 'Titolo e descrizione sono obbligatori' },
        { status: 400 }
      );
    }

    // Update article if needed
    if (body.image || body.featured_status) {
      const articlePayload: any = {};
      
      if (body.image) {
        articlePayload.image = body.image;
      }
      
      if (body.featured_status) {
        articlePayload.featured_status = body.featured_status;
      }

      await directusClient.put(`/items/articles/${id}`, articlePayload);
    }

    // Update Italian translation
    const translationPayload = {
      titolo_articolo: body.titolo_articolo,
      description: body.description,
      seo_title: body.seo_title || '',
      seo_summary: body.seo_summary || '',
      slug_permalink: body.slug_permalink || ''
    };

    // Find existing translation
    const existingTranslations = await directusClient.get(`/items/articles_translations`, {
      params: {
        filter: {
          articles_id: { _eq: id },
          languages_code: { _eq: 'it' }
        }
      }
    });

    if (existingTranslations.data.data.length > 0) {
      // Update existing translation
      const translationId = existingTranslations.data.data[0].id;
      const translationResponse = await directusClient.put(`/items/articles_translations/${translationId}`, translationPayload);
      
      return NextResponse.json({
        success: true,
        translation: translationResponse.data
      });
    } else {
      // Create new translation
      const newTranslationPayload = {
        ...translationPayload,
        articles_id: id,
        languages_code: 'it'
      };
      
      const translationResponse = await directusClient.post('/items/articles_translations', newTranslationPayload);
      
      return NextResponse.json({
        success: true,
        translation: translationResponse.data
      });
    }

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento dell\'articolo' },
      { status: 500 }
    );
  }
} 