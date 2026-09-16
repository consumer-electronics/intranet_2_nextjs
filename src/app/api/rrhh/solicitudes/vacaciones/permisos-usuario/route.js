import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos_vacas.php`;

/**
 * Resuelve el id del funcionario autenticado (userLogin) reutilizando
 * el endpoint interno /api/auth/me.
 */
async function resolveUser(request) {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const meRes = await fetch(new URL('/api/auth/me', request.url), {
        headers: { cookie: cookieHeader },
        cache: 'no-store',
    });

    if (!meRes.ok) return null;

    const me = await meRes.json();
    const userObj = me?.user || me?.data?.user || me?.data;

    return {
        funId:
            userObj?.fun_id ??
            userObj?.funId ??
            userObj?.id ??
            userObj?.id_usuario ??
            null,
    };
}

function cleanCell(value) {
    const cleaned = String(value ?? '').replace(/\s+/g, ' ').trim();
    return cleaned === 'N/A' ? '' : cleaned;
}

/**
 * Extrae el id del permiso desde un onClick de aprobar/rechazar/reversar.
 *   onClick='aprobarPermiso(idUsu, sp_id)'
 *   onClick="accionPermiso('rechazar', idUsu, sp_id)"
 *   onClick="accionPermiso('reversar', idUsu, sp_id)"
 *   onClick='llamarPdf(idUsu, sp_id)'
 */
function parseActionOnClick(onClick, actionName) {
    if (!onClick) return null;
    const decoded = onClick
        .replace(/"/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&/g, '&');

    const match = decoded.match(
        new RegExp(`${actionName}\\(\\s*([^)]+?)\\s*\\)`)
    );
    if (!match) return null;
    return match[1].trim();
}

/**
 * Parsea el HTML de filas <tr> devuelto por listaPermisosUsuario (vacaciones).
 *
 * Columnas (solo Vacaciones, filtrado en el backend):
 *   0 fecha_creacion
 *   1 motivo
 *   2 autorizo (fun_nombre_completo)
 *   3 sp_fecha_inicio
 *   4 sp_dias
 *   5 sp_fecha_fin
 *   6 sp_fecha_reintegro
 *   7 observaciones (botón con value)
 *   8 imprimir (botón llamarPdf)
 *   [9] acciones (aprobar/rechazar/reversar) — solo si lider==1 y no es propio
 */
function parseRows(html) {
    const rows = [];
    const trRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;

    while ((trMatch = trRegex.exec(html)) !== null) {
        const inner = trMatch[1];

        const cells = [];
        const tdRegex = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
        let tdMatch;
        while ((tdMatch = tdRegex.exec(inner)) !== null) {
            cells.push(tdMatch[1]);
        }

        if (cells.length === 0) continue;

        // Observaciones: botón con atributo value
        const obsCell = cells[7] ?? '';
        const obsMatch = obsCell.match(/\bvalue\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const observaciones = obsMatch ? (obsMatch[1] ?? obsMatch[2] ?? '') : cleanCell(obsCell);

        // Imprimir: botón llamarPdf(idUsu, sp_id)
        const imprimirCell = cells[8] ?? '';
        const llamarPdf = parseActionOnClick(imprimirCell, 'llamarPdf');
        let idUsu = '';
        let idPermiso = '';
        if (llamarPdf) {
            const parts = llamarPdf.split(',').map((p) => p.trim());
            idUsu = parts[0] ?? '';
            idPermiso = parts[1] ?? '';
        }

        // Acciones: aprobar / rechazar / reversar
        const accionesCell = cells[9] ?? cells[8] ?? '';
        const onClickAttrs =
            accionesCell.match(/\sonClick\s*=\s*(?:"([^"]*)"|'([^']*)')/gi) ?? [];

        let puedeAprobar = false;
        let puedeRechazar = false;
        let puedeReversar = false;
        let accion = '';

        onClickAttrs.forEach((attr) => {
            const m = attr.match(/\sonClick\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
            const onClick = m ? (m[1] ?? m[2] ?? '') : '';

            const aprobar = parseActionOnClick(onClick, 'aprobarPermiso');
            if (aprobar) {
                puedeAprobar = true;
                const parts = aprobar.split(',').map((p) => p.trim());
                idUsu = parts[0] ?? idUsu;
                idPermiso = parts[1] ?? idPermiso;
            }

            const accionPermiso = parseActionOnClick(onClick, 'accionPermiso');
            if (accionPermiso) {
                const parts = accionPermiso.split(',').map((p) =>
                    p.replace(/^['"]|['"]$/g, '').trim()
                );
                accion = parts[0] ?? '';
                idUsu = parts[1] ?? idUsu;
                idPermiso = parts[2] ?? idPermiso;
                if (accion === 'rechazar') puedeRechazar = true;
                if (accion === 'reversar') puedeReversar = true;
            }
        });

        rows.push({
            id: idPermiso || `${cells[0]}-${cells[3]}-${cells[4]}`,
            idPermiso,
            idUsu,
            fechaCreacion: cleanCell(cells[0]),
            motivo: cleanCell(cells[1]),
            autorizo: cleanCell(cells[2]),
            fechaInicio: cleanCell(cells[3]),
            dias: cleanCell(cells[4]),
            fechaFin: cleanCell(cells[5]),
            fechaReintegro: cleanCell(cells[6]),
            observaciones,
            puedeAprobar,
            puedeRechazar,
            puedeReversar,
        });
    }

    return rows;
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idUsu = body.idUsu ?? body.id ?? '';
        const idEstado = body.idEstado ?? 1;
        const lider = body.lider ?? 0;

        // userLogin: id del usuario autenticado (para no permitir auto-aprobación)
        let userLogin = body.userLogin;
        if (!userLogin) {
            const user = await resolveUser(request);
            userLogin = user?.funId ?? '';
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'listaPermisosUsuario');
        formData.set('idUsu', String(idUsu));
        formData.set('idEstado', String(idEstado));
        formData.set('lider', String(lider));
        formData.set('userLogin', String(userLogin ?? ''));

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

        if (!trimmed || trimmed === 'No') {
            return NextResponse.json({ data: { rows: [] } });
        }

        const rows = parseRows(text);
        return NextResponse.json({ data: { rows } });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al cargar los permisos' },
            { status: 500 }
        );
    }
}
