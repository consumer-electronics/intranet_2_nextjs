import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

/**
 * Ruta interna del submódulo "Registro de permisos por fecha".
 *
 * Hace de proxy hacia las acciones legacy del archivo
 * `solicitud_permisos.php` que devuelven JSON (no HTML):
 *   - listaYearPermisos      → años con registros.
 *   - listaMesesPermisos     → meses con registros de un año (param `ano`).
 *   - listaPermisosRegistros → registros aprobados/finalizados de un
 *                              año/mes/motivo (params `ano`, `mes`, `motivo`).
 *
 * El backend legacy devuelve un objeto JSON con la forma:
 *   {
 *     "sql": "...",
 *     "cantidad_registros": N,
 *     "cantidad_columnas": M,
 *     0: { ...fila... },
 *     1: { ...fila... },
 *     ...
 *   }
 *
 * Se normaliza a un arreglo plano `{ rows: [...] }` eliminando las claves
 * de metadatos (`sql`, `cantidad_registros`, `cantidad_columnas`).
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const accion = body.accion;

        const accionesValidas = [
            'listaYearPermisos',
            'listaMesesPermisos',
            'listaPermisosRegistros',
        ];
        if (!accionesValidas.includes(accion)) {
            return NextResponse.json(
                { message: 'Acción no válida para el registro de permisos.' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', accion);
        if (body.ano !== undefined && body.ano !== null && body.ano !== '') {
            formData.set('ano', String(body.ano));
        }
        if (body.mes !== undefined && body.mes !== null && body.mes !== '') {
            formData.set('mes', String(body.mes));
        }
        if (body.motivo !== undefined && body.motivo !== null) {
            formData.set('motivo', String(body.motivo));
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

        const text = (await legacyResponse.text()).trim();
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = null;
        }

        // Si el backend no devuelve JSON válido, se responde vacío.
        if (!parsed || typeof parsed !== 'object') {
            return NextResponse.json({ rows: [] });
        }

        // Elimina las claves de metadatos y conserva solo las filas indexadas.
        const rows = Object.keys(parsed)
            .filter(
                (key) =>
                    key !== 'sql' &&
                    key !== 'cantidad_registros' &&
                    key !== 'cantidad_columnas'
            )
            .map((key) => parsed[key])
            .filter((row) => row && typeof row === 'object');

        return NextResponse.json({ rows });
    } catch (error) {
        return NextResponse.json(
            { message: 'No se han podido traer los registros.', rows: [] },
            { status: 500 }
        );
    }
}
