import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos_vacas.php`;

/**
 * Descarga el PDF de una solicitud de vacaciones.
 *
 * Equivale a la acción legacy `traerPdf` del archivo
 * `solicitud_permisos_vacas.php`. El backend devuelve el binario del PDF
 * (Content-Type: application/pdf) o un 404 si no existe.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idPermiso = body.idPermiso ?? body.id ?? '';

        if (!idPermiso) {
            return NextResponse.json(
                { message: 'Falta el id del permiso.' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'traerPdf');
        formData.set('idPermiso', String(idPermiso));

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
            cache: 'no-store',
        });

        if (!legacyResponse.ok) {
            return NextResponse.json(
                { message: 'Archivo PDF no disponible.' },
                { status: legacyResponse.status === 404 ? 404 : legacyResponse.status }
            );
        }

        const arrayBuffer = await legacyResponse.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${idPermiso}.pdf"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al obtener el PDF.' },
            { status: 500 }
        );
    }
}
