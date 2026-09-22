import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/creser.php`;

/**
 * Gestión de periodos CRESER (listar, crear, actualizar).
 *
 * Soporta las siguientes acciones:
 *
 * - listaPeriodos
 *     Devuelve JSON con { cantidad_registros, [i]: { cp_id, cp_fecha_inicio, cp_fecha_fin, cp_descripcion } }
 *
 * - crearPeriodo
 *     Crea un nuevo periodo. Requiere: periodoInicio, peridodFinal, peridoDescripcion, idUsuario
 *     Devuelve: JSON true / "true"
 *
 * - actualizarPerdidos (nombre legacy conservado)
 *     Actualiza un periodo existente. Requiere: id, incioPeriodo, finalPeriodo, peridoDescripcion
 *     Devuelve: JSON true
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const accion = body.accion ?? '';

        if (!accion) {
            return NextResponse.json({ message: 'Acción requerida' }, { status: 400 });
        }

        const formData = new URLSearchParams();
        formData.set('accion', accion);

        // Parámetros según la acción
        if (accion === 'crearPeriodo') {
            formData.set('periodoInicio', body.periodoInicio ?? '');
            formData.set('peridodFinal', body.peridodFinal ?? '');
            formData.set('peridoDescripcion', body.peridoDescripcion ?? '');
            formData.set('idUsuario', String(body.idUsuario ?? ''));
        } else if (accion === 'actualizarPerdidos') {
            formData.set('id', String(body.id ?? ''));
            formData.set('incioPeriodo', body.incioPeriodo ?? '');
            formData.set('finalPeriodo', body.finalPeriodo ?? '');
            formData.set('peridoDescripcion', body.peridoDescripcion ?? '');
        }

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
            // El backend a veces devuelve "true" como string
            data = text === 'true' || text === '"true"' ? true : text;
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al procesar la solicitud de periodos' },
            { status: 500 }
        );
    }
}
