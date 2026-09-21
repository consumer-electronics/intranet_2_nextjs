import { NextResponse } from 'next/server';

function filterTree(tree, filterLower) {
    if (!filterLower) return tree;
    const result = [];
    
    for (const entry of tree) {
        const key = Object.keys(entry)[0];
        if (key === 'archivo') {
            if (entry.archivo.toLowerCase().includes(filterLower)) {
                result.push(entry);
            }
        } else {
            const folderName = key;
            const subContent = filterTree(entry[folderName], filterLower);
            if (subContent.length > 0 || folderName.toLowerCase().includes(filterLower)) {
                result.push({ [folderName]: subContent });
            }
        }
    }
    return result;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filtro = searchParams.get('filtro') || '';
        const baseFolderUrl = searchParams.get('url');

        if (!baseFolderUrl) {
            return NextResponse.json({ success: false, message: 'Se requiere la URL base.' }, { status: 400 });
        }

        let targetUrl = baseFolderUrl;
        if (!targetUrl.startsWith('http')) {
            targetUrl = `https://dynamics.appceg.com/sig/1.%20Documentos/${encodeURIComponent(targetUrl)}/`;
        }

        // Extraer el path relativo (e.g. "1. Documentos/Formatos")
        let relativePath = decodeURIComponent(targetUrl.replace('https://dynamics.appceg.com/sig/', '').replace(/\/$/, ''));
        if (!relativePath) {
            relativePath = '1. Documentos';
        }

        const API_NODE = process.env.API_NODE || 'http://localhost:3010';
        
        const res = await fetch(`${API_NODE}/api/sig/getFolderTree?folder=${encodeURIComponent(relativePath)}`, {
            // Pasamos un token dummy o puedes configurar uno real si el middleware validateToken lo exige
            headers: { 'Authorization': `Bearer ${request.headers.get('Authorization')?.split(' ')[1] || 'dummy'}` },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[SIG] Node API error: ${res.status}`);
            return NextResponse.json({ success: true, data: [] });
        }

        const json = await res.json();
        const rawData = json.data || [];

        const data = filterTree(rawData, filtro.toLowerCase());

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('[SIG][PROXY]', error);
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud al API de Node.' },
            { status: 500 }
        );
    }
}
