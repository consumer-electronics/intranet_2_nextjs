import { apiFetch } from '@/utils/Fetchclient';

export async function fetchEstructuraGeneral(filtro = '', url = '', soloGenerales = false) {
    const params = new URLSearchParams();
    if (filtro) params.set('filtro', filtro);
    if (url) params.set('url', url);
    if (soloGenerales) params.set('soloGenerales', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';

    return apiFetch(
        `/api/sig/documentos-proxy${query}`,
        {
            method: 'GET',
        }
    );
}