import { NextResponse } from 'next/server';

const DYNAMICS_BASE_URL = process.env.URL_DYNAMICS;

export const runtime = 'nodejs';

function parseJsonClean(rawText) {
    if (!rawText) return null;
    let cleaned = rawText.replace(/^\uFEFF/, '').trim();

    const firstCharIndex = cleaned.search(/[{[]/);
    if (firstCharIndex > 0) {
        cleaned = cleaned.slice(firstCharIndex);
    }

    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const lastCharIndex = Math.max(lastBrace, lastBracket);

    if (lastCharIndex !== -1 && lastCharIndex < cleaned.length - 1) {
        cleaned = cleaned.slice(0, lastCharIndex + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        return null;
    }
}

export async function GET() {
    if (!DYNAMICS_BASE_URL) {
        console.error('[NOSOTROS] URL_DYNAMICS no está configurada');
        return NextResponse.json(
            { message: 'URL_DYNAMICS no está configurada' },
            { status: 500 }
        );
    }

    const baseUrl = DYNAMICS_BASE_URL.endsWith('/')
        ? DYNAMICS_BASE_URL
        : `${DYNAMICS_BASE_URL}/`;

    const almacenamientoUrl = `${baseUrl}almacenamiento/`;

    // Ruta real, igual al patrón usado en birthdays: pantallas/intranet/<carpeta>/...
    const url = `${baseUrl}pantallas/intranet/paginas/nosotros.php`;

    const formData = new URLSearchParams({
        accion: 'cardUsuarios',
        ruta: almacenamientoUrl,
    });

    let response;
    let rawText = '';

    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData.toString(),
            cache: 'no-store',
        });

        rawText = await response.text();
    } catch (err) {
        console.error('[NOSOTROS] Error de red al contactar', url, err.message);
        return NextResponse.json(
            { message: 'No se pudo conectar con Dynamics' },
            { status: 502 }
        );
    }

    if (!response.ok) {
        console.error('[NOSOTROS] Dynamics respondió con status', response.status);
        return NextResponse.json(
            { message: 'Error consultando usuarios en Dynamics' },
            { status: 502 }
        );
    }

    const parsed = parseJsonClean(rawText);

    if (!parsed) {
        console.error('[NOSOTROS] Respuesta no es JSON válido. Snippet:', rawText.slice(0, 300));
        return NextResponse.json(
            { message: 'Dynamics devolvió una respuesta no válida' },
            { status: 502 }
        );
    }

    if (parsed.success === false) {
        // nosotros.php responde success:false + msj:'No se han encontrado datos'
        return NextResponse.json({
            success: true,
            count: 0,
            users: [],
            storageUrl: almacenamientoUrl,
        });
    }

    const msj = parsed.msj || {};
    const users = [];

    if (Array.isArray(msj)) {
        users.push(...msj);
    } else if (typeof msj === 'object' && msj !== null) {
        Object.keys(msj).forEach((key) => {
            if (!isNaN(key)) {
                users.push(msj[key]);
            }
        });
    }

    return NextResponse.json({
        success: true,
        count: msj.cantidad_registros || users.length,
        users,
        storageUrl: almacenamientoUrl,
    });
}