// src/api/rrhh/creser.js
// Capa de acceso a datos del módulo CRESER.
// Todas las funciones apuntan a las rutas internas de Next.js (/api/rrhh/creser/...)
// que actúan de proxy hacia los servicios legacy (Dynamics PHP + BD SQL Server).

const BASE = '/api/rrhh/creser';

async function handleResponse(res) {
    if (!res.ok) {
        let message = 'Ocurrió un error al comunicarse con el servidor';
        try {
            const data = await res.json();
            message = data?.message || message;
        } catch (_) { /* noop */ }
        throw new Error(message);
    }
    return res.json();
}

/**
 * Verifica si el usuario tiene permiso para ver los reportes CRESER.
 * @param {number|string} funId
 * @returns {Promise<{ granted: boolean }>}
 */
export async function checkPermisoCreser(funId) {
    const res = await fetch(`${BASE}/permiso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fun_id: funId }),
    });
    return handleResponse(res);
}

/**
 * Lista usuarios CRESER a cargo del funcionario.
 * El backend devuelve HTML (filas <tr>) envuelto en { html: string }.
 * @param {number|string} funId
 * @returns {Promise<{ html: string }>}
 */
export async function getListaUsuariosCreser(funId) {
    const res = await fetch(`${BASE}/lista-usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fun_id: funId }),
    });
    return handleResponse(res);
}

/**
 * Listado de áreas con estadísticas CRESER por periodo.
 * @param {number|string} periodoId
 * @returns {Promise<{ success: boolean, msj: object }>}
 */
export async function getAreasCreser(periodoId) {
    const res = await fetch(`${BASE}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodo: periodoId }),
    });
    return handleResponse(res);
}

/**
 * Personas de un área con su estado CRESER.
 * @param {number|string} idDep
 * @param {number|string} periodoId
 */
export async function getPersonasArea(idDep, periodoId) {
    const res = await fetch(`${BASE}/personas-area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idDep, periodo: periodoId }),
    });
    return handleResponse(res);
}

/**
 * Registro de proyectos y formación por periodo (tab Proyectos).
 * @param {number|string} periodoId
 */
export async function getProyectosFormacion(periodoId) {
    const res = await fetch(`${BASE}/proyectos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodo: periodoId }),
    });
    return handleResponse(res);
}

/**
 * Lista de periodos CRESER.
 * @returns {Promise<{ cantidad_registros: number, [i]: { cp_id, cp_fecha_inicio, cp_fecha_fin, cp_descripcion } }>}
 */
export async function getListaPeriodos() {
    const res = await fetch(`${BASE}/periodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listaPeriodos' }),
    });
    return handleResponse(res);
}

/**
 * Crea un nuevo periodo CRESER.
 * @param {{ periodoInicio: string, peridodFinal: string, peridoDescripcion: string, idUsuario: number|string }} payload
 */
export async function crearPeriodo(payload) {
    const res = await fetch(`${BASE}/periodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'crearPeriodo', ...payload }),
    });
    return handleResponse(res);
}

/**
 * Actualiza un periodo CRESER existente.
 * @param {{ id: number|string, incioPeriodo: string, finalPeriodo: string, peridoDescripcion: string }} payload
 */
export async function actualizarPeriodo(payload) {
    const res = await fetch(`${BASE}/periodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'actualizarPerdidos', ...payload }),
    });
    return handleResponse(res);
}

/**
 * Obtiene los datos de la encuesta CRESER desde el HTML de Dynamics.
 * Devuelve datos estructurados: { titulo, columns, rows, canEvaluar, etId }
 * @param {{ et_id: number|string, filtro_atr: string, id_usuario: number|string }} params
 */
export async function getEncuestaView({ et_id, filtro_atr, id_usuario }) {
    const res = await fetch(`${BASE}/encuesta-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ et_id, filtro_atr, id_usuario }),
    });
    return handleResponse(res);
}

/**
 * Obtiene el detalle de una evaluación (respuestas) llamando a la nueva API JSON de Dynamics.
 * @param {{ et_id: number|string, ere_id: number|string, idUsu?: number|string }} params
 */
export async function getEncuestaRta({ et_id, ere_id, idUsu }) {
    const res = await fetch(`${BASE}/encuesta-rta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ et_id, ere_id, idUsu }),
    });
    return handleResponse(res);
}

/**
 * Llama a métodos de ClassProject (getAdditionalInfo, saveAdditionalInfo, editAdditionalInfo)
 * @param {string} method Nombre del método de la clase PHP
 * @param {object} param Parámetros que recibe el método PHP
 */
export async function callClassProject(method, param) {
    const res = await fetch(`${BASE}/class-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, param }),
    });
    return handleResponse(res);
}

/**
 * Obtiene la estructura de la encuesta CRESER para tomarla (inputs, grupos, preguntas).
 */
export async function getEncuestaTakeForm(et_id) {
    const res = await fetch(`${BASE}/encuesta-take?et_id=${et_id}`);
    return handleResponse(res);
}

/**
 * Guarda una evaluación CRESER enviando un FormData
 */
export async function saveEncuestaTakeForm(formData) {
    const res = await fetch(`${BASE}/encuesta-take`, {
        method: 'POST',
        body: formData, // Fetch calcula el boundary automáticamente
    });
    return handleResponse(res);
}



