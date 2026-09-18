import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos_vacas.php`;

/**
 * Resuelve el id del funcionario autenticado reutilizando el endpoint
 * interno /api/auth/me (misma cookie httpOnly).
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

/**
 * Extrae id y nombre desde el atributo onClick del <tr>.
 *
 * El PHP legacy genera:
 *   onClick='permisoUsuario(123 ,"Nombre Completo")'
 */
function parseOnClick(onClick) {
    if (!onClick) return { idUsuario: null, nombre: '' };

    const decoded = onClick
        .replace(/"/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&/g, '&');

    const match = decoded.match(
        /permisoUsuario\(\s*([^,]+?)\s*,\s*["']([^"']*)["']\s*\)/
    );
    if (!match) return { idUsuario: null, nombre: '' };
    return { idUsuario: match[1].trim(), nombre: match[2].trim() };
}

/**
 * Normaliza el texto de una celda <td>.
 */
function cleanCell(value) {
    const cleaned = String(value ?? '').replace(/\s+/g, ' ').trim();
    return cleaned === 'N/A' ? '' : cleaned;
}

/**
 * Parsea el HTML de filas <tr> devuelto por listaUsuario / listaUsuarioTodos
 * del módulo de vacaciones.
 *
 * - listaUsuario (personal a cargo) genera 2 columnas:
 *     [nombre, solicitudesVacaciones]
 * - listaUsuarioTodos genera 2 columnas iguales.
 *
 * El id y el nombre "limpio" se extraen del onClick del <tr>.
 */
function parseRows(html) {
    const rows = [];
    const trRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;

    while ((trMatch = trRegex.exec(html)) !== null) {
        const trTag = trMatch[0];
        const inner = trMatch[1];

        // Extrae el atributo onClick del <tr>
        const onClickMatch = trTag.match(/\sonClick\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const onClick = onClickMatch ? (onClickMatch[1] ?? onClickMatch[2]) : '';
        const { idUsuario, nombre } = parseOnClick(onClick);

        // Extrae las celdas <td>
        const cells = [];
        const tdRegex = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
        let tdMatch;
        while ((tdMatch = tdRegex.exec(inner)) !== null) {
            cells.push(cleanCell(tdMatch[1]));
        }

        if (cells.length === 0) continue;

        const nombreCelda = cells[0] || nombre;
        const solicitudesVacaciones = cells[1] || '';

        rows.push({
            id: idUsuario ?? nombreCelda,
            idUsuario: idUsuario ?? '',
            nombre: nombreCelda,
            solicitudesVacaciones,
        });
    }

    return rows;
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const accion = body.accion || 'listaUsuario';

        // listaUsuario requiere el id del usuario autenticado.
        let id = body.id;
        if (!id && accion === 'listaUsuario') {
            const user = await resolveUser(request);
            id = user?.funId ?? '';
        }

        const formData = new URLSearchParams();
        formData.set('accion', accion);
        if (id) formData.set('id', String(id));

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

        // El backend devuelve "No" o un mensaje de error cuando no hay datos.
        const trimmed = text.trim();
        if (!trimmed || trimmed === 'No') {
            return NextResponse.json({ data: { rows: [] } });
        }
        if (trimmed.includes('Yéminus')) {
            return NextResponse.json({ data: { rows: [], error: trimmed } });
        }

        const rows = parseRows(text);
        return NextResponse.json({ data: { rows } });
    } catch (error) {
        return NextResponse.json(
            { message: 'No se ha podido traer la lista' },
            { status: 500 }
        );
    }
}
