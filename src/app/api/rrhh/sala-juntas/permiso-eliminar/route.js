import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.RUTA_API_DEV;

export async function GET(request) {
    try {
        if (!BACKEND_URL) {
            return NextResponse.json(
                {
                    permitido: false,
                    error:
                        'No está configurada la variable RUTA_API.',
                },
                { status: 500 },
            );
        }

        const { searchParams } = new URL(request.url);
        const funId =
            searchParams.get('fun_id') ||
            searchParams.get('idUsu') ||
            searchParams.get('userId');

        const params = new URLSearchParams({
            ejecutar_accion: 'permiso_fun_app',
            mod_tipo: 'intranet',
            mod_nombre: 'sala_juntas_eliminar',
        });

        if (funId) {
            params.set('fun_id', funId);
        }

        const response = await fetch(
            `${BACKEND_URL}/app/funciones.php?${params.toString()}`,
            {
                method: 'GET',
                cache: 'no-store',
            },
        );

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                {
                    permitido: false,
                    detail: text,
                },
                { status: response.status },
            );
        }

        try {
            const data = JSON.parse(text);

            return NextResponse.json({
                permitido:
                    Array.isArray(data) &&
                    data.length === 1,
            });
        } catch {
            return NextResponse.json({
                permitido: false,
            });
        }
    } catch (error) {
        console.error(
            'GET /api/rrhh/sala-juntas/permiso-eliminar:',
            error,
        );

        return NextResponse.json(
            {
                permitido: false,
            },
            { status: 500 },
        );
    }
}