import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import directusWebClient from '@/lib/directus-web';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            widgetId, 
            type, 
            contentId, 
            language, 
            size, 
            theme, 
            searchTerm, 
            contentData 
        } = body;

        console.log('🔄 Generando dati statici per widget:', widgetId);

        // Crea la directory se non esiste
        const dataDir = join(process.cwd(), 'public', 'widget-data');
        try {
            await mkdir(dataDir, { recursive: true });
        } catch (error) {
            // Directory già esistente, ignora l'errore
        }

        // Ottieni tutti i dati completi con tutte le traduzioni dal database
        let fullContentData = null;
        try {
            if (type === 'company') {
                // Per le aziende, ottieni tutti i dati con tutte le traduzioni
                const companyResponse = await directusWebClient.get(`/items/companies/${contentId}`, {
                    params: {
                        'fields[]': [
                            'id',
                            'company_name',
                            'featured_image',
                            'slug_permalink',
                            'phone',
                            'website',
                            'translations.*'
                        ]
                    }
                });
                fullContentData = companyResponse.data?.data;
                console.log('📊 Caricati dati completi azienda con', fullContentData?.translations?.length || 0, 'traduzioni');
                
            } else if (type === 'destination') {
                // Per le destinazioni, ottieni tutti i dati con tutte le traduzioni
                const destinationResponse = await directusWebClient.get(`/items/destinations/${contentId}`, {
                    params: {
                        'fields[]': [
                            'id',
                            'type',
                            'image',
                            'lat',
                            'long',
                            'region_id',
                            'province_id',
                            'translations.*'
                        ]
                    }
                });
                fullContentData = destinationResponse.data?.data;
                console.log('📊 Caricati dati completi destinazione con', fullContentData?.translations?.length || 0, 'traduzioni');
                
            } else if (type === 'article') {
                // Per gli articoli, ottieni tutti i dati con tutte le traduzioni
                const articleResponse = await directusWebClient.get(`/items/articles/${contentId}`, {
                    params: {
                        'fields[]': [
                            'id',
                            'featured_image',
                            'uuid_id',
                            'translations.*'
                        ]
                    }
                });
                fullContentData = articleResponse.data?.data;
                console.log('📊 Caricati dati completi articolo con', fullContentData?.translations?.length || 0, 'traduzioni');
            }
        } catch (error) {
            console.error('❌ Errore nel caricare dati completi:', error);
            // Fallback ai dati originali se la chiamata fallisce
            fullContentData = contentData;
        }

        // Prepara i dati del widget con tutte le lingue
        const widgetData = {
            id: widgetId,
            type: type,
            defaultLanguage: language,
            size: size,
            theme: theme,
            searchTerm: searchTerm,
            content: {
                id: contentData.id || contentData.uuid,
                // Dati base (lingua di default)
                title: contentData.title,
                seo_title: contentData.seo_title,
                seo_summary: contentData.seo_summary,
                description: contentData.description,
                external_url: contentData.external_url,
                type: contentData.type,
                image_url: contentData.image_url,
                // Includiamo tutti i dati completi con tutte le traduzioni
                allLanguages: fullContentData || contentData
            },
            generatedAt: new Date().toISOString()
        };

        // Salva il file JSON
        const filename = `${widgetId}.json`;
        const filepath = join(dataDir, filename);
        
        await writeFile(filepath, JSON.stringify(widgetData, null, 2), 'utf8');

        console.log('✅ File JSON salvato:', filename);

        return NextResponse.json({
            success: true,
            filename: filename,
            widgetId: widgetId,
            path: `/api/widget-data/${filename}`
        });

    } catch (error) {
        console.error('❌ Errore nella generazione del file statico:', error);
        return NextResponse.json(
            { error: 'Errore nella generazione del file statico' },
            { status: 500 }
        );
    }
} 