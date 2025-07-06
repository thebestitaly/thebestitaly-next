import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidateStaticCache } from '@/lib/static-destinations';

// POST - Revalida le pagine di una destinazione specifica
export async function POST(request: NextRequest) {
  console.log('🔄 [REVALIDATE] Richiesta di revalidation ricevuta');
  
  try {
    const body = await request.json();
    const { 
      destinationId, 
      type, 
      slug, 
      regionSlug, 
      provinceSlug, 
      languages = ['it', 'en', 'fr', 'de', 'es'] // Lingue principali per ora
    } = body;

    console.log('🎯 [REVALIDATE] Parametri:', { destinationId, type, slug, regionSlug, provinceSlug });

    // Array per tenere traccia delle pagine revalidate
    const revalidatedPaths: string[] = [];

    // Revalida per ogni lingua
    for (const lang of languages) {
      let pathToRevalidate = '';

      // Costruisci il path in base al tipo di destinazione
      switch (type) {
        case 'region':
          pathToRevalidate = `/${lang}/${slug}`;
          break;
        case 'province':
          pathToRevalidate = `/${lang}/${regionSlug}/${slug}`;
          break;
        case 'municipality':
          pathToRevalidate = `/${lang}/${regionSlug}/${provinceSlug}/${slug}`;
          break;
        default:
          console.warn(`⚠️ [REVALIDATE] Tipo destinazione sconosciuto: ${type}`);
          continue;
      }

      try {
        // Revalida il path specifico
        revalidatePath(pathToRevalidate);
        revalidatedPaths.push(pathToRevalidate);
        console.log(`✅ [REVALIDATE] Revalidato: ${pathToRevalidate}`);

        // Se è una provincia o comune, revalida anche le pagine parent
        if (type === 'province' && regionSlug) {
          const parentPath = `/${lang}/${regionSlug}`;
          revalidatePath(parentPath);
          revalidatedPaths.push(parentPath);
          console.log(`✅ [REVALIDATE] Revalidato parent: ${parentPath}`);
        }
        
        if (type === 'municipality' && regionSlug && provinceSlug) {
          const regionPath = `/${lang}/${regionSlug}`;
          const provincePath = `/${lang}/${regionSlug}/${provinceSlug}`;
          revalidatePath(regionPath);
          revalidatePath(provincePath);
          revalidatedPaths.push(regionPath, provincePath);
          console.log(`✅ [REVALIDATE] Revalidato parents: ${regionPath}, ${provincePath}`);
        }

      } catch (error) {
        console.error(`❌ [REVALIDATE] Errore revalidando ${pathToRevalidate}:`, error);
      }
    }

    // Invalida anche il cache statico per questa destinazione
    try {
      await invalidateStaticCache();
      console.log('✅ [REVALIDATE] Cache statico invalidato');
    } catch (error) {
      console.error('❌ [REVALIDATE] Errore invalidando cache statico:', error);
    }

    return NextResponse.json({
      success: true,
      message: `Destinazione ${destinationId} revalidata con successo`,
      revalidatedPaths,
      destinationId,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [REVALIDATE] Errore:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}

// GET - Revalida tutte le destinazioni (uso amministrativo)
export async function GET() {
  console.log('🔄 [REVALIDATE] Revalidation completa richiesta');
  
  try {
    // Revalida le pagine principali
    const mainPaths = [
      '/', '/it', '/en', '/fr', '/de', '/es'
    ];

    for (const path of mainPaths) {
      revalidatePath(path);
      console.log(`✅ [REVALIDATE] Revalidato: ${path}`);
    }

    // Invalida tutto il cache statico
    await invalidateStaticCache();
    console.log('✅ [REVALIDATE] Cache statico completamente invalidato');

    return NextResponse.json({
      success: true,
      message: 'Revalidation completa eseguita',
      revalidatedPaths: mainPaths,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [REVALIDATE] Errore in revalidation completa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
} 