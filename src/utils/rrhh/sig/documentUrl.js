export function construirRutaBase(carpetaBase) {
    if (!carpetaBase) return 'https://dynamics.appceg.com/sig/1.%20Documentos/';
    if (carpetaBase.startsWith('http')) return carpetaBase;
    return `https://dynamics.appceg.com/sig/1.%20Documentos/${encodeURIComponent(carpetaBase)}/`;
}

export function construirUrlArchivo(rutaBase, rutaCarpetas, archivo) {
    const base = rutaBase.endsWith('/') ? rutaBase : `${rutaBase}/`;
    if (rutaCarpetas.length === 0) {
        return `${base}${encodeURIComponent(archivo)}`;
    }
    const segmentos = [...rutaCarpetas.map(encodeURIComponent), encodeURIComponent(archivo)];
    return `${base}${segmentos.join('/')}`;
}