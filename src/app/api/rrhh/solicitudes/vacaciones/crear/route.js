import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos_vacas.php`;

/**
 * Crea una solicitud de vacaciones.
 *
 * Equivale a la acción legacy `crearPermiso` del archivo
 * `solicitud_permisos_vacas.php`. El formulario original se envía como
 * multipart/form-data con los campos:
 *   - idUsu
 *   - formInicioPermiso (YYYY-MM-DD)
 *   - formInicioDias (1-30)
 *   - observaciones
 *   - rol (cargo del usuario, desde dataUser.car_nombre)
 *
 * El backend responde con el JSON del nuevo registro (contiene sp_id) o con
 * un mensaje de error en texto plano.
 */
export async function POST(request) {
    try {
        const incoming = await request.formData().catch(() => null);
        if (!incoming) {
            return NextResponse.json(
                { message: 'No se recibieron los datos del formulario.' },
                { status: 400 }
            );
        }

        // Reconstruye el FormData para reenviarlo al backend legacy.
        const formData = new FormData();
        formData.set('accion', 'crearPermiso');

        const fields = [
            'idUsu',
            'formInicioPermiso',
            'formInicioDias',
            'observaciones',
            'rol',
        ];

        fields.forEach((key) => {
            const value = incoming.get(key);
            if (value != null) formData.set(key, String(value));
        });

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        const text = (await legacyResponse.text()).trim();

        // Respuestas de error en texto plano (mensajes de validación).
        const erroresConocidos = [
            'Fecha no valida',
            'Dias no validos',
            'Ya existe un permiso aprobado o en espera que se cruza con las fechas seleccionadas.',
            'No tiene un jefe asignado para aprobar el permiso, por favor contacte a gestión humana.',
            'El usuario no tiene un correo asignado, por favor contacte a gestión humana.',
            'Su jefe no tiene correo asignado, por favor contacte a gestión humana.',
            'Su usuario no está registrado en Yéminus',
            'No se encontró un jefe asignado a su usuario en Yéminus',
            'Su jefe no tiene un correo asignado en Yéminus',
        ];

        if (erroresConocidos.some((e) => text.includes(e))) {
            return NextResponse.json(
                { ok: false, message: text },
                { status: legacyResponse.ok ? 200 : legacyResponse.status }
            );
        }

        // Intenta parsear el JSON de éxito (contiene sp_id del nuevo permiso).
        try {
            const parsed = JSON.parse(text);
            return NextResponse.json({ ok: true, data: parsed });
        } catch (_) {
            return NextResponse.json(
                { ok: false, message: text || 'No se ha podido enviar el formulario.' },
                { status: legacyResponse.ok ? 200 : legacyResponse.status }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: 'No se ha podido enviar el formulario.' },
            { status: 500 }
        );
    }
}
