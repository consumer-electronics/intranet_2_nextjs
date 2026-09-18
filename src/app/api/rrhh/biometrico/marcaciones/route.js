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
        funId:
            userObj?.fun_id ??
            userObj?.funId ??
            userObj?.id ??
            userObj?.id_usuario ??
            null,
        geminus:
            userObj?.useryem ??
            userObj?.fun_empleado_geminus ??
            userObj?.id_geminus ??
            userObj?.geminus ??
            null,
        nombre: userObj?.name ?? userObj?.fun_nombre ?? '',
        apellido: userObj?.fun_apellido ?? '',
    };
}

/**
 * Parsea el HTML de marcaciones devuelto por marcacionUsuario():
 *   <tr><td>DD/MM/YYYY</td><td><ul><li>hh:mm:ss am/pm</li>...</ul></td></tr>
 * Devuelve un arreglo de { fecha, horas: [] }.
 */
function parseMarcaciones(html) {
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

        if (cells.length < 2) continue;

        const fecha = String(cells[0] ?? '').replace(/\s+/g, ' ').trim();

        // Las horas vienen en <li> dentro de la segunda celda
        const horas = [];
        const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;
        while ((liMatch = liRegex.exec(cells[1])) !== null) {
            const hora = String(liMatch[1]).replace(/\s+/g, ' ').trim();
            if (hora) horas.push(hora);
        }

        rows.push({ fecha, horas });
    }

    return rows;
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { idUsuario, inicio, final } = body;

        const user = await resolveUser(request);
        if (!user) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        // Si no se pasa un idUsuario explícito, se usan las marcas del usuario autenticado
        let targetId = idUsuario ?? user.geminus;

        // Fallback: si no tenemos el ID geminus en la sesión, consultamos listaUsuario
        // usando el funId para extraer el ID biométrico desde el HTML legado.
        if (!targetId && !idUsuario && user.funId) {
            const formDataLista = new URLSearchParams();
            formDataLista.set('accion', 'listaUsuario');
            formDataLista.set('id', String(user.funId));

            try {
                const resLista = await fetch(LEGACY_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                    },
                    body: formDataLista,
                    cache: 'no-store',
                });
                const textLista = await resLista.text();

                // Buscar: onClick='biometricoUsuario(3329, "Nombre Apellido")'
                const regex = /biometricoUsuario\(\s*['"]?(\d+)['"]?\s*,\s*['"]([^'"]+)['"]/g;
                let match;
                let foundId = null;

                const userNombre = (user.nombre || '').toLowerCase().trim();
                const userApellido = (user.apellido || '').toLowerCase().trim();

                while ((match = regex.exec(textLista)) !== null) {
                    const idMatch = match[1];
                    const nameMatch = match[2].toLowerCase();

                    if (!foundId) foundId = idMatch; // Guardar el primero por si acaso

                    if (userNombre && nameMatch.includes(userNombre) &&
                        (!userApellido || nameMatch.includes(userApellido))) {
                        foundId = idMatch; // Coincidencia exacta con el usuario logueado
                        break;
                    }
                }

                if (foundId) {
                    targetId = foundId;
                }
            } catch (err) {
                console.error('[Biometrico] Error en fallback listaUsuario:', err);
            }
        }

        if (!targetId) {
            return NextResponse.json(
                { message: 'No se pudo identificar el usuario biométrico' },
                { status: 400 }
            );
        }

        if (!inicio || !final) {
            return NextResponse.json(
                { message: 'Debe indicar un rango de fechas' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'marcacionUsuario');
        formData.set('idUsuario', String(targetId));
        formData.set('inicio', String(inicio));
        formData.set('final', String(final));

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
            text.includes('El usuario no tiene el id asociado') ||
            text.trim() === ''
        ) {
            return NextResponse.json({ data: { rows: [], message: text.trim() } });
        }

        const rows = parseMarcaciones(text);

        return NextResponse.json({ data: { rows } });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/marcaciones]', error);
        return NextResponse.json(
            { message: 'No se pudieron cargar las marcaciones' },
            { status: 500 }
        );
    }
}
