import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Qui andrà la logica reale per cancellare le traduzioni
    console.log(`Cancellazione traduzioni company ${id}`);

    return NextResponse.json({
      success: true,
      message: `Traduzioni della company ${id} cancellate con successo`,
      companyId: id
    });
  } catch (error) {
    console.error('Errore cancellazione traduzioni company:', error);
    return NextResponse.json(
      { error: 'Errore durante la cancellazione delle traduzioni' },
      { status: 500 }
    );
  }
} 