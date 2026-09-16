import { apiFetch } from '@/utils/Fetchclient';

/**
 * Obtiene la lista de colaboradores para la sección Nosotros.
 *
 * El frontend NO llama directamente a Dynamics.
 * La petición pasa por:
 *
 * NosotrosView → useNosotros → api/nosotros.js → /api/nosotros/users → Dynamics
 */
export async function getNosotrosUsers() {
    return apiFetch('/api/nosotros/users', {
        method: 'GET',
    });
}
