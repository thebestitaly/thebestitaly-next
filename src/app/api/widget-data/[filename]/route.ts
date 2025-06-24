import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        // Verifica che il filename sia valido (solo JSON)
        if (!filename.endsWith('.json')) {
            return NextResponse.json(
                { error: 'File non valido' },
                { status: 400 }
            );
        }

        // Leggi il file JSON dalla cartella widget-data
        const filePath = join(process.cwd(), 'public', 'widget-data', filename);
        const fileContent = await readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);

        // Ritorna il JSON con headers CORS corretti
        return NextResponse.json(jsonData, {
            headers: {
                'Cache-Control': 'public, max-age=3600', // Cache per 1 ora
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('❌ Errore nel servire widget data:', error);
        
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return NextResponse.json(
                { error: 'Widget non trovato' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Errore del server' },
            { status: 500 }
        );
    }
} 