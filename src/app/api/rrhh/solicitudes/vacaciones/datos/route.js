import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos_vacas.php`;

/**
 * Obtiene los detalles de un permiso de vacaciones (acción 'datoss' legacy).
 * Utilizado para obtener la fecha de fin, fecha de reintegro y token
 * necesarios para generar el PDF y enviar correos de creación.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idUsu = body.idUsu ?? '';
        const idPermiso = body.idPermiso ?? '';

        if (!idPermiso) {
            return NextResponse.json(
                { message: 'Falta idPermiso' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'datoss');
        formData.set('idUsu', String(idUsu));
        formData.set('idPermiso', String(idPermiso));

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
        const trimmed = text.trim();

        if (!legacyResponse.ok) {
            return NextResponse.json(
                { message: trimmed || 'Error al obtener datos' },
                { status: legacyResponse.status }
            );
        }

        try {
            const data = JSON.parse(trimmed);
            return NextResponse.json({ ok: true, data });
        } catch (err) {
            return NextResponse.json(
                { message: 'No se pudo procesar la respuesta del servidor' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al comunicarse con el servidor' },
            { status: 500 }
        );
    }
}
