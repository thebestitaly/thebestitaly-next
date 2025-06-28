import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'it';
    
    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' }, 
        { status: 400 }
      );
    }

    console.log(`🔥 [DESTINATIONS API] Fetching destination ${id} for lang: ${lang}`);
    
    // Direct call - cache managed at Redis layer
    const destination: any = await directusClient.getDestinationById(id, lang);

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' }, 
        { status: 404 }
      );
    }

    console.log(`✅ [DESTINATIONS API] Found destination ${id} (${lang})`);

    return NextResponse.json({ 
      success: true, 
      data: destination
    });

  } catch (error) {
    console.error('❌ [DESTINATIONS API] Error fetching destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destination' }, 
      { status: 500 }
    );
  }
} 