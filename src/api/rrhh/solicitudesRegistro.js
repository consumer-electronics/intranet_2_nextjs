// src/api/rrhh/solicitudesRegistro.js
// Capa de acceso a datos del submódulo "Registro de permisos por fecha" (RRHH).
// Llama a la ruta interna /api/rrhh/solicitudes/registro, que hace de proxy
// hacia las acciones legacy `listaYearPermisos`, `listaMesesPermisos` y
// `listaPermisosRegistros` del archivo `solicitud_permisos.php`.

const BASE_API = '/api/rrhh/solicitudes/registro';

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
 * Obtiene los años que tienen registros de permisos.
 * @returns {Promise<{ rows: Array<{ ano: number|string }> }>}
 */
export async function getYearsPermisos() {
    const response = await fetch(`${BASE_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listaYearPermisos' }),
    });
    return handleResponse(response);
}

/**
 * Obtiene los meses que tienen registros de permisos para un año.
 * @param {number|string} ano - año a consultar.
 * @returns {Promise<{ rows: Array<{ mes: number|string }> }>}
 */
export async function getMesesPermisos(ano) {
    const response = await fetch(`${BASE_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listaMesesPermisos', ano }),
    });
    return handleResponse(response);
}

/**
 * Obtiene el registro de permisos aprobados/finalizados por año/mes/motivo.
 * @param {{ ano: number|string, mes: number|string, motivo: number|string }} params
 *   - motivo: 1=Médica, 2=Urgencia Médica, 3=Laboral, 4=Personal, ''=Todos.
 * @returns {Promise<{ rows: Array<object> }>}
 */
export async function getRegistrosPermisos({ ano, mes, motivo }) {
    const response = await fetch(`${BASE_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listaPermisosRegistros', ano, mes, motivo }),
    });
    return handleResponse(response);
}
