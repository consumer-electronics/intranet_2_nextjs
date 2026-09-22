import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/ajax/usuarios.php`;

/**
 * Lista de usuarios CRESER a cargo del funcionario autenticado.
 *
 * Equivale a la llamada legacy:
 *   POST ajax/usuarios.php
 *     accion = listaUsuarioCreser
 *     id     = <fun_id>
 *
 * El backend de Dynamics devuelve HTML (filas <tr>) en texto plano.
 * Se retorna como JSON { html: string } para que el cliente lo renderice.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const funId = body.fun_id ?? body.id ?? '';

        const formData = new URLSearchParams();
        formData.set('accion', 'listaUsuarioCreser');
        formData.set('id', String(funId));

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
            cache: 'no-store',
        });

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar el servidor legacy: ${legacyResponse.status}`);
        }

        // El backend devuelve HTML (filas <tr>) en texto plano
        const html = await legacyResponse.text();

        return NextResponse.json({ html });
    } catch (error) {
        return NextResponse.json(
            { message: 'No se ha podido traer la lista de usuarios', html: '' },
            { status: 500 }
        );
    }
}
