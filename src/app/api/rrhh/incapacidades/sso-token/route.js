import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

const AUTH_BACKEND_URL = process.env.API_NODE;
// URL del módulo de incapacidades (destino en el portal)
const PORTAL_URL = process.env.URL_PORTAL_INCAPACIDADES;
// Secret compartido con el portal — coincide con JWT_SECRET_PORTAL_FINANCIERO en dynamics-node
const SSO_SECRET = process.env.SSO_SHARED_SECRET;

/** Duración del token SSO en segundos (5 minutos, igual que Dynamics) */
const SSO_TTL_SECONDS = 5 * 60;

/**
 * Recupera el usuario autenticado mediante la cookie httpOnly access_token.
 * @returns {Promise<object|null>} Objeto user o null si no está autenticado.
 */
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) return null;

    try {
        const res = await fetch(`${AUTH_BACKEND_URL}/me`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data?.data?.user || data?.user || null;
    } catch {
        return null;
    }
}

/**
 * Genera un JWT HS256 sin dependencias externas (solo Node.js crypto).
 *
 * Replica exactamente lo que hace dynamics-node/authController.js:
 *   jwt.sign({ username, exp }, SECRET_PORTAL, { algorithm: 'HS256' })
 *
 * @param {string} username  - Nombre de usuario del portal
 * @param {number} exp       - Unix timestamp de expiración (segundos)
 * @returns {string}         - JWT compacto: header.payload.signature
 */
function signJwtHS256(username, exp) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { username, exp };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signingInput = `${b64Header}.${b64Payload}`;
    const signature = createHmac('sha256', SSO_SECRET)
        .update(signingInput)
        .digest('base64url');

    return `${signingInput}.${signature}`;
}

/**
 * POST /api/rrhh/incapacidades/sso-token
 *
 * Genera una URL SSO firmada para acceder al portal de incapacidades.
 * El token es un JWT HS256 compatible con lo que genera dynamics-node.
 *
 * Flujo:
 *   1. Verifica sesión (cookie access_token → /api/auth/me)
 *   2. Genera JWT: { username, exp: now + 5min } firmado con SSO_SHARED_SECRET
 *   3. Devuelve: { redirectUrl: SSO_PORTAL_URL?token=<jwt>, expiresAt }
 *
 * Respuesta exitosa:
 *   { redirectUrl: string, expiresAt: number }
 */
export async function POST() {
    // Validar configuración del servidor
    if (!PORTAL_URL || !SSO_SECRET) {
        console.error('[SSO Incapacidades] Variables de entorno no configuradas:', {
            PORTAL_URL: !!PORTAL_URL,
            SSO_SECRET: !!SSO_SECRET,
        });
        return NextResponse.json(
            { message: 'Portal de incapacidades no configurado' },
            { status: 503 }
        );
    }

    // Verificar autenticación
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json(
            { message: 'No autenticado' },
            { status: 401 }
        );
    }

    // Extraer el username — el portal usa el mismo username que Dynamics
    const username =
        user?.user ??        // campo que devuelve /api/auth/me en dynamics-node
        user?.fun_usuario ??
        user?.usuario ??
        user?.username ??
        String(user?.fun_id ?? user?.id ?? '');

    if (!username) {
        console.error('[SSO Incapacidades] No se pudo determinar el username:', user);
        return NextResponse.json(
            { message: 'No se pudo determinar el usuario autenticado' },
            { status: 500 }
        );
    }

    // Generar JWT SSO con expiración de 5 minutos (en segundos, como usa jwt.sign)
    const nowSeconds = Math.floor(Date.now() / 1000);
    const exp = nowSeconds + SSO_TTL_SECONDS;
    const ssoToken = signJwtHS256(username, exp);

    // El portal procesa el token en el endpoint SSO (/sso-login/).
    // Pasamos la URL de incapacidades como parámetro para que el portal redirija allí después de autenticar.
    const ssoBase = process.env.SSO_PORTAL_URL.replace(/\/$/, '');
    const redirectUrl = `${ssoBase}?token=${ssoToken}&redirect=${encodeURIComponent(PORTAL_URL)}&redirect_to=${encodeURIComponent(PORTAL_URL)}&next=${encodeURIComponent(PORTAL_URL)}`;

    const expiresAt = exp * 1000; // en ms para el contador del cliente

    console.log(`[SSO Incapacidades] Token generado para usuario: ${username}`);

    return NextResponse.json({
        redirectUrl,
        expiresAt,
    });
}
