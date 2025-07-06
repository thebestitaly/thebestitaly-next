import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { type } = body;

    // Simula l'elaborazione della traduzione
    const isEnglishOnly = type === 'english';
    const totalLanguages = isEnglishOnly ? 1 : 25;
    const translationsCompleted = totalLanguages;

    // Qui andrà la logica reale per la traduzione
    console.log(`Traduzione company ${id} - Tipo: ${type || 'all'}`);

    return NextResponse.json({
      success: true,
      message: `Traduzione ${isEnglishOnly ? 'inglese' : 'completa'} avviata per company ${id}`,
      translationsCompleted,
      totalLanguages,
      companyId: id
    });
  } catch (error) {
    console.error('Errore traduzione company:', error);
    return NextResponse.json(
      { error: 'Errore durante la traduzione' },
      { status: 500 }
    );
  }
} 