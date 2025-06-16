import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_TOKEN;

    if (!directusUrl || !token) {
      return NextResponse.json(
        { error: 'Configurazione Directus mancante' },
        { status: 500 }
      );
    }

    console.log(`📖 Admin: Getting article ${id}...`);

    // Get article with translations
    const response = await fetch(`${directusUrl}/items/articles/${id}?fields=*,translations.*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Directus article error:', errorData);
      return NextResponse.json(
        { error: 'Articolo non trovato', details: errorData },
        { status: response.status }
      );
    }

    const article = await response.json();
    console.log('✅ Article retrieved:', article.data);

    return NextResponse.json({
      success: true,
      data: article.data
    });

  } catch (error: any) {
    console.error('❌ Error getting article:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante il recupero dell\'articolo',
        details: error.message
      },
      { status: 500 }
    );
  }
} 