// src/api/rrhh/permisosPorteria.js
// Capa de acceso a datos del módulo "Permisos de Portería" (RRHH).
// Todas las funciones llaman a las rutas internas de Next.js (/app/api/...),
// que a su vez hacen de proxy hacia los servicios legacy (PHP + API Dynamics).
//
// TODO: mover BASE_API a variable de entorno cuando se defina la convención
// final de rutas del proyecto.

const BASE_API = '/api/rrhh/permisos-porteria';

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
 * Verifica si el usuario tiene permiso para acceder al módulo de portería.
 * @param {number|string} funId - id del funcionario autenticado.
 */
export async function checkPermisoAcceso(funId) {
  const response = await fetch(`${BASE_API}/permiso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fun_id: funId }),
  });
  return handleResponse(response);
}

/**
 * Obtiene el listado de permisos aprobados pendientes de finalizar.
 */
export async function getPermisosPorteria() {
  const response = await fetch(`${BASE_API}/permisos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion: 'listaUsuarioPorteria' }),
  });
  return handleResponse(response);
}

/**
 * Finaliza un permiso registrando la hora de llegada.
 * @param {{ idSolicitudPermiso: string|number, formLlegadaHora: string }} payload
 */
export async function finalizarPermiso(payload) {
  const response = await fetch(`${BASE_API}/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Obtiene los visitantes activos, o el histórico dentro de un rango de fechas
 * (usado también por el diálogo de "Entregados").
 * @param {{ fechaInicial?: string, fechaFinal?: string }} [params]
 */
export async function getVisitantesActivos(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => Boolean(value))
  );
  const query = new URLSearchParams(cleanParams).toString();
  const response = await fetch(`${BASE_API}/visitantes${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
  return handleResponse(response);
}

/**
 * Marca un carné de visitante como entregado.
 * @param {string|number} id
 * @param {number} [estado=2]
 */
export async function entregarCarnet(id, estado = 2) {
  const response = await fetch(`${BASE_API}/entregar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, estado }),
  });
  return handleResponse(response);
}
