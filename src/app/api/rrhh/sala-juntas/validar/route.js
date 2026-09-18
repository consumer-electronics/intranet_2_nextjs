import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = (
    process.env.URL_DYNAMICS
).replace(/\/+$/, '');

const LEGACY_SALA_JUNTAS_URL = `${BACKEND_BASE_URL}/pantallas/intranet/paginas/gestion_humana/sala_juntas.php`;

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            inicio,
            fin,
            sala,
        } = body;

        if (!inicio || !fin || !sala) {
            return NextResponse.json(
                {
                    error:
                        'inicio, fin y sala son obligatorios.',
                },
                { status: 400 },
            );
        }

        if (!BACKEND_BASE_URL) {
            return NextResponse.json(
                {
                    error:
                        'No está configurada la variable URL_DYNAMICS.',
                },
                { status: 500 },
            );
        }

        const params = new URLSearchParams({
            accion: 'validar',
            inicio,
            fin,
            sala: String(sala),
        });

        const response = await fetch(
            `${LEGACY_SALA_JUNTAS_URL}?${params.toString()}`,
            {
                method: 'GET',
                cache: 'no-store',
            },
        );

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: 'Error validando disponibilidad.',
                    detail: text,
                },
                { status: response.status },
            );
        }

        try {
            return NextResponse.json(JSON.parse(text));
        } catch {
            return NextResponse.json(
                {
                    error: 'Respuesta inválida del backend.',
                    detail: text,
                },
                { status: 502 },
            );
        }
    } catch (error) {
        console.error(
            'POST /api/rrhh/sala-juntas/validar:',
            error,
        );

        return NextResponse.json(
            {
                error:
                    'Error interno validando disponibilidad.',
            },
            { status: 500 },
        );
    }
}