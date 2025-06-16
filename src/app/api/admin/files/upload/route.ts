import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Admin: Uploading file...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_TOKEN;

    if (!directusUrl || !token) {
      console.error('❌ Missing Directus configuration');
      return NextResponse.json(
        { error: 'Configurazione Directus mancante' },
        { status: 500 }
      );
    }

    // Create FormData for Directus
    const directusFormData = new FormData();
    directusFormData.append('file', file);

    console.log('Uploading to Directus...');

    const uploadResponse = await fetch(`${directusUrl}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: directusFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Directus upload error:', errorData);
      return NextResponse.json(
        { error: 'Errore upload file', details: errorData },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ File uploaded:', uploadResult.data);

    return NextResponse.json({
      success: true,
      file: uploadResult.data
    });

  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante l\'upload del file',
        details: error.message
      },
      { status: 500 }
    );
  }
} 