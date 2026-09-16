// src/api/rrhh/certificadosLaborales.js
// Capa de acceso a datos del módulo "Certificados Laborales" (RRHH).
// Todas las funciones llaman a las rutas internas de Next.js (/app/api/...),
// que a su vez hacen de proxy hacia el backend legacy (PHP + Dynamics).

const BASE_API = '/api/rrhh/certificados-laborales';

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
 * Obtiene el listado de funcionarios activos para generar certificados.
 *
 * Equivale a la llamada legacy:
 *   POST certificados_laborales.php  accion = listaUsuarios
 *   → SELECT * FROM vrol WHERE rol_estado = 1
 *
 * @returns {Promise<{ data: { rows: Array } }>}
 */
export async function getListaCertificados() {
    const response = await fetch(`${BASE_API}/lista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
}

/**
 * Verifica si el usuario tiene el permiso del módulo.
 *
 * @param {number|string} funId - id del funcionario autenticado.
 * @param {string} [modNombre='certificados_laborales'] - nombre del permiso.
 * @returns {Promise<{ granted: boolean, mod_nombre: string }>}
 */
export async function checkPermisoCertificados(funId, modNombre = 'certificados_laborales') {
    const response = await fetch(`${BASE_API}/permiso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fun_id: funId, mod_nombre: modNombre }),
    });
    return handleResponse(response);
}
