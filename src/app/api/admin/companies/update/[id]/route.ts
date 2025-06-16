import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    console.log('📝 Admin: Updating company...', id);
    console.log('Request body:', body);
    
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_TOKEN;

    if (!directusUrl || !token) {
      console.error('❌ Missing Directus configuration');
      return NextResponse.json(
        { error: 'Configurazione Directus mancante' },
        { status: 500 }
      );
    }

    // Update company main fields
    const companyPayload: any = {
      company_name: body.company_name,
      website: body.website || null,
      email: body.email || null,
      phone: body.phone || null,
      active: body.active || false,
      slug_permalink: body.slug_permalink || ''
    };

    if (body.featured_image) {
      companyPayload.featured_image = body.featured_image;
    }
    if (body.destination_id) {
      companyPayload.destination_id = parseInt(body.destination_id);
    }
    if (body.lat) {
      companyPayload.lat = parseFloat(body.lat);
    }
    if (body.long) {
      companyPayload.long = parseFloat(body.long);
    }

    console.log('Updating company with payload:', companyPayload);

    const companyResponse = await fetch(`${directusUrl}/items/companies/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyPayload),
    });

    if (!companyResponse.ok) {
      const errorData = await companyResponse.json();
      console.error('Directus company update error:', errorData);
      return NextResponse.json(
        { error: 'Errore aggiornamento company', details: errorData },
        { status: companyResponse.status }
      );
    }

    const company = await companyResponse.json();
    console.log('✅ Company updated:', company.data);

    // Find existing Italian translation
    const translationsResponse = await fetch(`${directusUrl}/items/companies_translations?filter[companies_id][_eq]=${id}&filter[languages_code][_eq]=it`, {
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
      description: body.description || '',
      seo_title: body.seo_title || '',
      seo_summary: body.seo_summary || ''
    };

    let translation;

    if (existingTranslation) {
      // Update existing translation
      console.log('Updating existing translation:', existingTranslation.id);
      
      const translationResponse = await fetch(`${directusUrl}/items/companies_translations/${existingTranslation.id}`, {
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
        companies_id: parseInt(id),
        languages_code: 'it'
      };

      const translationResponse = await fetch(`${directusUrl}/items/companies_translations`, {
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
      company: company.data,
      translation: translation.data
    });

  } catch (error: any) {
    console.error('❌ Error updating company:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante l\'aggiornamento della company',
        details: error.message
      },
      { status: 500 }
    );
  }
} 