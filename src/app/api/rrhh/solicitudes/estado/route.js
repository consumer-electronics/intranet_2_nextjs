import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

/**
 * Resuelve el id del funcionario autenticado (idAutoriza) reutilizando
 * el endpoint interno /api/auth/me.
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
 * Cambia el estado de un permiso.
 *
 * Equivale a la acción legacy `cambioEstadoPermiso`:
 *   - Aprobar  → idEstado = 3
 *   - Rechazar → idEstado = 4
 *   - Anular   → idEstado = 2
 *
 * El backend responde "Ok" en caso de éxito.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idPermiso = body.idPermiso ?? body.id ?? '';
        const idEstado = body.idEstado ?? '';

        let idAutoriza = body.idAutoriza;
        if (!idAutoriza) {
            const user = await resolveUser(request);
            idAutoriza = user?.funId ?? '';
        }

        if (!idPermiso || !idEstado) {
            return NextResponse.json(
                { message: 'Faltan parámetros para cambiar el estado.' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'cambioEstadoPermiso');
        formData.set('idPermiso', String(idPermiso));
        formData.set('idEstado', String(idEstado));
        if (idAutoriza) formData.set('idAutoriza', String(idAutoriza));

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

        if (text === 'Ok') {
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json(
            { ok: false, message: text || 'No se pudo cambiar el estado.' },
            { status: legacyResponse.ok ? 200 : legacyResponse.status }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al cambiar el estado del permiso.' },
            { status: 500 }
        );
    }
}
