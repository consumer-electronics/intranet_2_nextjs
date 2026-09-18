import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/certificados_laborales.php`;

// Tiempo de vida del caché del listado (ms). El listado de funcionarios
// activos cambia con poca frecuencia; cachearlo evita golpear Dynamics en
// cada navegación/búsqueda y hace la respuesta mucho más rápida.
const LIST_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Caché en memoria a nivel de módulo (persiste entre peticiones del mismo
// proceso del servidor). Se guarda el arreglo ya normalizado.
let listCache = {
    timestamp: 0,
    rows: null,
};

/**
 * Resuelve la identidad del usuario autenticado consultando /api/auth/me
 * de forma interna (mismo patrón que desprendibles/route.js).
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
 * Normaliza la respuesta del backend legacy (formato Bd::consulta()).
 *
 * El PHP legacy devuelve un objeto JSON con claves numéricas y metadatos:
 *   {
 *     cantidad_registros: N,
 *     cantidad_columnas: M,
 *     sql: "...",
 *     0: { fun_id: ..., fun_nombre_completo: ..., ... },
 *     1: { ... },
 *     ...
 *   }
 *
 * Se convierte a un arreglo plano de filas para que React pueda consumirlo
 * de forma directa con el DataGrid.
 */
function normalizeRows(payload) {
    if (!payload || typeof payload !== 'object') return [];

    const total = Number(payload.cantidad_registros ?? 0);
    const rows = [];

    for (let i = 0; i < total; i++) {
        const record = payload[i];
        if (record && typeof record === 'object') {
            // Se asigna un id único por fila para el DataGrid. La vista vrol
            // puede devolver el mismo fun_id varias veces (p.ej. una persona
            // con varios roles activos); si el id se repite, el DataGrid
            // "congela" filas al paginar. El id sintético garantiza unicidad
            // sin alterar fun_id (que se usa para generar el certificado).
            rows.push({ id: i, ...record });
        }
    }

    return rows;
}

/**
 * Obtiene el listado de funcionarios activos para generar certificados.
 *
 * Equivale a la llamada legacy:
 *   POST certificados_laborales.php  accion = listaUsuarios
 *   → SELECT * FROM vrol WHERE rol_estado = 1
 *
 * El backend devuelve JSON en formato Bd::consulta(); aquí se normaliza a
 * un arreglo de filas (el parsing ocurre en el servidor, no en el cliente).
 */
export async function POST(request) {
    try {
        const user = await resolveUser(request);
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // Si el caché sigue vigente, lo devolvemos sin golpear Dynamics.
        const now = Date.now();
        if (listCache.rows && now - listCache.timestamp < LIST_CACHE_TTL_MS) {
            return NextResponse.json({ data: { rows: listCache.rows } });
        }

        const formData = new URLSearchParams();
        formData.set('accion', 'listaUsuarios');

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
            return NextResponse.json(
                { error: 'Dynamics devolvió una respuesta no válida o el servicio no está disponible' },
                { status: 502 }
            );
        }

        const raw = await legacyResponse.json();
        const rows = normalizeRows(raw);

        // Actualiza el caché en memoria.
        listCache = { timestamp: Date.now(), rows };

        return NextResponse.json({ data: { rows } });
    } catch (error) {
        console.error('[POST /api/rrhh/certificados-laborales/lista]', error);
        return NextResponse.json(
            { error: 'Error al obtener el listado de certificados laborales' },
            { status: 500 }
        );
    }
}
