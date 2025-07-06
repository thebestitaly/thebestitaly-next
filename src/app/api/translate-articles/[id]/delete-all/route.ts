import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Qui andrà la logica reale per cancellare le traduzioni
    console.log(`Cancellazione traduzioni articolo ${id}`);

    return NextResponse.json({
      success: true,
      message: `Traduzioni dell'articolo ${id} cancellate con successo`,
      articleId: id
    });
  } catch (error) {
    console.error('Errore cancellazione traduzioni articolo:', error);
    return NextResponse.json(
      { error: 'Errore durante la cancellazione delle traduzioni' },
      { status: 500 }
    );
  }
} 