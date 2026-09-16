// src/api/rrhh/solicitudes.js
// Capa de acceso a datos del módulo "Solicitudes de Permisos" (RRHH).
// Todas las funciones llaman a las rutas internas de Next.js (/app/api/...),
// que a su vez hacen de proxy hacia los servicios legacy (PHP + API Dynamics).

const BASE_API = '/api/rrhh/solicitudes';

async function handleResponse(response) {
    if (!response.ok) {
        let message = 'Ocurrió un error al comunicarse con el servidor';
        try {
            const data = await response.json();
            message = data?.message || message;
        } catch (_) {
            // el cuerpo no era JSON, se usa el mensaje por defecto
        }
        throw new Error(message);
    }
    return response.json();
}

/**
 * Verifica si el usuario tiene permiso para acceder a un submódulo de
 * "Solicitudes de Permisos".
 * @param {number|string} funId - id del funcionario autenticado.
 * @param {string} [modNombre] - nombre del submódulo a validar
 *   ('solicitud_permisos_todos' | 'solicitud_permisos_registros').
 */
export async function checkPermisoSolicitudes(funId, modNombre = 'solicitud_permisos_todos') {
    const response = await fetch(`${BASE_API}/permiso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fun_id: funId, mod_nombre: modNombre }),
    });
    return handleResponse(response);
}

/**
 * Obtiene el listado de personal (subordinados o todo el personal).
 * @param {'listaUsuario'|'listaUsuarioTodos'} [accion]
 * @param {{ id?: number|string, origen?: boolean }} [params]
 */
export async function getListaPersonal(accion = 'listaUsuario', params = {}) {
    const response = await fetch(`${BASE_API}/lista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, ...params }),
    });
    return handleResponse(response);
}

/**
 * Obtiene los permisos de un usuario según el estado.
 * @param {{ idUsu: number|string, idEstado?: number, lider?: number }} payload
 */
export async function getPermisosUsuario({ idUsu, idEstado = 1, lider = 0 }) {
    const response = await fetch(`${BASE_API}/permisos-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsu, idEstado, lider }),
    });
    return handleResponse(response);
}

/**
 * Cambia el estado de un permiso (aprobar/rechazar/anular).
 * @param {{ idPermiso: number|string, idEstado: number }} payload
 *   idEstado: 3=Aprobar, 4=Rechazar, 2=Anular
 */
export async function cambiarEstadoPermiso({ idPermiso, idEstado }) {
    const response = await fetch(`${BASE_API}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPermiso, idEstado }),
    });
    return handleResponse(response);
}

/**
 * Crea una solicitud de permiso (multipart, incluye archivo opcional).
 * @param {FormData} formData - debe contener los campos del formulario legacy
 *   (idUsu, motivo_permiso, reposicion, formInicioPermiso, formInicioHora,
 *   formFinalPermiso, formFinHora, observaciones, fecha) y opcionalmente
 *   el archivo `docPermission`.
 */
export async function crearPermiso(formData) {
    const response = await fetch(`${BASE_API}/crear`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
}

/**
 * Obtiene el número de solicitudes de vacaciones pendientes de los
 * subordinados (badge).
 */
export async function getNumeroSolicitudes() {
    const response = await fetch(`${BASE_API}/numero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
}
