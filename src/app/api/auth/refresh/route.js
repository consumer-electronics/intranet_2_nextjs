import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

// TODO: mover posteriormente a process.env.AUTH_BACKEND_URL
const AUTH_BACKEND_URL = process.env.API_NODE;

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 10;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 4;

const COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};

export async function POST() {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get(
        REFRESH_TOKEN_COOKIE
    )?.value;

    if (!refreshToken) {
        return NextResponse.json(
            {
                message: 'Sesión expirada',
                authenticated: false,
            },
            { status: 401 }
        );
    }

    let backendResponse;

    try {
        backendResponse = await fetch(
            `${AUTH_BACKEND_URL}/refresh-token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    refreshToken,
                }),
                cache: 'no-store',
            }
        );
    } catch (error) {
        console.error(
            '[AUTH REFRESH] Error conectando con backend:',
            error
        );

        return NextResponse.json(
            {
                message:
                    'No se pudo contactar al servidor de autenticación',
            },
            { status: 502 }
        );
    }

    let data;

    try {
        data = await backendResponse.json();
    } catch (error) {
        console.error(
            '[AUTH REFRESH] Respuesta inválida:',
            error
        );

        return NextResponse.json(
            {
                message:
                    'Respuesta inválida del servidor de autenticación',
            },
            { status: 502 }
        );
    }

    if (!backendResponse.ok) {
        console.warn(
            `[AUTH REFRESH] Refresh rechazado. HTTP ${backendResponse.status}`
        );

        const response = NextResponse.json(
            {
                message:
                    data?.message ||
                    'La sesión ha expirado',
                authenticated: false,
            },
            { status: 401 }
        );

        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);

        return response;
    }

    const newToken = data?.data?.token;
    const newRefreshToken = data?.data?.refreshToken;

    if (!newToken || !newRefreshToken) {
        console.error(
            '[AUTH REFRESH] Backend no devolvió nuevos tokens'
        );

        const response = NextResponse.json(
            {
                message:
                    'Respuesta de refresh incompleta',
                authenticated: false,
            },
            { status: 502 }
        );

        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);

        return response;
    }

    const response = NextResponse.json({
        authenticated: true,
    });

    response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        newToken,
        {
            ...COOKIE_BASE_OPTIONS,
            maxAge: ACCESS_TOKEN_MAX_AGE,
        }
    );

    response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        newRefreshToken,
        {
            ...COOKIE_BASE_OPTIONS,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        }
    );

    return response;
}