const SIG_FILES_BASE_URL = process.env.NEXT_PUBLIC_SIG_FILES_BASE_URL || 'https://dynamics.appceg.com';
export const RUTA_DOCUMENTOS_RAIZ =
    process.env.NEXT_PUBLIC_SIG_DOCUMENTOS_GENERALES_PATH || '/sig/2. Documentos generales';

export function construirRutaBase(carpetaBase) {
    return carpetaBase ? `${RUTA_DOCUMENTOS_RAIZ}/${carpetaBase}` : RUTA_DOCUMENTOS_RAIZ;
}

export function construirUrlArchivo(rutaBase, rutaCarpetas, archivo) {
    const segmentos = [rutaBase, ...rutaCarpetas.map(encodeURIComponent), encodeURIComponent(archivo)];
    return `${SIG_FILES_BASE_URL}${segmentos.join('/')}`;
}