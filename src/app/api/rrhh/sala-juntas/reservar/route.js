import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getSession } from '@/lib/session';

const BACKEND_BASE_URL = (
    process.env.RUTA_API_DEV
).replace(/\/+$/, '');

const LEGACY_SALA_JUNTAS_URL = `${BACKEND_BASE_URL}/pantallas/intranet/paginas/gestion_humana/sala_juntas.php`;

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            sala,
            fechaInicio,
            fechaFinal,
            descripcion,
            idusu,
            idUsu,
            fun_id,
            funId,
            userId,
            usuarioId: usuarioIdFromBody,
            id,
            id_usuario,
            usuario,
            user,
        } = body;

        const session = await getSession();
        const sessionUser = session?.usuario;
        const usuarioId =
            idusu ??
            idUsu ??
            fun_id ??
            funId ??
            userId ??
            usuarioIdFromBody ??
            id ??
            id_usuario ??
            usuario?.fun_id ??
            usuario?.funId ??
            usuario?.id ??
            user?.fun_id ??
            user?.funId ??
            user?.id ??
            sessionUser?.fun_id ??
            sessionUser?.funId ??
            sessionUser?.id ??
            sessionUser?.usuarioId ??
            sessionUser?.idusu ??
            sessionUser?.idUsu ??
            null;

        if (
            !sala ||
            !fechaInicio ||
            !fechaFinal ||
            !descripcion?.trim()
        ) {
            return NextResponse.json(
                {
                    error:
                        'Todos los campos de la reservación son obligatorios.',
                },
                { status: 400 },
            );
        }

        if (!usuarioId) {
            return NextResponse.json(
                {
                    error:
                        'No se pudo identificar el usuario autenticado para reservar la sala.',
                },
                { status: 401 },
            );
        }

        if (!BACKEND_BASE_URL) {
            return NextResponse.json(
                {
                    error:
                        'No está configurada la variable RUTA_API.',
                },
                { status: 500 },
            );
        }

        /**
         * El usuario NO se recibe desde el navegador.
         *
         * El backend debe obtenerlo desde la sesión.
         */
        const formData = new URLSearchParams();

        formData.append(
            'accion',
            'formSepararSala',
        );

        formData.append(
            'sala',
            String(sala),
        );

        formData.append(
            'fechaInicio',
            fechaInicio,
        );

        formData.append(
            'fechaFinal',
            fechaFinal,
        );

        formData.append(
            'descripcion',
            descripcion.trim(),
        );

        formData.append(
            'idusu',
            String(usuarioId),
        );

        const response = await fetch(
            LEGACY_SALA_JUNTAS_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                cache: 'no-store',
            },
        );

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error:
                        'Error creando la reservación.',
                    detail: text,
                },
                { status: response.status },
            );
        }

        /**
         * El PHP antiguo devuelve normalmente:
         *
         * 1
         *
         * o algún mensaje.
         */
        const trimmed = text.trim();

        if (trimmed === '1') {
            return NextResponse.json({
                success: true,
                resultado: 1,
            });
        }

        try {
            return NextResponse.json(JSON.parse(trimmed));
        } catch {
            return NextResponse.json({
                success: false,
                resultado: trimmed,
            });
        }
    } catch (error) {
        console.error(
            'POST /api/rrhh/sala-juntas/reservar:',
            error,
        );

        return NextResponse.json(
            {
                error:
                    'Error interno creando la reservación.',
            },
            { status: 500 },
        );
    }
}