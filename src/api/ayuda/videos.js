import { apiFetch } from '@/utils/Fetchclient';

/**
 * Obtiene el árbol de carpetas y videos de la sección de Ayuda.
 * Llama al Route Handler GET /api/ayuda/videos.
 *
 * @param {string} filtro - Texto de búsqueda (vacío = sin filtro)
 */
export async function fetchEstructuraVideos(filtro = '') {
    const params = new URLSearchParams();
    if (filtro) params.set('filtro', filtro);

    const query = params.toString() ? `?${params.toString()}` : '';

    return apiFetch(`/api/ayuda/videos${query}`, { method: 'GET' });
}
