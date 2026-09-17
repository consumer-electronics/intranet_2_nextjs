import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/** Extensiones de video que se muestran en el explorador */
const EXTENSIONES_VIDEO = new Set(['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv', '.wmv']);

function esVideo(nombre) {
    return EXTENSIONES_VIDEO.has(path.extname(nombre).toLowerCase());
}

/**
 * Escanea un directorio recursivamente y devuelve el árbol de carpetas/videos.
 * Formato idéntico al de SIG/documentos-generales:
 *  - Carpeta: { "Nombre carpeta": [...subcontenido] }
 *  - Video:   { video: "nombre.mp4" }
 *
 * Si hay un filtro activo, devuelve la lista aplanada solo de videos que coinciden.
 */
function buildTree(dirPath, filter = '') {
    const filterLower = filter.toLowerCase();

    function traverseDir(currentPath) {
        if (!fs.existsSync(currentPath)) return [];
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        const result = [];

        for (const entry of entries) {
            // Ignorar archivos del sistema
            if (entry.name.startsWith('.') || entry.name === 'Thumbs.db' || entry.name === 'desktop.ini') continue;

            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                const subContent = traverseDir(fullPath);
                if (!filterLower || subContent.length > 0 || entry.name.toLowerCase().includes(filterLower)) {
                    result.push({ [entry.name]: subContent });
                }
            } else if (entry.isFile() && esVideo(entry.name)) {
                if (!filterLower || entry.name.toLowerCase().includes(filterLower)) {
                    result.push({ video: entry.name });
                }
            }
        }

        return result;
    }

    return traverseDir(dirPath);
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filtro = searchParams.get('filtro') || '';

        const videosRoot = process.env.AYUDA_VIDEOS_PATH;

        if (!videosRoot) {
            return NextResponse.json(
                { success: false, message: 'Ruta de videos de ayuda no configurada (AYUDA_VIDEOS_PATH).' },
                { status: 500 }
            );
        }

        // Diagnóstico: muestra el path y si existe
        const existe = fs.existsSync(videosRoot);
        console.log('[AYUDA][VIDEOS] Path configurado:', JSON.stringify(videosRoot));
        console.log('[AYUDA][VIDEOS] El directorio existe:', existe);
        if (existe) {
            try {
                const entries = fs.readdirSync(videosRoot);
                console.log('[AYUDA][VIDEOS] Entradas encontradas:', entries.length, entries.slice(0, 5));
            } catch (readErr) {
                console.error('[AYUDA][VIDEOS] Error al leer el directorio:', readErr.message);
            }
        }

        const data = buildTree(videosRoot, filtro);

        return NextResponse.json({ success: true, data, _debug: { path: videosRoot, existe } });
    } catch (error) {
        console.error('[AYUDA][VIDEOS]', error);

        return NextResponse.json(
            { success: false, message: 'Error al escanear los videos de ayuda.', error: error.message },
            { status: 500 }
        );
    }
}
