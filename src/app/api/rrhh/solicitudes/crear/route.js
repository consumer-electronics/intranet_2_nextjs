import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

/**
 * Crea una solicitud de permiso.
 *
 * Equivale a la acción legacy `crearPermiso`. El formulario original
 * se envía como multipart/form-data (incluye un archivo opcional
 * `docPermission` de máx. 5MB: pdf/jpg/jpeg/png).
 *
 * Este handler recibe el mismo FormData desde el cliente y lo reenvía
 * al endpoint legacy conservando el archivo.
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
            'motivo_permiso',
            'reposicion',
            'formInicioPermiso',
            'formInicioHora',
            'formFinalPermiso',
            'formFinHora',
            'observaciones',
            'fecha',
            'nombre',
            'cedula',
            'area',
        ];

        fields.forEach((key) => {
            const value = incoming.get(key);
            if (value != null) formData.set(key, String(value));
        });

        // Archivo opcional docPermission
        const file = incoming.get('docPermission');
        if (file && typeof file !== 'string' && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            formData.set(
                'docPermission',
                new Blob([buffer], { type: file.type || 'application/octet-stream' }),
                file.name
            );
        }

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        const text = (await legacyResponse.text()).trim();

        if (text === 'Ok') {
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json(
            { ok: false, message: text || 'No se ha podido enviar el formulario.' },
            { status: legacyResponse.ok ? 200 : legacyResponse.status }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'No se ha podido enviar el formulario.' },
            { status: 500 }
        );
    }
}
