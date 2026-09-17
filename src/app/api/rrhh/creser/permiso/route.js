import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API_DEV;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/app/funciones.php`;

/**
 * Verifica si el usuario autenticado tiene acceso al módulo CRESER (reportes).
 *
 * Equivale a la llamada legacy:
 *   POST app/funciones.php
 *     ejecutar_accion = permiso_fun_app
 *     mod_tipo        = intranet
 *     fun_id          = <id>
 *     mod_nombre      = registros_creser
 *
 * El backend devuelve un array JSON; si está vacío el usuario NO tiene permiso.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const funId = body.fun_id ?? body.funId ?? body.id ?? '';

        const formData = new URLSearchParams();
        formData.set('ejecutar_accion', 'permiso_fun_app');
        formData.set('mod_tipo', 'intranet');
        formData.set('fun_id', String(funId));
        formData.set('mod_nombre', 'registros_creser');

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

        const granted = Array.isArray(data) ? data.length > 0 : Boolean(data);

        return NextResponse.json({ granted });
    } catch (error) {
        return NextResponse.json(
            { message: 'No ha validado el permiso', granted: false },
            { status: 500 }
        );
    }
}
