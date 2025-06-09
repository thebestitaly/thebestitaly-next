// file: src/app/api/directus/destinations/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const directusUrl = process.env.DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (directusToken) {
      headers['Authorization'] = `Bearer ${directusToken}`;
    }

    const response = await fetch(
      `${directusUrl}/items/destinations?fields=id,slug,name&sort=name&limit=-1`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore API destinazioni:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento delle destinazioni' }, 
      { status: 500 }
    );
  }
}

// Aggiungi cache per migliorare le performance
export const revalidate = 3600; // Cache per 1 ora