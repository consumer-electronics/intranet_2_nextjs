import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const AUTH_BACKEND_URL = process.env.API_NODE;

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 10; // 10 horas
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 4; // 4 días

const COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};

export async function POST(request) {
    let body;

    try {
        body = await request.json();
    } catch (error) {
        console.error('[AUTH] Error leyendo JSON:', error);

        return NextResponse.json(
            { message: 'Cuerpo de la petición inválido' },
            { status: 400 }
        );
    }

    const { credential } = body ?? {};

    if (!credential) {
        return NextResponse.json(
            { message: 'El token de credenciales de Google es obligatorio' },
            { status: 400 }
        );
    }

    const loginUrl = `${AUTH_BACKEND_URL}/google-sso`;

    let backendResponse;

    try {
        backendResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                credential,
            }),
            cache: 'no-store',
        });
    } catch (error) {
        console.error('[AUTH] Error conectando con backend para SSO:', error);

        return NextResponse.json(
            { message: 'No se pudo contactar al servidor de autenticación' },
            { status: 502 }
        );
    }

    let data;

    try {
        data = await backendResponse.json();
    } catch (error) {
        console.error(
            '[AUTH] El backend respondió con contenido no JSON en SSO:',
            error
        );

        return NextResponse.json(
            { message: 'Respuesta inválida del servidor de autenticación' },
            { status: 502 }
        );
    }

    if (!backendResponse.ok) {
        console.warn(
            `[AUTH] Login SSO rechazado. HTTP ${backendResponse.status}`
        );

        return NextResponse.json(
            {
                message:
                    data?.message ||
                    'Error al iniciar sesión con Google',
            },
            {
                status: backendResponse.status === 401
                    ? 401
                    : backendResponse.status,
            }
        );
    }

    const authData = data?.data;

    if (!authData?.token || !authData?.refreshToken) {
        console.error('[AUTH] Respuesta de autenticación SSO incompleta');

        return NextResponse.json(
            {
                message:
                    'El servidor de autenticación no devolvió los tokens requeridos',
            },
            { status: 502 }
        );
    }

    const {
        token,
        refreshToken,
        user,
    } = authData;

    const response = NextResponse.json({
        user,
        authenticated: true,
    });

    // Configuramos maxAge para recordar la sesión por defecto (suele ser así con SSO)
    const accessCookieOptions = { ...COOKIE_BASE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE };
    const refreshCookieOptions = { ...COOKIE_BASE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE };

    response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        token,
        accessCookieOptions
    );

    response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        refreshToken,
        refreshCookieOptions
    );

    return response;
}
