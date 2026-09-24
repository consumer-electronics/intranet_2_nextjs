import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

/**
 * Realiza una consulta directa individual al backend legacy de permisos por fecha.
 */
async function fetchSingleLegacyRegistros(ano, mes, motivo) {
    const formData = new URLSearchParams();
    formData.set('accion', 'listaPermisosRegistros');
    if (ano !== undefined && ano !== null && ano !== '') {
        formData.set('ano', String(ano));
    }
    if (mes !== undefined && mes !== null && mes !== '') {
        formData.set('mes', String(mes));
    }
    if (motivo !== undefined && motivo !== null && motivo !== '') {
        formData.set('motivo', String(motivo));
    }

    try {
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

        if (!parsed || typeof parsed !== 'object') {
            return [];
        }

        return Object.keys(parsed)
            .filter(
                (key) =>
                    key !== 'sql' &&
                    key !== 'cantidad_registros' &&
                    key !== 'cantidad_columnas'
            )
            .map((key) => parsed[key])
            .filter((row) => row && typeof row === 'object');
    } catch (_) {
        return [];
    }
}

/**
 * Ruta interna del submódulo "Registro de permisos por fecha".
 *
 * Soporta agregación automática cuando el usuario selecciona "TODOS" los meses
 * o "Todos" los motivos de permiso (motivos 1=Médica, 2=Urgencia, 3=Laboral, 4=Personal).
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

        // ── Consulta de registros con agregación de "TODOS" los meses y "Todos" los motivos ──
        if (accion === 'listaPermisosRegistros') {
            const ano = body.ano;
            const mes = body.mes;
            const motivo = body.motivo;

            // Determinar meses a consultar
            let monthsToFetch = [];
            if (mes === 'TODOS' || mes === '' || mes === null || mes === undefined) {
                monthsToFetch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            } else {
                monthsToFetch = [mes];
            }

            // Determinar motivos a consultar
            // 1 = Médica, 2 = Urgencia Médica, 3 = Laboral, 4 = Personal, 5 / '' = Todos
            let motivosToFetch = [];
            if (
                motivo === 5 ||
                String(motivo) === '5' ||
                motivo === '' ||
                motivo === null ||
                motivo === undefined
            ) {
                motivosToFetch = [1, 2, 3, 4];
            } else {
                motivosToFetch = [motivo];
            }

            // Ejecutamos consultas en paralelo
            const requests = [];
            for (const m of monthsToFetch) {
                for (const mot of motivosToFetch) {
                    requests.push(fetchSingleLegacyRegistros(ano, m, mot));
                }
            }

            const resultsArray = await Promise.all(requests);
            const allRows = resultsArray.flat();

            // Deduplicamos por clave única de la fila
            const seen = new Set();
            const uniqueRows = [];
            for (const row of allRows) {
                const key = `${row.sp_id || ''}-${row.persona || ''}-${row.sp_fecha_inicio || ''}-${row.sp_hora_inicio || ''}-${row.codigo || ''}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueRows.push(row);
                }
            }

            return NextResponse.json({ rows: uniqueRows });
        }

        // Peticiones estándar para listaYearPermisos y listaMesesPermisos
        const formData = new URLSearchParams();
        formData.set('accion', accion);
        if (body.ano !== undefined && body.ano !== null && body.ano !== '') {
            formData.set('ano', String(body.ano));
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

        if (!parsed || typeof parsed !== 'object') {
            return NextResponse.json({ rows: [] });
        }

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
