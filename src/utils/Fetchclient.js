/**
 * Cliente fetch centralizado.
 *
 * Objetivo: que ningún componente llame fetch() directamente.
 * Todas las llamadas HTTP pasan por aquí para tener en un solo
 * lugar: base URL, credenciales, manejo de errores y parseo JSON.
 *
 * TODO BACKEND:
 * - Confirmar si la autenticación entre Next.js y el backend Node.js
 *   se maneja con cookie httpOnly (recomendado) o con Bearer token.
 *   Mientras tanto se usa `credentials: 'include'` asumiendo cookie
 *   de sesión, que es el reemplazo natural del $session de PHP.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response) {
  let payload = null;

  const contentType =
    response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    payload = await response
      .json()
      .catch(() => null);
  }

  return payload;
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers,
    ...rest
  } = options;

  const normalizedBody =
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams
      ? body
      : body
        ? JSON.stringify(body)
        : undefined;

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: normalizedBody,
      ...rest,
    }
  );

  const payload =
    await parseResponse(response);

  return {
    response,
    payload,
  };
}

export async function apiFetch(
  path,
  options = {},
  retry = true
) {
  const {
    response,
    payload,
  } = await request(path, options);

  /*
   * Petición exitosa
   */
  if (response.ok) {
    return payload;
  }

  /*
   * Access token expirado.
   *
   * Nunca intentamos refrescar el endpoint
   * de refresh nuevamente.
   */
  if (
    response.status === 401 &&
    retry &&
    path !== '/api/auth/refresh' &&
    path !== '/api/auth/login'
  ) {
    try {
      const refreshResponse =
        await fetch(
          `${API_BASE_URL}/api/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type':
                'application/json',
            },
          }
        );

      if (refreshResponse.ok) {
        /*
         * El Route Handler de Next.js
         * habrá reemplazado las cookies.
         *
         * Reintentamos UNA sola vez.
         */
        return apiFetch(
          path,
          options,
          false
        );
      }
    } catch (refreshError) {
      console.error(
        '[AUTH] Error haciendo refresh:',
        refreshError
      );
    }

    /*
     * Refresh inválido.
     *
     * El usuario debe iniciar sesión nuevamente.
     */
    if (
      typeof window !== 'undefined' &&
      !path.startsWith('/api/auth/')
    ) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
  }

  throw new ApiError(
    payload?.message ||
    `Error en la petición (${response.status})`,
    response.status,
    payload
  );
}

export { ApiError };