import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, readItems, deleteItems, staticToken } from '@directus/sdk';

// Client Directus con autenticazione
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || '')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN || ''));

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  console.log('[API] *** HANDLER DELETE ALL COMPANY TRANSLATIONS ***');
  
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ 
      error: 'ID company mancante' 
    }, { status: 400 });
  }

  try {
    console.log(`[API] Eliminazione traduzioni per company ID: ${id}`);
    
    // Verifica che la company esista
    const companies = await directus.request(
      readItems('companies', {
        filter: { id: { _eq: id } },
        fields: ['id'],
        limit: 1,
      })
    );

    if (!Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ 
        error: 'Company non trovata' 
      }, { status: 404 });
    }

    // Trova tutte le traduzioni della company (esclusa quella italiana)
    console.log('[API] Ricerca traduzioni da eliminare...');
    const translations = await directus.request(
      readItems('companies_translations', {
        filter: { 
          companies_id: { _eq: id },
          languages_code: { _neq: 'it' } // Esclude italiano
        },
        fields: ['id', 'languages_code'],
      })
    );

    console.log(`[API] Trovate ${translations.length} traduzioni da eliminare`);

    if (!translations || translations.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Nessuna traduzione da eliminare (solo italiano presente)',
        deletedCount: 0
      });
    }

    // Elimina tutte le traduzioni (tranne l'italiana)
    const translationIds = translations.map((t: any) => t.id);
    
    console.log('[API] Eliminazione traduzioni in corso...');
    await directus.request(
      deleteItems('companies_translations', translationIds)
    );

    console.log(`[API] ✅ Eliminate ${translations.length} traduzioni`);

    return NextResponse.json({ 
      success: true,
      message: `Eliminate ${translations.length} traduzioni`,
      deletedCount: translations.length,
      deletedLanguages: translations.map((t: any) => t.languages_code)
    });

  } catch (error) {
    console.error('[API] Errore nell\'eliminazione traduzioni company:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: String(error)
    }, { status: 500 });
  }
} 