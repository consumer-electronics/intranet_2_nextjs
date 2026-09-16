import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = (
    process.env.RUTA_API_DEV
).replace(/\/+$/, '');

const LEGACY_SALA_JUNTAS_URL = `${BACKEND_BASE_URL}/pantallas/intranet/paginas/gestion_humana/sala_juntas.php`;

function extractJsonPayload(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

    if (match && match[1]) {
        return match[1];
    }

    return text.trim();
}

function toLegacyDateTimeISO(date) {
    const pad = (value) => String(value).padStart(2, '0');
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absolute = Math.abs(offset);
    const hours = pad(Math.floor(absolute / 60));
    const minutes = pad(absolute % 60);

    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
            date.getSeconds(),
        )}${sign}${hours}:${minutes}`;
}

function getDefaultDateRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
        start: toLegacyDateTimeISO(start),
        end: toLegacyDateTimeISO(end),
    };
}

export async function GET(request) {
    try {
        if (!BACKEND_BASE_URL) {
            return NextResponse.json(
                {
                    error:
                        'No está configurada la variable RUTA_API.',
                },
                { status: 500 },
            );
        }

        const { searchParams } = new URL(request.url);
        const range = getDefaultDateRange();
        const start = searchParams.get('start') || range.start;
        const end = searchParams.get('end') || range.end;
        const idUsu = searchParams.get('idUsu');

        const params = new URLSearchParams({
            accion: 'reservaciones',
            start,
            end,
        });

        if (idUsu) {
            params.set('idUsu', idUsu);
        }

        const response = await fetch(
            `${LEGACY_SALA_JUNTAS_URL}?${params.toString()}`,
            {
                method: 'GET',
                cache: 'no-store',
                credentials: 'include',
            },
        );

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: 'Error consultando reservaciones.',
                    detail: text,
                },
                { status: response.status },
            );
        }

        try {
            const cleanText = extractJsonPayload(text);
            return NextResponse.json(JSON.parse(cleanText));
        } catch {
            return NextResponse.json(
                {
                    error: 'El backend no retornó JSON válido.',
                    detail: text,
                },
                { status: 502 },
            );
        }
    } catch (error) {
        console.error(
            'GET /api/rrhh/sala-juntas:',
            error,
        );

        return NextResponse.json(
            {
                error: 'Error interno consultando las reservaciones.',
            },
            { status: 500 },
        );
    }
}