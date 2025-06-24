import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
    try {
        // Leggi il file widget-static.js
        const filePath = join(process.cwd(), 'public', 'widgets', 'widget-static.js');
        const fileContent = await readFile(filePath, 'utf8');

        // Ritorna il file JavaScript con il Content-Type corretto
        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600', // Cache per 1 ora
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('❌ Errore nel servire widget-static.js:', error);
        return NextResponse.json(
            { error: 'Widget non trovato' },
            { status: 404 }
        );
    }
} 