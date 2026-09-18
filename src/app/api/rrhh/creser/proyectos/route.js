import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/ajax/usuarios.php`;

/**
 * Registro de proyectos y formación por periodo.
 *
 * Equivale a la llamada legacy:
 *   POST ajax/usuarios.php
 *     accion  = registroProyectoyFormacion
 *     periodo = <id_periodo>
 *
 * Devuelve JSON { success, msj: { cantidad_registros, [i]: { area, nombre_completo, formacion, proyecto } } }
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const periodo = body.periodo ?? '';

        const formData = new URLSearchParams();
        formData.set('accion', 'registroProyectoyFormacion');
        formData.set('periodo', String(periodo));

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        if (!legacyResponse.ok) {
            throw new Error(`Error legacy: ${legacyResponse.status}`);
        }

        const text = await legacyResponse.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { success: false, msj: 'Respuesta inválida del servidor' };
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, msj: 'No se ha podido cargar la lista de formación' },
            { status: 500 }
        );
    }
}
