import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEGACY_BASE_URL = process.env.RUTA_API_DEV;
const LEGACY_ENDPOINT = `${LEGACY_BASE_URL.replace(/\/+$/, '')}/app/funciones.php`;

/**
 * Verifica si el usuario autenticado tiene el permiso indicado
 * (biometrico_todos o biometrico_areas) para mostrar las pestañas
 * "Todos" y "Mi Área" respectivamente.
 *
 * El body debe incluir: { mod_nombre: 'biometrico_todos' | 'biometrico_areas' }
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const modNombre = body.mod_nombre;
        const funId = body.fun_id ?? body.funId ?? body.id ?? body.userId ?? '';

        if (!modNombre) {
            return NextResponse.json(
                { message: 'Falta el nombre del permiso' },
                { status: 400 }
            );
        }

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

        return NextResponse.json(data, { status: legacyResponse.status });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/permiso]', error);
        return NextResponse.json(
            { message: 'No ha validado el permiso' },
            { status: 500 }
        );
    }
}
