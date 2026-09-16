import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

/**
 * Resuelve el id del funcionario autenticado reutilizando el endpoint
 * interno /api/auth/me.
 */
async function resolveUser(request) {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const meRes = await fetch(new URL('/api/auth/me', request.url), {
        headers: { cookie: cookieHeader },
        cache: 'no-store',
    });

    if (!meRes.ok) return null;

    const me = await meRes.json();
    const userObj = me?.user || me?.data?.user || me?.data;

    return {
        funId:
            userObj?.fun_id ??
            userObj?.funId ??
            userObj?.id ??
            userObj?.id_usuario ??
            null,
    };
}

/**
 * Devuelve el número de solicitudes de vacaciones pendientes de los
 * subordinados (badge rojo). Equivale a la acción `numeroSoliVacas`.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        let id = body.id;
        if (!id) {
            const user = await resolveUser(request);
            id = user?.funId ?? '';
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'numeroSoliVacas');
        if (id) formData.set('id', String(id));

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        const text = (await legacyResponse.text()).trim();
        const numero = Number(text);
        return NextResponse.json({ numero: Number.isNaN(numero) ? 0 : numero });
    } catch (error) {
        return NextResponse.json({ numero: 0 });
    }
}
