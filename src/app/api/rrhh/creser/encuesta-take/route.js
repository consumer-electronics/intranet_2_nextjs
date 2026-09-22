import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;

/**
 * Endpoint proxy para obtener la estructura de la encuesta CRESER y guardarla.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const et_id = searchParams.get('et_id');

        if (!et_id) {
            return NextResponse.json(
                { success: false, message: 'et_id es requerido' },
                { status: 400 }
            );
        }

        const base = (LEGACY_BASE_URL || '').replace(/\/+$/, '');
        let dynamicsUrl = `${base}/pantallas/intranet/encuesta/creser_take_api.php?et_id=${et_id}`;

        let legacyResponse = await fetch(dynamicsUrl, { method: 'GET', cache: 'no-store' });

        if (!legacyResponse.ok && legacyResponse.status === 404) {
            const localUrl = `http://dynamics_ceg.local/pantallas/intranet/encuesta/creser_take_api.php?et_id=${et_id}`;
            legacyResponse = await fetch(localUrl, { method: 'GET', cache: 'no-store' });
        }

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar Dynamics: ${legacyResponse.status}`);
        }

        const json = await legacyResponse.json();
        return NextResponse.json(json);

    } catch (error) {
        console.error("Error en encuesta-take GET:", error.message);
        return NextResponse.json(
            { success: false, message: 'No se pudo obtener la estructura de la encuesta', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // En POST esperamos FormData porque el backend legacy lo lee con $_REQUEST y $_POST
        const formData = await request.formData();
        
        const base = (LEGACY_BASE_URL || '').replace(/\/+$/, '');
        let dynamicsUrl = `${base}/pantallas/intranet/encuesta/ejecutar_acciones.php`;

        // Se retransmite como formData
        let legacyResponse = await fetch(dynamicsUrl, {
            method: 'POST',
            body: formData,
            cache: 'no-store'
        });

        if (!legacyResponse.ok && legacyResponse.status === 404) {
            const localUrl = `http://dynamics_ceg.local/pantallas/intranet/encuesta/ejecutar_acciones.php`;
            legacyResponse = await fetch(localUrl, {
                method: 'POST',
                body: formData,
                cache: 'no-store'
            });
        }

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar Dynamics guardar_encuesta: ${legacyResponse.status}`);
        }

        const textResponse = await legacyResponse.text();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(textResponse);
        } catch (e) {
            jsonResponse = { exito: 0, text: textResponse };
        }

        return NextResponse.json(jsonResponse);

    } catch (error) {
        console.error("Error en encuesta-take POST:", error.message);
        return NextResponse.json(
            { exito: 0, message: 'No se pudo procesar la solicitud', error: error.message },
            { status: 500 }
        );
    }
}
