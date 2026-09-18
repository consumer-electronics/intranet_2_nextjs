import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function buildTree(dirPath, filter = '') {
    const filterLower = filter.toLowerCase();

    function traverseDir(currentPath) {
        if (!fs.existsSync(currentPath)) return [];
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        const result = [];

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'Thumbs.db') continue;

            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                const subContent = traverseDir(fullPath);
                if (!filterLower || subContent.length > 0 || entry.name.toLowerCase().includes(filterLower)) {
                    result.push({ [entry.name]: subContent });
                }
            } else if (entry.isFile()) {
                if (!filterLower || entry.name.toLowerCase().includes(filterLower)) {
                    result.push({ archivo: entry.name });
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
        const ruta = searchParams.get('ruta') || '';
        const docsRoot = process.env.SIG_UNC_PATH_DOCUMENTOS_GENERALES || '\\\\192.168.1.141\\htdocs\\sig\\2. Documentos generales';
        // Evita que "ruta" pueda salirse de docsRoot (path traversal, ej: "../../../etc")
        const docsDir = path.normalize(path.join(/*turbopackIgnore: true*/ docsRoot, ruta));
        if (!docsDir.startsWith(docsRoot)) {
            return NextResponse.json(
                { success: false, message: 'Ruta no válida.' },
                { status: 400 }
            );
        }

        const data = buildTree(docsDir, filtro);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('[SIG][DOCUMENTOS-GENERALES]', error);

        return NextResponse.json(
            { success: false, message: 'Error al escanear los documentos generales.' },
            { status: 500 }
        );
    }
}