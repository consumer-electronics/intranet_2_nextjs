import { NextResponse } from 'next/server';

/**
 * Proxy para servir PDFs desde servidores externos.
 *
 * Soporta HTTP Range Requests (RFC 7233): reenvía el header Range al servidor
 * de origen y devuelve el status 206 Partial Content con los headers
 * Content-Range y Content-Length correspondientes. Esto permite que PDF.js
 * (react-pdf) descargue solo los bytes de la página que el usuario está
 * viendo, en lugar de transferir el archivo completo (crítico para PDFs >10 MB).
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Reenviar el header Range si el cliente lo envía (PDF.js lo usa para
        // solicitar solo los bytes de la página/sección que necesita).
        const rangeHeader = request.headers.get('range');

        const upstreamHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/pdf,*/*;q=0.8',
        };

        if (rangeHeader) {
            upstreamHeaders['Range'] = rangeHeader;
        }

        const response = await fetch(url, { headers: upstreamHeaders });

        // Aceptar tanto 200 (descarga completa) como 206 (respuesta parcial)
        if (!response.ok && response.status !== 206) {
            return new NextResponse(
                `Failed to fetch from remote server: ${response.statusText}`,
                { status: response.status }
            );
        }

        // Construir headers de respuesta: reenviar los de rango del servidor de origen
        const responseHeaders = {
            'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
            // Accept-Ranges indica al cliente (PDF.js) que puede hacer range requests
            'Accept-Ranges': 'bytes',
            // no-transform es vital para evitar que Next.js o un proxy intermedio (Cloudflare/Nginx)
            // apliquen GZIP/Brotli al PDF, lo cual destruye la estructura para PDF.js y los range requests
            'Cache-Control': 'public, max-age=3600, no-transform',
        };

        const contentRange = response.headers.get('Content-Range');
        const contentLength = response.headers.get('Content-Length');

        if (contentRange) responseHeaders['Content-Range'] = contentRange;
        if (contentLength) responseHeaders['Content-Length'] = contentLength;

        // Preservar el status 206 para que el cliente sepa que es una respuesta parcial
        return new NextResponse(response.body, {
            status: response.status, // 200 o 206
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Error proxying PDF:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
