import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const AUTH_BACKEND_URL = `${(process.env.API_NODE || '').replace(/\/+$/, '')}/api/auth`;

export async function GET() {
    const cookieStore = await cookies();

    const accessToken =
        cookieStore.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json(
            {
                message: 'No autenticado',
            },
            {
                status: 401,
            }
        );
    }

    let backendResponse;

    try {
        backendResponse = await fetch(
            `${AUTH_BACKEND_URL}/me`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: 'no-store',
            }
        );
    } catch (error) {
        console.error(
            '[AUTH ME] Error conectando con backend:',
            error
        );

        return NextResponse.json(
            {
                message:
                    'No se pudo contactar al servidor de autenticación',
            },
            {
                status: 502,
            }
        );
    }

    let data = null;

    try {
        data = await backendResponse.json();
    } catch {
        data = null;
    }

    if (!backendResponse.ok) {
        return NextResponse.json(
            {
                message:
                    data?.message ||
                    'No autenticado',
            },
            {
                status: backendResponse.status === 401
                    ? 401
                    : 502,
            }
        );
    }

    return NextResponse.json({
        user: data?.data?.user || data?.user,
        mustChangePassword: Boolean(
            data?.data?.user?.cambio_pass ||
            data?.user?.cambio_pass
        ),
    });
}