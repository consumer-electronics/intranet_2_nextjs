import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/permisos_vacas/modificar_pdf.php`;

/**
 * Genera o modifica el PDF de una solicitud de vacaciones.
 *
 * Equivale a las llamadas legacy a `permisos_vacas/modificar_pdf.php`:
 *   - modificar_pdf  → genera el PDF rellenando la plantilla (devuelve binario PDF)
 *   - pdf_aprobado   → marca "Permiso aprobado via intranet" sobre el PDF (JSON)
 *   - pdf_reversado  → marca "Permiso REVERSADO via intranet" sobre el PDF (JSON)
 *
 * Para `modificar_pdf` el frontend legacy primero consulta `periodosYeminus`
 * (acción de `solicitud_permisos_vacas.php`) para obtener `fechaIniYem` y
 * `fechaFinYem`, y luego envía esos valores junto con el resto de datos.
 * Este handler reenvía los parámetros recibidos tal cual.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const accion = body.accion ?? '';

        if (!accion) {
            return NextResponse.json(
                { message: 'Falta la acción de PDF.' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', accion);

        // Reenvía todos los campos recibidos (nombre, idUsu, dias, fechas, etc.)
        Object.entries(body).forEach(([key, value]) => {
            if (key === 'accion') return;
            if (value == null) return;
            formData.set(key, String(value));
        });

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
            cache: 'no-store',
        });

        const contentType = legacyResponse.headers.get('content-type') || '';

        // `modificar_pdf` devuelve el binario del PDF.
        if (accion === 'modificar_pdf' && contentType.includes('application/pdf')) {
            if (!legacyResponse.ok) {
                return NextResponse.json(
                    { message: 'No se pudo generar el PDF.' },
                    { status: legacyResponse.status || 500 }
                );
            }
            const arrayBuffer = await legacyResponse.arrayBuffer();
            const idPermiso = body.idPermiso ?? 'solicitud';
            return new NextResponse(arrayBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${idPermiso}.pdf"`,
                },
            });
        }

        // `pdf_aprobado` / `pdf_reversado` (y errores) devuelven texto/JSON.
        const text = (await legacyResponse.text()).trim();

        if (!legacyResponse.ok) {
            return NextResponse.json(
                { ok: false, message: text || 'Error al modificar el PDF.' },
                { status: legacyResponse.status || 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: text || 'PDF modificado.',
        });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: 'Error al modificar el PDF.' },
            { status: 500 }
        );
    }
}
