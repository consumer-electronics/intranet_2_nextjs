import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;

/**
 * Endpoint proxy para comunicarse con ClassProject.php en Dynamics.
 * ClassProject.php gestiona los Retos, Compromisos y Capacitaciones (Additional Info).
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { method, param } = body;

        if (!method) {
            return NextResponse.json(
                { success: false, message: 'El método es requerido' },
                { status: 400 }
            );
        }

        const base = (LEGACY_BASE_URL || '').replace(/\/+$/, '');
        let dynamicsUrl = `${base}/pantallas/intranet/encuesta/ClassProject.php`;

        const payload = {
            class: 'ClassProject',
            method: method,
            param: param || {}
        };

        let legacyResponse = await fetch(dynamicsUrl, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Fallback local en caso de que URL_DYNAMICS sea de producción pero no esté disponible
        if (!legacyResponse.ok && legacyResponse.status === 404) {
            const localUrl = `http://dynamics_ceg.local/pantallas/intranet/encuesta/ClassProject.php`;
            legacyResponse = await fetch(localUrl, { 
                method: 'POST', 
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar Dynamics ClassProject: ${legacyResponse.status}`);
        }

        const json = await legacyResponse.json();
        return NextResponse.json(json);

    } catch (error) {
        console.error("Error en class-project:", error.message);
        return NextResponse.json(
            { success: false, message: 'No se pudo procesar la solicitud', error: error.message },
            { status: 500 }
        );
    }
}
