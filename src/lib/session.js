import crypto from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Reemplazo de clases/Session.php.
 * PHP guardaba la sesión server-side ($_SESSION) y solo enviaba al
 * navegador el ID de sesión (cookie PHPSESSID). Aquí no hay un store
 * de sesión server-side propio, así que el contenido de la sesión
 * viaja cifrado dentro de la cookie (AES-256-GCM) — el navegador
 * nunca puede leerlo (httpOnly) ni descifrarlo (no tiene la clave).
 */

const COOKIE_NAME = 'intranet_session';
const SESSION_LIFETIME_SECONDS = 1800;
const ALGO = 'aes-256-gcm';

function getKey() {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
        throw new Error(
            'SESSION_SECRET no está definido.'
        );
    }

    return crypto
        .createHash('sha256')
        .update(secret)
        .digest();
}

export function encryptSession(data) {
    const key = getKey();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        ALGO,
        key,
        iv
    );

    const plaintext = Buffer.from(
        JSON.stringify(data),
        'utf8'
    );

    const ciphertext = Buffer.concat([
        cipher.update(plaintext),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return [iv, ciphertext, tag]
        .map((b) => b.toString('base64url'))
        .join('.');
}

export function decryptSession(token) {
    if (!token) return null;

    try {
        const [
            ivB64,
            ctB64,
            tagB64,
        ] = token.split('.');

        if (
            !ivB64 ||
            !ctB64 ||
            !tagB64
        ) {
            return null;
        }

        const key = getKey();

        const iv = Buffer.from(
            ivB64,
            'base64url'
        );

        const ciphertext = Buffer.from(
            ctB64,
            'base64url'
        );

        const tag = Buffer.from(
            tagB64,
            'base64url'
        );

        const decipher =
            crypto.createDecipheriv(
                ALGO,
                key,
                iv
            );

        decipher.setAuthTag(tag);

        const plaintext = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final(),
        ]);

        return JSON.parse(
            plaintext.toString('utf8')
        );
    } catch {
        return null;
    }
}

export function buildSessionPayload({
    usuario,
    usuarioYem,
}) {
    const now = Math.floor(
        Date.now() / 1000
    );

    return {
        usuario,
        usuarioYem,
        sessionVersion:
            process.env.SESSION_VERSION,
        iat: now,
        exp:
            now +
            SESSION_LIFETIME_SECONDS,
    };
}

export function isSessionValid(payload) {
    if (!payload) return false;

    if (!payload.usuario) return false;

    if (
        payload.sessionVersion !==
        process.env.SESSION_VERSION
    ) {
        return false;
    }

    const now = Math.floor(
        Date.now() / 1000
    );

    if (
        payload.exp &&
        now > payload.exp
    ) {
        return false;
    }

    return true;
}

export const SESSION_COOKIE_NAME =
    COOKIE_NAME;

/**
 * Lee y valida la sesión actual desde la cookie.
 */
export async function getSession() {
    console.log('[SESSION] ===== INICIO getSession =====');

    const cookieStore = await cookies();

    const allCookies = cookieStore.getAll();

    console.log(
        '[SESSION] Cookies recibidas:',
        allCookies.map((cookie) => cookie.name)
    );

    const token = cookieStore.get(
        COOKIE_NAME
    )?.value;

    console.log(
        '[SESSION] Cookie buscada:',
        COOKIE_NAME
    );

    console.log(
        '[SESSION] Cookie existe:',
        !!token
    );

    if (!token) {
        console.log(
            '[SESSION] ❌ No existe intranet_session'
        );

        return null;
    }

    console.log(
        '[SESSION] Token length:',
        token.length
    );

    const payload = decryptSession(token);

    console.log(
        '[SESSION] Payload:',
        payload
    );

    if (!payload) {
        console.log(
            '[SESSION] ❌ No se pudo desencriptar'
        );

        return null;
    }

    console.log(
        '[SESSION] SESSION_VERSION env:',
        process.env.SESSION_VERSION
    );

    console.log(
        '[SESSION] SESSION_VERSION payload:',
        payload.sessionVersion
    );

    console.log(
        '[SESSION] usuario:',
        payload.usuario
    );

    console.log(
        '[SESSION] exp:',
        payload.exp
    );

    const valid = isSessionValid(payload);

    console.log(
        '[SESSION] ¿Sesión válida?:',
        valid
    );

    if (!valid) {
        console.log(
            '[SESSION] ❌ Sesión inválida'
        );

        return null;
    }

    console.log(
        '[SESSION] ✅ Sesión válida'
    );

    return payload;
}

// Mismos atributos que session_set_cookie_params en Session.php
export const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: false,
    maxAge: SESSION_LIFETIME_SECONDS,
};