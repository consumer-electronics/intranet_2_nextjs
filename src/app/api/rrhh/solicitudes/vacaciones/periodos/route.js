import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos_vacas.php`;

/**
 * Obtiene el periodo de vacaciones vigente del usuario desde Yeminus.
 *
 * Equivale a la acción legacy `periodosYeminus` del archivo
 * `solicitud_permisos_vacas.php`. Se usa antes de generar el PDF de una
 * solicitud de vacaciones para conocer las fechas del periodo.
 *
 * Devuelve `{ fechaInicio, fechaFin }` (pueden ser null si el cargo del
 * usuario no permite conocer su periodo).
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idUsuYem = body.idUsuYem ?? body.idYem ?? body.id ?? '';

        if (!idUsuYem) {
            return NextResponse.json(
                { message: 'Falta el código de empleado en Yeminus.' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'periodosYeminus');
        formData.set('idUsuYem', String(idUsuYem));

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
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { fechaInicio: null, fechaFin: null };
        }

        return NextResponse.json({
            fechaInicio: data?.fechaInicio ?? null,
            fechaFin: data?.fechaFin ?? null,
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al consultar el periodo de vacaciones.' },
            { status: 500 }
        );
    }
}
