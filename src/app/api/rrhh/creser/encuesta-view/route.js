import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;

/**
 * Obtiene y parsea los datos de la encuesta CRESER desde Dynamics.
 *
 * Dynamics genera una página HTML con un DataTable inicializado así:
 *   columns: [{ title: "Col1" }, ...]
 *   data:[["val1","val2","<a href='...?ere_id=X'>Ver</a>"],...]
 *
 * Este route handler:
 * 1. Hace fetch al HTML de Dynamics con los parámetros correspondientes.
 * 2. Itera todos los bloques <script> buscando el array data:[...].
 * 3. Decodifica entidades HTML en título y celdas.
 * 4. Devuelve JSON estructurado: { titulo, columns, rows, canEvaluar, etId }
 *
 * Body esperado: { et_id, filtro_atr, id_usuario }
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { et_id, filtro_atr, id_usuario } = body;

        if (!et_id) {
            return NextResponse.json(
                { message: 'et_id es requerido' },
                { status: 400 }
            );
        }

        const base = (LEGACY_BASE_URL || '').replace(/\/+$/, '');
        const params = new URLSearchParams({
            et_id: String(et_id),
            ...(filtro_atr ? { filtro_atr: String(filtro_atr) } : {}),
            ...(id_usuario ? { id_usuario: String(id_usuario) } : {}),
        });

        const dynamicsUrl = `${base}/pantallas/intranet/encuesta/creser_view.php?${params.toString()}`;

        const legacyResponse = await fetch(dynamicsUrl, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar Dynamics: ${legacyResponse.status}`);
        }

        // El servidor PHP declara y envía UTF-8
        const buffer = await legacyResponse.arrayBuffer();
        const html = new TextDecoder('utf-8').decode(buffer);

        // ── Extraer título ──────────────────────────────────────────────────
        const tituloMatch = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        const tituloRaw = tituloMatch
            ? tituloMatch[1].replace(/<[^>]+>/g, '').trim()
            : 'CRESER';
        const titulo = decodeHtmlEntities(tituloRaw);

        // ── Extraer columnas ────────────────────────────────────────────────
        // PHP genera: columns: [{ title: "Nombre" }, ..., { title: "Acciones" }]
        // La clave "title" no está entre comillas — no es JSON válido
        const columnTitles = [...html.matchAll(/title:\s*"([^"]*)"/g)].map(
            (m) => decodeHtmlEntities(m[1])
        );

        // ── Extraer datos ───────────────────────────────────────────────────
        // PHP embebe directamente: data:[["val1","val2",...],...]
        // Iteramos todos los bloques <script> buscando el token 'data:'
        const scriptBlocks = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(
            (m) => m[1]
        );

        let rawRows = [];
        for (const block of scriptBlocks) {
            // Buscar 'data:[[' para evitar falsos positivos con 'data.xxx' en fetch calls JS
            const dataJsonStr = extractJsonArray(block, 'data:[[');
            if (dataJsonStr) {
                try {
                    rawRows = JSON.parse(dataJsonStr);
                    break;
                } catch {
                    // seguir buscando en el siguiente bloque
                }
            }
        }

        // ── Detectar si existe botón "Evaluar" ──────────────────────────────
        const canEvaluar = html.includes('href="./?et_id=') || html.includes('"Evaluar"');

        // ── Normalizar filas: extraer ere_id del último campo (link "Ver") ──
        const rows = rawRows.map((row) => {
            if (!Array.isArray(row)) return { cells: [], ereId: null };

            const lastCell = String(row[row.length - 1] ?? '');
            // Extraer ere_id del href: "creser_view_rta.php?et_id=X&ere_id=Y&idUsu=Z"
            const ereIdMatch = lastCell.match(/ere_id=(\d+)/);
            const idUsuMatch = lastCell.match(/idUsu=(\d+)/);

            return {
                // Todas las celdas excepto la última (acciones), decodificando entidades
                cells: row.slice(0, row.length - 1).map((c) =>
                    decodeHtmlEntities(String(c ?? ''))
                ),
                ereId: ereIdMatch ? Number(ereIdMatch[1]) : null,
                idUsu: idUsuMatch ? Number(idUsuMatch[1]) : null,
            };
        });

        // Columnas sin la columna "Acciones" (la última)
        const columns = columnTitles.slice(0, columnTitles.length - 1);

        return NextResponse.json({
            titulo,
            columns,
            rows,
            canEvaluar,
            etId: et_id,
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'No se pudo obtener la información de la encuesta' },
            { status: 500 }
        );
    }
}

/**
 * Extrae un array JSON completo de un string mayor, comenzando después de `marker`.
 * Maneja anidamiento de [], {} y strings escapados.
 */
function extractJsonArray(str, marker) {
    const markerIdx = str.indexOf(marker);
    if (markerIdx === -1) return null;

    // Si el marker ya contiene '[', el inicio del array es el primer '[' dentro del marker
    const bracketInMarker = marker.indexOf('[');
    const start = bracketInMarker >= 0
        ? markerIdx + bracketInMarker
        : str.indexOf('[', markerIdx + marker.length);
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < str.length; i++) {
        const ch = str[i];

        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;

        if (ch === '[' || ch === '{') depth++;
        else if (ch === ']' || ch === '}') {
            depth--;
            if (depth === 0) return str.substring(start, i + 1);
        }
    }

    return null;
}

/**
 * Decodifica entidades HTML comunes presentes en las respuestas PHP.
 * No usa DOMParser (server-side), se hace con un mapa de entidades.
 */
function decodeHtmlEntities(str) {
    if (!str || typeof str !== 'string') return str;
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&iacute;/g, 'í')
        .replace(/&oacute;/g, 'ó')
        .replace(/&uacute;/g, 'ú')
        .replace(/&Aacute;/g, 'Á')
        .replace(/&Eacute;/g, 'É')
        .replace(/&Iacute;/g, 'Í')
        .replace(/&Oacute;/g, 'Ó')
        .replace(/&Uacute;/g, 'Ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Ntilde;/g, 'Ñ')
        .replace(/&uuml;/g, 'ü')
        .replace(/&Uuml;/g, 'Ü')
        .replace(/&iexcl;/g, '¡')
        .replace(/&iquest;/g, '¿')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
