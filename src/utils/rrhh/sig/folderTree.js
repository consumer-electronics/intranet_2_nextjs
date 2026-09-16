/**
 * Utilidades para navegar/aplanar el árbol de carpetas que retorna
 * fetchEstructuraGeneral. Forma del dato (sin cambios respecto al backend):
 * - Un nivel es un array de items.
 * - Un item de archivo: { archivo: 'nombre.pdf' }
 * - Un item de carpeta: { 'Nombre de la carpeta': [ ...subcontenido ] }
 */

// Separa un nivel mixto en carpetas y archivos
export function normalizarNivel(contenido) {
    const items = Array.isArray(contenido) ? contenido : [];
    const carpetas = [];
    const archivos = [];

    items.forEach((item) => {
        if (item?.archivo) {
            archivos.push({ archivo: item.archivo });
            return;
        }
        Object.entries(item ?? {}).forEach(([nombre, subcontenido]) => {
            carpetas.push({ nombre, contenido: subcontenido });
        });
    });

    return { carpetas, archivos };
}

// Navega el árbol siguiendo un breadcrumb (array de nombres de carpeta)
// y retorna el contenido crudo de ese nivel, o null si la ruta no existe
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

// Aplana todo el árbol en una lista de archivos con su ruta de carpetas,
// para mostrar resultados de búsqueda con contexto ("dónde está")
export function aplanarArchivos(contenido, rutaCarpetas = []) {
    const { carpetas, archivos } = normalizarNivel(contenido);
    const resultado = archivos.map((a) => ({ ...a, rutaCarpetas }));

    carpetas.forEach((c) => {
        resultado.push(...aplanarArchivos(c.contenido, [...rutaCarpetas, c.nombre]));
    });

    return resultado;
}

export function esPdf(nombreArchivo = '') {
    return nombreArchivo.toLowerCase().endsWith('.pdf');
}