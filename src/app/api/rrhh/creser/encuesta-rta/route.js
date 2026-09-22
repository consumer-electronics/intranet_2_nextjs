import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;

/**
 * Obtiene los datos detallados de una evaluación CRESER desde el nuevo endpoint de Dynamics.
 *
 * Dynamics ahora expone el JSON a través de `creser_view_rta_api.php`.
 * Body esperado: { et_id, ere_id, idUsu }
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { et_id, ere_id, idUsu } = body;

        if (!et_id || !ere_id) {
            return NextResponse.json(
                { message: 'et_id y ere_id son requeridos' },
                { status: 400 }
            );
        }

        const base = (LEGACY_BASE_URL || '').replace(/\/+$/, '');
        const params = new URLSearchParams({
            et_id: String(et_id),
            ere_id: String(ere_id),
            ...(idUsu ? { idUsu: String(idUsu) } : {}),
        });

        const dynamicsUrl = `${base}/pantallas/intranet/encuesta/creser_view_rta_api.php?${params.toString()}`;

        let legacyResponse = await fetch(dynamicsUrl, {
            method: 'GET',
            cache: 'no-store',
        });

        // Si falla en producción/desarrollo por no estar subido, intentamos el entorno local
        if (!legacyResponse.ok && legacyResponse.status === 404) {
            const localBase = 'http://dynamics_ceg.local';
            const localUrl = `${localBase}/pantallas/intranet/encuesta/creser_view_rta_api.php?${params.toString()}`;
            legacyResponse = await fetch(localUrl, { method: 'GET', cache: 'no-store' });
        }

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar Dynamics: ${legacyResponse.status}`);
        }

        const json = await legacyResponse.json();

        return NextResponse.json(json);
    } catch (error) {
        console.error("Error en encuesta-rta:", error.message);
        return NextResponse.json(
            { message: 'No se pudo obtener el detalle de la evaluación', error: error.message },
            { status: 500 }
        );
    }
}
