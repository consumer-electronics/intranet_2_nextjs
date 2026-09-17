import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API_DEV;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/app/funciones.php`;

/**
 * Valida si el usuario autenticado tiene acceso a un submódulo de
 * "Solicitudes de Vacaciones".
 *
 * Equivale a la llamada legacy:
 *   POST app/funciones.php
 *     ejecutar_accion = permiso_fun_app
 *     mod_tipo        = intranet
 *     fun_id          = <id>
 *     mod_nombre      = <vacaciones_todos>
 *
 * El backend devuelve un array JSON; si está vacío el usuario NO tiene
 * permiso. Se normaliza a un booleano `{ granted }`.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const funId = body.fun_id ?? body.funId ?? body.id ?? body.userId ?? '';
        const modNombre = body.mod_nombre ?? 'vacaciones_todos';

        const formData = new URLSearchParams();
        formData.set('ejecutar_accion', 'permiso_fun_app');
        formData.set('mod_tipo', 'intranet');
        formData.set('fun_id', String(funId ?? ''));
        formData.set('mod_nombre', modNombre);

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        const text = await legacyResponse.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        // El backend devuelve un array; vacío => sin permiso.
        const granted = Array.isArray(data) ? data.length > 0 : Boolean(data);

        return NextResponse.json({ granted, mod_nombre: modNombre });
    } catch (error) {
        return NextResponse.json(
            { message: 'No ha validado el permiso', granted: false },
            { status: 500 }
        );
    }
}
