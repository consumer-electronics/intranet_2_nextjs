import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const cookieHeader = request.headers.get('cookie') ?? '';

        const meRes = await fetch(new URL('/api/auth/me', request.url), {
            headers: { cookie: cookieHeader },
            cache: 'no-store',
        });

        console.log('[DEBUG /api/rrhh/desprendibles] meRes.status:', meRes.status);

        if (!meRes.ok) {
            console.log('[DEBUG /api/rrhh/desprendibles] meRes no es OK');
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const me = await meRes.json();
        const userObj = me?.user || me?.data?.user || me?.data;
        const cedula = userObj?.dni || userObj?.cedula || userObj?.fun_cedula || userObj?.fun_usuario || userObj?.id_usuario;

        console.log('[DEBUG /api/rrhh/desprendibles] Cédula obtenida:', cedula);

        if (!cedula) {
            return NextResponse.json({ error: 'No se pudo identificar la cédula del usuario' }, { status: 401 });
        }

        const baseUrl = process.env.RUTA_API.endsWith('/') ? process.env.RUTA_API : `${process.env.RUTA_API}/`;
        const dynamicsUrl = `${baseUrl}pantallas/intranet/paginas/gestion_humana/desprendibles_nomina.php`;

        console.log('[DEBUG /api/rrhh/desprendibles] URL consultada en Dynamics:', dynamicsUrl);

        const dynamicsRes = await fetch(dynamicsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ user: cedula }),
            cache: 'no-store',
        });

        if (!dynamicsRes.ok) {
            console.log('[DEBUG /api/rrhh/desprendibles] dynamicsRes status NO OK:', dynamicsRes.status);
            return NextResponse.json(
                { error: 'Dynamics devolvió una respuesta no válida o el servicio no está disponible' },
                { status: 502 }
            );
        }

        const raw = await dynamicsRes.json();
        console.log('[DEBUG /api/rrhh/desprendibles] raw response de Dynamics:', JSON.stringify(raw, null, 2));
        const files = raw?.data?.files ?? raw?.files ?? [];

        return NextResponse.json({ data: { files } });
    } catch (error) {
        console.error('[GET /api/rrhh/desprendibles]', error);
        return NextResponse.json({ error: 'Error al obtener los desprendibles de nómina' }, { status: 500 });
    }
}