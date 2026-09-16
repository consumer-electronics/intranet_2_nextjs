import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export async function POST() {
    const response = NextResponse.json({
        authenticated: false,
        message: 'Sesión cerrada correctamente',
    });

    response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        '',
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0,
        }
    );

    response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        '',
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0,
        }
    );

    return response;
}