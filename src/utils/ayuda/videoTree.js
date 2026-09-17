/**
 * Utilidades para navegar/aplanar el árbol de carpetas de videos
 * que retorna fetchEstructuraVideos. Estructura del dato:
 *  - Un nivel es un array de items.
 *  - Item de video:   { video: 'nombre.mp4' }
 *  - Item de carpeta: { 'Nombre de la carpeta': [ ...subcontenido ] }
 */

const EXTENSIONES_SOPORTADAS = new Set(['.mp4', '.webm', '.ogg']);

/** Detecta si el archivo es un video reproducible con <video> HTML5 */
export function esVideoSoportado(nombreArchivo = '') {
    const ext = nombreArchivo.toLowerCase().split('.').pop();
    return EXTENSIONES_SOPORTADAS.has(`.${ext}`);
}

/** Separa un nivel mixto en carpetas y videos */
export function normalizarNivel(contenido) {
    const items = Array.isArray(contenido) ? contenido : [];
    const carpetas = [];
    const videos = [];

    items.forEach((item) => {
        if (item?.video) {
            videos.push({ video: item.video });
            return;
        }
        Object.entries(item ?? {}).forEach(([nombre, subcontenido]) => {
            carpetas.push({ nombre, contenido: subcontenido });
        });
    });

    return { carpetas, videos };
}

/**
 * Navega el árbol siguiendo un breadcrumb (array de nombres de carpeta)
 * y retorna el contenido del nivel correspondiente, o null si no existe.
 */
export function obtenerNivelEnRuta(dataRaiz, path) {
    let nivelActual = dataRaiz;

    for (const nombreCarpeta of path) {
        const { carpetas } = normalizarNivel(nivelActual);
        const carpeta = carpetas.find((c) => c.nombre === nombreCarpeta);
        if (!carpeta) return null;
        nivelActual = carpeta.contenido;
    }

    return nivelActual;
}

/**
 * Aplana todo el árbol en una lista de videos con su ruta de carpetas,
 * para mostrar resultados de búsqueda con contexto ("dónde está").
 */
export function aplanarVideos(contenido, rutaCarpetas = []) {
    const { carpetas, videos } = normalizarNivel(contenido);
    const resultado = videos.map((v) => ({ ...v, rutaCarpetas }));

    carpetas.forEach((c) => {
        resultado.push(...aplanarVideos(c.contenido, [...rutaCarpetas, c.nombre]));
    });

    return resultado;
}
