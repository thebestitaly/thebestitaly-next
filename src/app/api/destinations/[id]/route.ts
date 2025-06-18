import { NextRequest, NextResponse } from 'next/server';
import directusClient from '@/lib/directus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'it';
    
    console.log(`🗺️ API: Fetching destination by ID: ${id} (lang: ${lang})`);
    
    // Usa autenticazione server-side
    const destination = await directusClient.getDestinationById(id, lang);
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(destination);
    
  } catch (error) {
    console.error('Error in destination API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 