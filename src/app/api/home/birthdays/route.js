import { NextResponse } from 'next/server';

const DYNAMICS_BASE_URL = process.env.RUTA_API;

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
        console.error('[BIRTHDAYS] RUTA_API no está configurada');

        return NextResponse.json(
            {
                message: 'RUTA_API no está configurada',
            },
            { status: 500 }
        );
    }

    const baseUrl = DYNAMICS_BASE_URL.endsWith('/')
        ? DYNAMICS_BASE_URL
        : `${DYNAMICS_BASE_URL}/`;

    // Endpoint utilizado originalmente por la intranet PHP.
    const url = `${baseUrl}pantallas/intranet/birthday/index.php`;

    const formData = new URLSearchParams({
        accion: 'birthdayUser',
        ruta: `${baseUrl}almacenamiento/`,
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData.toString(),
            cache: 'no-store',
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error(
                '[BIRTHDAYS] Dynamics respondió con error:',
                response.status
            );

            return NextResponse.json(
                {
                    message: 'Error consultando cumpleaños en Dynamics',
                },
                { status: 502 }
            );
        }

        const data = parseJsonClean(responseText);

        if (!data) {
            console.error(
                '[BIRTHDAYS] La respuesta de Dynamics no es JSON válido. Snippet:',
                responseText.slice(0, 300)
            );

            return NextResponse.json(
                {
                    message: 'Dynamics devolvió una respuesta no válida',
                },
                { status: 502 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(
            '[BIRTHDAYS] Error conectando con Dynamics:',
            error
        );

        return NextResponse.json(
            {
                message: 'No se pudo conectar con Dynamics',
            },
            { status: 502 }
        );
    }
}