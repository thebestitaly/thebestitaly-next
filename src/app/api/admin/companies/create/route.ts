import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Admin: Creating company...');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate required fields
    if (!body.nome_azienda || !body.description) {
      return NextResponse.json(
        { error: 'Nome azienda e descrizione sono obbligatori' },
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

    // Create company con tutti i campi base
    const companyPayload: any = {
      date_created: new Date().toISOString(),
      featured_status: body.featured_status || 'none',
      category_id: body.category ? parseInt(body.category) : null,
      company_name: body.nome_azienda, // Campo base nella tabella companies
      slug_permalink: body.slug_permalink, // Campo base nella tabella companies
      active: body.active !== undefined ? body.active : true,
      featured: false
    };

    // Aggiungi campi opzionali
    if (body.image) {
      companyPayload.featured_image = body.image; // Nome corretto del campo
    }
    if (body.website) {
      companyPayload.website = body.website;
    }
    if (body.email) {
      companyPayload.email = body.email;
    }
    if (body.phone) {
      companyPayload.phone = body.phone;
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

    console.log('Creating company with payload:', companyPayload);

    const companyResponse = await fetch(`${directusUrl}/items/companies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyPayload),
    });

    if (!companyResponse.ok) {
      const errorData = await companyResponse.json();
      console.error('Directus company error:', errorData);
      return NextResponse.json(
        { error: 'Errore creazione azienda', details: errorData },
        { status: companyResponse.status }
      );
    }

    const company = await companyResponse.json();
    console.log('✅ Company created:', company.data);

    // Create Italian translation
    const translationPayload = {
      companies_id: company.data.id,
      languages_code: 'it',
      nome_azienda: body.nome_azienda,
      description: body.description,
      seo_title: body.seo_title || '',
      seo_summary: body.seo_summary || '',
      slug_permalink: body.slug_permalink || ''
    };

    console.log('Creating translation with payload:', translationPayload);

    const translationResponse = await fetch(`${directusUrl}/items/companies_translations`, {
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
            companies_id: company.data.id,
            directus_files_id: imageId
          };

          await fetch(`${directusUrl}/items/companies_files`, {
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
      company: company.data,
      translation: translation.data
    });

  } catch (error: any) {
    console.error('❌ Error creating company:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante la creazione dell\'azienda',
        details: error.message
      },
      { status: 500 }
    );
  }
} 