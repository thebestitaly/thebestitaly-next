import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, createItem } from '@directus/sdk';

const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || '').with(rest());

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Simple company creation...');
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    if (!body.company_name) {
      return NextResponse.json(
        { error: 'Nome company è obbligatorio' },
        { status: 400 }
      );
    }

    // Use Directus SDK directly
    const result = await directus.request(
      createItem('companies', {
        company_name: body.company_name,
        active: true
      })
    );

    console.log('✅ Company created:', result);
    
    return NextResponse.json({
      success: true,
      company: result
    });

  } catch (error: any) {
    console.error('❌ Error creating company:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore durante la creazione della company',
        details: error.message
      },
      { status: 500 }
    );
  }
} 