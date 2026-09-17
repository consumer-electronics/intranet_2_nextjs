import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API_DEV;

/**
 * Obtiene y parsea los datos de la encuesta CRESER desde Dynamics.
 *
 * Dynamics genera una página HTML con un DataTable inicializado así:
 *   columns: [{ title: "Col1" }, ...]
 *   data: [["val1", "val2", "<a href='...?ere_id=X'>Ver</a>"], ...]
 *
 * Este route handler:
 * 1. Hace fetch al HTML de Dynamics con los parámetros correspondientes.
 * 2. Extrae titulo, columnas y filas del HTML via regex.
 * 3. Extrae el ere_id del link "Ver" para navegación en Next.js.
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

        const dynamicsUrl = `${base}/encuesta/creser_view.php?${params.toString()}`;

        const legacyResponse = await fetch(dynamicsUrl, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!legacyResponse.ok) {
            throw new Error(`Error al contactar Dynamics: ${legacyResponse.status}`);
        }

        const html = await legacyResponse.text();

        // ── Extraer título ──────────────────────────────────────────────────
        const tituloMatch = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        const titulo = tituloMatch
            ? tituloMatch[1].replace(/<[^>]+>/g, '').trim()
            : 'CRESER';

        // ── Extraer columnas ────────────────────────────────────────────────
        // PHP genera: columns: [{ title: "Nombre" }, ..., { title: "Acciones" }]
        // La clave "title" no está entre comillas → no es JSON válido
        const columnTitles = [...html.matchAll(/title:\s*"([^"]*)"/g)].map(
            (m) => m[1]
        );

        // ── Extraer datos ───────────────────────────────────────────────────
        // PHP genera: data:[["val1","val2",...],...]
        // Es JSON válido porque los valores usan json_encode
        const dataJsonStr = extractJsonArray(html, 'data:');
        let rawRows = [];
        if (dataJsonStr) {
            try {
                rawRows = JSON.parse(dataJsonStr);
            } catch {
                rawRows = [];
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
                // Todas las celdas excepto la última (acciones)
                cells: row.slice(0, row.length - 1).map((c) => String(c ?? '')),
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

    const start = str.indexOf('[', markerIdx + marker.length);
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
