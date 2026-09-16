import { apiFetch } from '@/utils/Fetchclient';

export async function fetchEstructuraGeneral(filtro = '', ruta = '') {
    const params = new URLSearchParams();
    if (filtro) params.set('filtro', filtro);
    if (ruta) params.set('ruta', ruta);

    const query = params.toString() ? `?${params.toString()}` : '';

    return apiFetch(
        `/api/sig/info-documentada/documentos-generales${query}`,
        {
            method: 'GET',
        }
    );
}