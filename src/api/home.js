import { apiFetch } from '@/utils/Fetchclient';

/**
 * Obtiene los cumpleaños del mes actual.
 *
 * El frontend NO llama directamente a Dynamics.
 * La petición pasa por:
 *
 * Home → api/home.js → /api/home/birthdays → Dynamics
 */
export async function getBirthdays() {
    return apiFetch('/api/home/birthdays', {
        method: 'GET',
    });
}