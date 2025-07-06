import { NextRequest, NextResponse } from 'next/server';
import { 
  generateStaticDestinations, 
  getStaticCacheStatus,
  invalidateStaticCache,
  fixMissingProvinces 
} from '@/lib/static-destinations';

// GET - Ottieni lo stato del cache statico
export async function GET() {
  console.log('--- [API static-cache] ✅ RICEVUTA RICHIESTA GET ---');
  try {
    const status = await getStaticCacheStatus();
    console.log('--- [API static-cache] ✅ Stato cache recuperato ---');
    return NextResponse.json({
      success: true,
      cache_status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('--- [API static-cache] ❌ ERRORE in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST - Genera o rigenera i dati statici
export async function POST(request: NextRequest) {
  console.log('--- [API static-cache] ✅ RICEVUTA RICHIESTA POST ---');
  try {
    const body = await request.json().catch(() => ({}));
    const { action, languages } = body;
    console.log(`--- [API static-cache] Eseguo azione: "${action}" per lingue: ${languages || 'default'} ---`);
    
    switch (action) {
      case 'generate':
        console.log('--- [API static-cache] 🚀 Inizio generazione dati statici... ---');
        const langs = languages || ['it', 'en', 'fr', 'de', 'es'];
        generateStaticDestinations(langs); // Eseguito in background
        console.log('--- [API static-cache] ✅ Processo di generazione avviato in background. ---');
        return NextResponse.json({
          success: true,
          message: 'Processo di generazione avviato in background. Controlla i log del server per il progresso.',
          timestamp: new Date().toISOString()
        });
        
      case 'invalidate':
        console.log('--- [API static-cache] 🗑️ Inizio invalidazione cache... ---');
        if (languages && Array.isArray(languages) && languages.length > 0) {
          for (const lang of languages) {
            await invalidateStaticCache(lang);
            console.log(`--- [API static-cache] ✅ Cache invalidato per: ${lang} ---`);
          }
        } else {
          await invalidateStaticCache(); // Invalida tutto se non vengono specificate lingue
          console.log(`--- [API static-cache] ✅ Cache invalidato per tutte le lingue. ---`);
        }
        return NextResponse.json({
          success: true,
          message: 'Cache statico invalidato',
          languages: languages || 'all',
          timestamp: new Date().toISOString()
        });
        
      case 'fix':
        console.log('--- [API static-cache] 🔧 Inizio recupero province mancanti... ---');
        const fixLang = languages?.[0] || 'it';
        await fixMissingProvinces(fixLang);
        console.log('--- [API static-cache] ✅ Recupero province completato. ---');
        const updatedStatus = await getStaticCacheStatus();
        return NextResponse.json({
          success: true,
          message: `Province mancanti recuperate per ${fixLang}`,
          language: fixLang,
          cache_status: updatedStatus,
          timestamp: new Date().toISOString()
        });
        
      default:
        console.warn(`--- [API static-cache] ⚠️ Azione non valida ricevuta: "${action}" ---`);
        return NextResponse.json(
          { success: false, error: 'Azione non valida. Usa "generate", "invalidate" o "fix"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('--- [API static-cache] ❌ ERRORE in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// DELETE - Invalida tutto il cache statico
export async function DELETE() {
  console.log('--- [API static-cache] ✅ RICEVUTA RICHIESTA DELETE ---');
  try {
    console.log('--- [API static-cache] 🗑️ Inizio invalidazione totale cache... ---');
    await invalidateStaticCache();
    console.log('--- [API static-cache] ✅ Invalidazione totale completata. ---');
    
    return NextResponse.json({
      success: true,
      message: 'Tutto il cache statico è stato invalidato',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('--- [API static-cache] ❌ ERRORE in DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 