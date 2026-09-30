import { NextResponse } from 'next/server';
import { decodeHtmlEntities } from '@/lib/htmlEntities';
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

    const rawUser = data?.data?.user || data?.user;

    // Normaliza campos de nombre para eliminar entidades HTML del backend
    // (p. ej. "Pe&ntilde;a" → "Peña") en todas las capas de la app.
    if (rawUser && typeof rawUser === 'object') {
        const nameFields = [
            'name', 'nombre', 'fun_nombre_completo', 'fun_nombre',
            'fun_nombre2', 'fun_apellido', 'fun_apellido2',
        ];
        for (const field of nameFields) {
            if (typeof rawUser[field] === 'string') {
                rawUser[field] = decodeHtmlEntities(rawUser[field]);
            }
        }
    }

    return NextResponse.json({
        user: rawUser,
        mustChangePassword: Boolean(
            rawUser?.cambio_pass
        ),
    });
}