import { NextResponse } from 'next/server';

const CACHE = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function crawlAutoIndex(url) {
    if (CACHE.has(url)) {
        const cached = CACHE.get(url);
        if (Date.now() - cached.time < CACHE_TTL) {
            return cached.data;
        }
    }

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            if (res.status === 404 || res.status === 403) return [];
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const html = await res.text();
        const result = [];

        const regex = /<td class="indexcolname"><a href="([^"]+)">([^<]+)<\/a><\/td>/g;
        let match;
        const folderPromises = [];

        while ((match = regex.exec(html)) !== null) {
            const href = match[1];
            let name = match[2];

            if (href.startsWith('?C=') || name === 'Parent Directory') continue;
            
            name = decodeURIComponent(href);

            if (href.endsWith('/')) {
                const folderName = name.slice(0, -1);
                const subUrl = new URL(href, url).href;
                
                folderPromises.push((async () => {
                    const subContent = await crawlAutoIndex(subUrl);
                    result.push({ [folderName]: subContent });
                })());
            } else {
                const fileName = name;
                result.push({ archivo: fileName });
            }
        }

        await Promise.all(folderPromises);

        CACHE.set(url, { time: Date.now(), data: result });
        return result;

    } catch (error) {
        console.error(`[SIG] Error crawling URL: ${url}`, error);
        return [];
    }
}

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
            targetUrl = `https://dynamics.appceg.com/sig/2.%20Documentos%20generales/${encodeURIComponent(targetUrl)}/`;
        }

        targetUrl = targetUrl.endsWith('/') ? targetUrl : `${targetUrl}/`;

        if (!targetUrl.startsWith('https://dynamics.appceg.com/sig/')) {
             return NextResponse.json({ success: false, message: 'URL no permitida.' }, { status: 403 });
        }

        const rawData = await crawlAutoIndex(targetUrl);
        const data = filterTree(rawData, filtro.toLowerCase());

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('[SIG][PROXY]', error);
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud de proxy.' },
            { status: 500 }
        );
    }
}
