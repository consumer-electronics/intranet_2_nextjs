import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = (
    process.env.URL_DYNAMICS
).replace(/\/+$/, '');

const LEGACY_SALA_JUNTAS_URL = `${BACKEND_BASE_URL}/pantallas/intranet/paginas/gestion_humana/sala_juntas.php`;

export async function POST(request) {
    try {
        const body = await request.json();

        const { id } = body;

        if (!id) {
            return NextResponse.json(
                {
                    error:
                        'El identificador de la reservación es obligatorio.',
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

        const formData = new URLSearchParams();

        formData.append(
            'accion',
            'eliminarReservacion',
        );

        formData.append(
            'id',
            String(id),
        );

        const response = await fetch(
            LEGACY_SALA_JUNTAS_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                cache: 'no-store',
            },
        );

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error:
                        'Error eliminando la reservación.',
                    detail: text,
                },
                { status: response.status },
            );
        }

        const resultado = text.trim();

        if (resultado === '1') {
            return NextResponse.json({
                success: true,
                resultado: 1,
            });
        }

        try {
            return NextResponse.json(JSON.parse(resultado));
        } catch {
            return NextResponse.json({
                success: false,
                resultado,
            });
        }
    } catch (error) {
        console.error(
            'POST /api/rrhh/sala-juntas/eliminar:',
            error,
        );

        return NextResponse.json(
            {
                error:
                    'Error interno eliminando la reservación.',
            },
            { status: 500 },
        );
    }
}