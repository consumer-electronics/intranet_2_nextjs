// src/api/rrhh/solicitudesVacaciones.js
// Capa de acceso a datos del módulo "Solicitudes de Vacaciones" (RRHH).
// Todas las funciones llaman a las rutas internas de Next.js (/app/api/...),
// que a su vez hacen de proxy hacia los servicios legacy (PHP + API Dynamics).

const BASE_API = '/api/rrhh/solicitudes/vacaciones';

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
 * Verifica si el usuario tiene permiso para ver "Todas" las vacaciones
 * (submódulo `vacaciones_todos`).
 * @param {number|string} funId - id del funcionario autenticado.
 */
export async function checkPermisoVacacionesTodos(funId) {
    const response = await fetch(`${BASE_API}/permiso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fun_id: funId, mod_nombre: 'vacaciones_todos' }),
    });
    return handleResponse(response);
}

/**
 * Obtiene el listado de personal (subordinados o todo el personal) con su
 * número de solicitudes de vacaciones pendientes.
 * @param {'listaUsuario'|'listaUsuarioTodos'} [accion]
 * @param {{ id?: number|string }} [params]
 */
export async function getListaPersonalVacaciones(accion = 'listaUsuario', params = {}) {
    const response = await fetch(`${BASE_API}/lista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, ...params }),
    });
    return handleResponse(response);
}

/**
 * Obtiene las solicitudes de vacaciones de un usuario según el estado.
 * @param {{ idUsu: number|string, idEstado?: number, lider?: number }} payload
 */
export async function getVacacionesUsuario({ idUsu, idEstado = 1, lider = 0 }) {
    const response = await fetch(`${BASE_API}/permisos-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsu, idEstado, lider }),
    });
    return handleResponse(response);
}

/**
 * Cambia el estado de una solicitud de vacaciones (aprobar/rechazar/anular).
 * @param {{ idPermiso: number|string, idEstado: number }} payload
 *   idEstado: 3=Aprobar, 4=Rechazar/Reversar, 2=Anular
 */
export async function cambiarEstadoVacaciones({ idPermiso, idEstado }) {
    const response = await fetch(`${BASE_API}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPermiso, idEstado }),
    });
    return handleResponse(response);
}

/**
 * Crea una solicitud de vacaciones (multipart).
 * @param {FormData} formData - campos: idUsu, formInicioPermiso,
 *   formInicioDias, observaciones, rol.
 */
export async function crearVacaciones(formData) {
    const response = await fetch(`${BASE_API}/crear`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
}

/**
 * Obtiene el número de solicitudes de permisos (no vacaciones) pendientes
 * de los subordinados (badge).
 */
export async function getNumeroVacaciones() {
    const response = await fetch(`${BASE_API}/numero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
}

/**
 * Obtiene el periodo de vacaciones vigente del usuario desde Yeminus.
 * Se usa antes de generar el PDF de una solicitud.
 * @param {number|string} idYem - código de empleado en Yeminus.
 */
export async function getPeriodosYeminus(idYem) {
    const response = await fetch(`${BASE_API}/periodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuYem: idYem }),
    });
    return handleResponse(response);
}

/**
 * Genera o modifica el PDF de una solicitud de vacaciones.
 * @param {object} payload - accion ('modificar_pdf'|'pdf_aprobado'|'pdf_reversado')
 *   y los campos requeridos por cada acción.
 * @returns {Promise<Blob|object>} Blob (PDF) para 'modificar_pdf' o JSON.
 */
export async function modificarPdfVacaciones(payload) {
    const response = await fetch(`${BASE_API}/modificar-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/pdf')) {
        if (!response.ok) {
            throw new Error('No se pudo generar el PDF.');
        }
        return response.blob();
    }

    if (!response.ok) {
        let message = 'Ocurrió un error al comunicarse con el servidor';
        try {
            const data = await response.json();
            message = data?.message || message;
        } catch (_) {
            // cuerpo no JSON
        }
        throw new Error(message);
    }
    return response.json();
}

/**
 * Descarga el PDF ya generado de una solicitud de vacaciones.
 * @param {number|string} idPermiso
 * @returns {Promise<Blob>}
 */
export async function descargarPdfVacaciones(idPermiso) {
    const response = await fetch(`${BASE_API}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPermiso }),
    });

    if (!response.ok) {
        let message = 'Archivo PDF no disponible.';
        try {
            const data = await response.json();
            message = data?.message || message;
        } catch (_) {
            // cuerpo no JSON
        }
        throw new Error(message);
    }
    return response.blob();
}

/**
 * Envía las notificaciones por correo del módulo de vacaciones.
 * @param {object} payload - accion ('enviarCorreoVacas'|'enviarCorreoVacasUserAprobar'
 *   |'enviarCorreoVacasUserRechazo'|'enviarCorreoVacasUserReversado') y sus campos.
 */
export async function enviarCorreoVacaciones(payload) {
    const response = await fetch(`${BASE_API}/correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
}
