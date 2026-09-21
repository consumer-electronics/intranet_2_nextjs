import { NextResponse } from 'next/server';

/** Extensiones de video que se muestran en el explorador */
const EXTENSIONES_VIDEO = new Set(['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv', '.wmv']);

function esVideo(nombre) {
    const extMatch = nombre.match(/\.[^.]+$/);
    if (!extMatch) return false;
    return EXTENSIONES_VIDEO.has(extMatch[0].toLowerCase());
}

/**
 * Escanea el directorio expuesto vía HTTP de Apache recursivamente parseando el HTML (autoindex).
 * Resuelve el problema de acceso a sistema de archivos local en el servidor de producción.
 */
async function scrapeTree(baseUrl, filterLower) {
    const result = [];
    try {
        // Añadir header para evitar caché
        const response = await fetch(baseUrl, { cache: 'no-store' });
        if (!response.ok) return result;
        const html = await response.text();

        // Extraer los enlaces de la tabla del autoindex de Apaxy/Apache
        const regex = /<td class="indexcolname"><a href="([^"]+)">([^<]+)<\/a><\/td>/g;
        let match;
        
        const dirPromises = [];

        while ((match = regex.exec(html)) !== null) {
            let href = match[1];
            let name = match[2];
            
            // Ignorar "Parent Directory" o ordenamientos
            if (href.startsWith('?') || href === '/' || href === '../' || name === 'Parent Directory') continue;
            
            href = decodeURIComponent(href.replace(/&amp;/g, '&'));
            name = decodeURIComponent(name.replace(/&amp;/g, '&'));

            if (href.endsWith('/')) {
                const folderName = name.replace(/\/$/, '');
                
                // Promesa recursiva para procesar subdirectorios en paralelo
                dirPromises.push((async () => {
                    const subUrl = baseUrl.endsWith('/') ? baseUrl + href : baseUrl + '/' + href;
                    const subContent = await scrapeTree(subUrl, filterLower);
                    
                    if (!filterLower || subContent.length > 0 || folderName.toLowerCase().includes(filterLower)) {
                        return { [folderName]: subContent };
                    }
                    return null;
                })());
            } else if (esVideo(name)) {
                if (!filterLower || name.toLowerCase().includes(filterLower)) {
                    result.push({ video: name });
                }
            }
        }

        // Esperar que terminen todos los escaneos de subdirectorios
        const folders = await Promise.all(dirPromises);
        for (const f of folders) {
            if (f) result.push(f);
        }
        
    } catch (e) {
        console.error("[AYUDA][VIDEOS] Error scraping " + baseUrl, e.message);
    }
    
    return result;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filtro = searchParams.get('filtro') || '';

        // Usar la URL pública expuesta por Apache en lugar del path local (fs)
        const baseUrl = process.env.NEXT_PUBLIC_AYUDA_VIDEOS_BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { success: false, message: 'URL de videos de ayuda no configurada (NEXT_PUBLIC_AYUDA_VIDEOS_BASE_URL).' },
                { status: 500 }
            );
        }

        const data = await scrapeTree(baseUrl, filtro.toLowerCase());

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('[AYUDA][VIDEOS]', error);

        return NextResponse.json(
            { success: false, message: 'Error al escanear los videos de ayuda.', error: error.message },
            { status: 500 }
        );
    }
}
