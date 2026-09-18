import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

/**
 * Resuelve el id del funcionario autenticado (userLogin) reutilizando
 * el endpoint interno /api/auth/me.
 */
async function resolveUser(request) {
    const __token = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
        const meRes = await fetch(`${(process.env.API_NODE || '').replace(/\/+$/, '')}/api/auth/me`, {
            headers: { Authorization: `Bearer ${__token}`, Accept: 'application/json' },
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
 * Extrae el id del permiso desde un onClick de aprobar/rechazar.
 *   onClick='aprobarPermiso(idUsu, sp_id)'
 *   onClick='rechazarPermiso(idUsu, sp_id)'
 */
function parseActionOnClick(onClick, actionName) {
    if (!onClick) return null;
    const decoded = onClick
        .replace(/"/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&/g, '&');

    const match = decoded.match(
        new RegExp(`${actionName}\\(\\s*([^,]+?)\\s*,\\s*([^)]+?)\\s*\\)`)
    );
    if (!match) return null;
    return { idUsu: match[1].trim(), idPermiso: match[2].trim() };
}

/**
 * Parsea el HTML de filas <tr> devuelto por listaPermisosUsuario.
 *
 * Columnas (sin Vacaciones, que se filtra en el backend):
 *   0 fecha_creacion
 *   1 autorizo (fun_nombre_completo)
 *   2 motivo
 *   3 reposicion
 *   4 sp_fecha_inicio
 *   5 sp_hora_inicio
 *   6 sp_fecha_fin
 *   7 sp_hora_llegada
 *   8 observaciones (botón con value)
 *   9 documento (enlace VER) — opcional
 *   [10] acciones (aprobar/rechazar) — solo si lider==1
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
        const obsCell = cells[8] ?? '';
        const obsMatch = obsCell.match(/\bvalue\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const observaciones = obsMatch ? (obsMatch[1] ?? obsMatch[2] ?? '') : cleanCell(obsCell);

        // Documento: enlace VER
        const docCell = cells[9] ?? '';
        const docHrefMatch = docCell.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const documento = docHrefMatch ? (docHrefMatch[1] ?? docHrefMatch[2] ?? '') : '';

        // Acciones: aprobar / rechazar
        const accionesCell = cells[10] ?? cells[9] ?? '';
        const aprobarMatch = accionesCell.match(/\sonClick\s*=\s*(?:"([^"]*)"|'([^']*)')/gi) ?? [];
        let puedeAprobar = false;
        let puedeRechazar = false;
        let idPermiso = '';
        let idUsu = '';

        aprobarMatch.forEach((attr) => {
            const m = attr.match(/\sonClick\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
            const onClick = m ? (m[1] ?? m[2] ?? '') : '';
            const aprobar = parseActionOnClick(onClick, 'aprobarPermiso');
            const rechazar = parseActionOnClick(onClick, 'rechazarPermiso');
            if (aprobar) {
                puedeAprobar = true;
                idUsu = aprobar.idUsu;
                idPermiso = aprobar.idPermiso;
            }
            if (rechazar) {
                puedeRechazar = true;
                idUsu = rechazar.idUsu;
                idPermiso = rechazar.idPermiso;
            }
        });

        rows.push({
            id: idPermiso || `${cells[0]}-${cells[1]}-${cells[4]}`,
            idPermiso,
            idUsu,
            fechaCreacion: cleanCell(cells[0]),
            autorizo: cleanCell(cells[1]),
            motivo: cleanCell(cells[2]),
            reposicion: cleanCell(cells[3]),
            fechaInicio: cleanCell(cells[4]),
            horaInicio: cleanCell(cells[5]),
            fechaFin: cleanCell(cells[6]),
            horaFin: cleanCell(cells[7]),
            observaciones,
            documento,
            puedeAprobar,
            puedeRechazar,
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
