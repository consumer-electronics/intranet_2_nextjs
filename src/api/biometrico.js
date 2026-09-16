// src/api/biometrico.js
// Capa de acceso a datos del módulo "Control Biométrico" (RRHH).
// Todas las funciones llaman a las rutas internas de Next.js (/app/api/...),
// que a su vez hacen de proxy hacia el backend legacy (PHP + Dynamics).

const BASE_API = '/api/rrhh/biometrico';

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
 * Obtiene el listado de empleados según el tipo de vista.
 *
 * @param {'usuario'|'todos'|'area'} tipo
 *   - 'usuario': subordinados del usuario autenticado (listaUsuario)
 *   - 'todos':   todos los empleados activos (listaTodos)
 *   - 'area':    empleados del área del usuario (listaTodosArea)
 * @returns {Promise<{ data: { rows: Array } }>}
 */
export async function getListaBiometrico(tipo) {
    const response = await fetch(`${BASE_API}/lista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
    });
    return handleResponse(response);
}

/**
 * Obtiene las marcaciones de un empleado dentro de un rango de fechas.
 * Si no se pasa idUsuario, se usan las marcaciones del usuario autenticado.
 *
 * @param {{ idUsuario?: string|number, inicio: string, final: string }} params
 *   - inicio/final en formato YYYY-MM-DD
 * @returns {Promise<{ data: { rows: Array<{ fecha: string, horas: string[] }> } }>}
 */
export async function getMarcacionesBiometrico({ idUsuario, inicio, final }) {
    const response = await fetch(`${BASE_API}/marcaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario, inicio, final }),
    });
    return handleResponse(response);
}

/**
 * Dispara la sincronización del dispositivo biométrico (ZKLib).
 * @returns {Promise<{ data: { ok: boolean, message: string } }>}
 */
export async function sincronizarBiometrico() {
    const response = await fetch(`${BASE_API}/sincronizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
}

/**
 * Verifica si el usuario tiene el permiso indicado.
 *
 * @param {number|string} funId - id del funcionario autenticado.
 * @param {'biometrico_todos'|'biometrico_areas'} modNombre - nombre del permiso.
 */
export async function checkPermisoBiometrico(funId, modNombre) {
    const response = await fetch(`${BASE_API}/permiso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fun_id: funId, mod_nombre: modNombre }),
    });
    return handleResponse(response);
}
