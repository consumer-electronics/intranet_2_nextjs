import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${LEGACY_BASE_URL.replace(/\/+$/, '')}/pantallas/intranet/paginas/biometrico/index.php`;

export async function POST(request) {
    try {
        const formData = new URLSearchParams();
        formData.set('accion', 'sincronizar');

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

        // El backend devuelve "Ok" o "No existen datos para sincronizar."
        const ok = text.trim().toLowerCase() === 'ok';

        return NextResponse.json({
            data: {
                ok,
                message: ok ? 'Sincronización completada' : text.trim(),
            },
        });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/sincronizar]', error);
        return NextResponse.json(
            { message: 'No se pudo sincronizar el dispositivo biométrico' },
            { status: 500 }
        );
    }
}
