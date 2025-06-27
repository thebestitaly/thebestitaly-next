import { NextRequest, NextResponse } from 'next/server';
import { 
  generateStaticDestinations, 
  getStaticCacheStatus,
  invalidateStaticCache,
  fixMissingProvinces 
} from '@/lib/static-destinations';

// GET - Ottieni lo stato del cache statico
export async function GET() {
  try {
    const status = await getStaticCacheStatus();
    
    return NextResponse.json({
      success: true,
      cache_status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Errore ottenendo stato cache statico:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST - Genera o rigenera i dati statici
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, languages } = body;
    
    switch (action) {
      case 'generate':
        console.log('🚀 Rigenerando dati statici destinazioni...');
        const langs = languages || ['it', 'en', 'fr', 'de', 'es'];
        
        // Genera i dati statici
        await generateStaticDestinations(langs);
        
        // Ottieni lo stato aggiornato
        const newStatus = await getStaticCacheStatus();
        
        return NextResponse.json({
          success: true,
          message: 'Dati statici generati con successo',
          languages: langs,
          cache_status: newStatus,
          timestamp: new Date().toISOString()
        });
        
      case 'invalidate':
        console.log('🗑️ Invalidando cache statico...');
        const invalidateLangs = languages || undefined;
        
        await invalidateStaticCache(invalidateLangs);
        
        return NextResponse.json({
          success: true,
          message: 'Cache statico invalidato',
          languages: invalidateLangs || 'all',
          timestamp: new Date().toISOString()
        });
        
      case 'fix':
        console.log('🔧 Recuperando province mancanti...');
        const fixLang = languages?.[0] || 'it';
        
        await fixMissingProvinces(fixLang);
        
        // Ottieni lo stato aggiornato
        const updatedStatus = await getStaticCacheStatus();
        
        return NextResponse.json({
          success: true,
          message: `Province mancanti recuperate per ${fixLang}`,
          language: fixLang,
          cache_status: updatedStatus,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Azione non valida. Usa "generate", "invalidate" o "fix"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Errore gestendo cache statico:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// DELETE - Invalida tutto il cache statico
export async function DELETE() {
  try {
    console.log('🗑️ Invalidando tutto il cache statico...');
    
    await invalidateStaticCache();
    
    return NextResponse.json({
      success: true,
      message: 'Tutto il cache statico è stato invalidato',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Errore invalidando cache statico:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 