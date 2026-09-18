import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${LEGACY_BASE_URL.replace(/\/+$/, '')}/pantallas/intranet/paginas/biometrico/index.php`;

/**
 * Resuelve la identidad del usuario autenticado consultando /api/auth/me
 * de forma interna (mismo patrón que desprendibles/route.js).
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
        // fun_id: usado por listaUsuario y listaTodosArea
        funId:
            userObj?.fun_id ??
            userObj?.funId ??
            userObj?.id ??
            userObj?.id_usuario ??
            null,
        // fun_empleado_geminus: usado por marcacionUsuario
        geminus:
            userObj?.fun_empleado_geminus ??
            userObj?.id_geminus ??
            userObj?.geminus ??
            null,
    };
}

/**
 * Extrae el id y el nombre desde el atributo onClick del <tr>.
 *
 * El PHP legacy genera una de estas variantes:
 *   onClick='biometricoUsuario(123, "Nombre")'   ← comillas simples afuera, dobles adentro
 *   onClick="biometricoUsuario(123, 'Nombre')"   ← comillas dobles afuera, simples adentro
 *   onClick="biometricoUsuario(123, &quot;Nombre&quot;)" ← entidades HTML
 */
function parseOnClick(onClick) {
    if (!onClick) return { idUsuario: null, nombre: '' };

    // Decodifica entidades HTML (&quot; → " etc.) antes de parsear
    const decoded = onClick
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');

    // Acepta comillas dobles O simples alrededor del nombre
    const match = decoded.match(
        /biometricoUsuario\(\s*([^,]+?)\s*,\s*["']([^"']*)["']\s*\)/
    );
    if (!match) return { idUsuario: null, nombre: '' };
    return { idUsuario: match[1].trim(), nombre: match[2].trim() };
}

/**
 * Normaliza el texto de una celda <td> (quita espacios, saltos de línea y N/A).
 */
function cleanCell(value) {
    const cleaned = String(value ?? '').replace(/\s+/g, ' ').trim();
    return cleaned === 'N/A' ? '' : cleaned;
}

/**
 * Parsea el HTML de filas <tr> devuelto por el backend legacy.
 * Cada fila puede tener 3 o 4 columnas:
 *   - 4 columnas: [departamento, nombre, fecha, hora]
 *   - 3 columnas: [nombre, fecha, hora]
 * El idUsuario y el nombre también se extraen del onClick.
 */
function parseRows(html, hasDepartment) {
    const rows = [];
    const trRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;

    while ((trMatch = trRegex.exec(html)) !== null) {
        const trTag = trMatch[0];
        const inner = trMatch[1];

        // Extrae el onclick respetando el tipo de comillas del atributo HTML.
        // Si el atributo es comillas simples: onClick='...' (puede tener " adentro)
        // Si el atributo es comillas dobles:  onClick="..." (puede tener ' adentro)
        let onClickValue = '';
        const sqMatch = trTag.match(/onClick='([^']*)'/i);   // comillas simples
        const dqMatch = trTag.match(/onClick="([^"]*)"/i);   // comillas dobles
        onClickValue = sqMatch?.[1] ?? dqMatch?.[1] ?? '';

        const { idUsuario, nombre: onClickNombre } = parseOnClick(onClickValue);

        const cells = [];
        const tdRegex = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
        let tdMatch;
        while ((tdMatch = tdRegex.exec(inner)) !== null) {
            cells.push(cleanCell(tdMatch[1].replace(/<[^>]+>/g, '')));
        }

        if (cells.length === 0) continue;

        let departamento = '';
        let nombre = onClickNombre;
        let fecha = '';
        let hora = '';

        if (hasDepartment && cells.length >= 4) {
            departamento = cells[0];
            nombre = cells[1] || onClickNombre;
            fecha = cells[2];
            hora = cells[3];
        } else if (cells.length >= 3) {
            nombre = cells[0] || onClickNombre;
            fecha = cells[1];
            hora = cells[2];
        } else if (cells.length >= 2) {
            nombre = cells[0] || onClickNombre;
            fecha = cells[1];
        }

        rows.push({
            idUsuario,
            nombre,
            departamento,
            fecha,
            hora,
            // El backend resalta en rojo las fechas que no son de hoy (text-danger-blink)
            esHoy: Boolean(fecha) && fecha === new Date().toISOString().slice(0, 10),
        });
    }

    return rows;
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const tipo = body.tipo; // 'usuario' | 'todos' | 'area'

        const user = await resolveUser(request);
        if (!user) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        const formData = new URLSearchParams();

        if (tipo === 'todos') {
            formData.set('accion', 'listaTodos');
        } else if (tipo === 'area') {
            if (!user.funId) {
                return NextResponse.json(
                    { message: 'No se pudo identificar el área del usuario' },
                    { status: 400 }
                );
            }
            formData.set('accion', 'listaTodosArea');
            formData.set('idUsu', String(user.funId));
        } else {
            // 'usuario' (subordinados del usuario autenticado)
            if (!user.funId) {
                return NextResponse.json(
                    { message: 'No se pudo identificar el usuario' },
                    { status: 400 }
                );
            }
            formData.set('accion', 'listaUsuario');
            formData.set('id', String(user.funId));
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

        const text = await legacyResponse.text();

        // Respuestas de error en texto plano (no HTML)
        if (
            text.includes('Su usuario no está registrado en Yéminus') ||
            text.trim() === 'No' ||
            text.trim() === ''
        ) {
            return NextResponse.json({ data: { rows: [], message: text.trim() } });
        }

        const hasDepartment = tipo === 'todos';
        const rows = parseRows(text, hasDepartment);

        // ── DEBUG (eliminar en producción) ──────────────────────────────────
        console.log('[biometrico/lista] HTML crudo (primeros 500 chars):', text.slice(0, 500));
        console.log('[biometrico/lista] Filas parseadas:', JSON.stringify(rows.slice(0, 3)));
        // ───────────────────────────────────────────────────────────────────

        return NextResponse.json({ data: { rows } });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/lista]', error);
        return NextResponse.json(
            { message: 'No se pudo cargar el listado biométrico' },
            { status: 500 }
        );
    }
}
