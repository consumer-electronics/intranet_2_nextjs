import { apiFetch } from '@/utils/Fetchclient';

/**
 * API del módulo Sala de Juntas.
 *
 * Los componentes y hooks no realizan fetch directamente.
 * Toda comunicación HTTP pasa por este archivo.
 */

export async function getReservaciones({ start, end, idUsu } = {}) {
    const params = new URLSearchParams();

    if (start) params.set('start', start);
    if (end) params.set('end', end);
    if (idUsu) params.set('idUsu', String(idUsu));

    const query = params.toString();

    return apiFetch(`/api/rrhh/sala-juntas${query ? `?${query}` : ''}`);
}

export async function validarDisponibilidad({
    inicio,
    fin,
    sala,
}) {
    return apiFetch('/api/rrhh/sala-juntas/validar', {
        method: 'POST',
        body: JSON.stringify({
            inicio,
            fin,
            sala,
        }),
    });
}

export async function crearReservacion({
    sala,
    fechaInicio,
    fechaFinal,
    descripcion,
    idusu,
}) {
    return apiFetch('/api/rrhh/sala-juntas/reservar', {
        method: 'POST',
        body: JSON.stringify({
            sala,
            fechaInicio,
            fechaFinal,
            descripcion,
            idusu,
        }),
    });
}

export async function eliminarReservacion(id) {
    return apiFetch('/api/rrhh/sala-juntas/eliminar', {
        method: 'POST',
        body: JSON.stringify({
            id,
        }),
    });
}

export async function verificarPermisoEliminar(funId) {
    const params = new URLSearchParams();

    if (funId) {
        params.set('fun_id', String(funId));
    }

    const query = params.toString();

    return apiFetch(`/api/rrhh/sala-juntas/permiso-eliminar${query ? `?${query}` : ''}`);
}