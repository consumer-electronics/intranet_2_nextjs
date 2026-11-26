// src/app/api/rrhh/biometrico/sincronizar/route.js
import { NextResponse } from 'next/server';
import { sincronizarMarcacionesGeovictoria } from '@/services/geovictoria.service';

export const runtime = 'nodejs';

/**
 * Resuelve la identidad del usuario autenticado consultando /api/auth/me
 */
async function resolveUser(request) {
    const __token = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
    if (!__token) return null;

    try {
        const meRes = await fetch(`${(process.env.API_NODE || '').replace(/\/+$/, '')}/api/auth/me`, {
            headers: { Authorization: `Bearer ${__token}`, Accept: 'application/json' },
            cache: 'no-store',
        });

        if (!meRes.ok) return null;

        const me = await meRes.json();
        const userObj = me?.user || me?.data?.user || me?.data;

        return {
            funId:
                userObj?.fun_id ??
                userObj?.funId ??
                userObj?.id ??
                userObj?.id_usuario ??
                null,
            geminus:
                userObj?.fun_empleado_geminus ??
                userObj?.id_geminus ??
                userObj?.geminus ??
                null,
            identificacion:
                userObj?.fun_identificacion ??
                userObj?.identificacion ??
                userObj?.dni ??
                null,
            nombre: userObj?.name ?? userObj?.fun_nombre ?? '',
            apellido: userObj?.fun_apellido ?? '',
        };
    } catch (err) {
        console.error('[sincronizar/resolveUser] Error:', err);
        return null;
    }
}

export async function POST(request) {
    try {
        const user = await resolveUser(request);
        if (!user || !user.funId) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { tipo = 'persona', inicio, final } = body;

        // No permitir sincronización masiva global ("todos") para evitar saturación de Geovictoria
        if (tipo === 'todos') {
            return NextResponse.json(
                {
                    message: 'La sincronización global de todos los empleados está deshabilitada para evitar la saturación de la API de Geovictoria. Sincronice individualmente o por área.',
                },
                { status: 400 }
            );
        }

        if (!inicio || !final) {
            return NextResponse.json(
                { message: 'Debe indicar un rango de fechas (inicio y final)' },
                { status: 400 }
            );
        }

        let identifiers = [];

        if (tipo === 'persona') {
            // Sincronización para el usuario autenticado
            let identificacion = user.identificacion;

            if (!identificacion) {
                return NextResponse.json(
                    { message: 'No se encontró la identificación del usuario asociada a un código biométrico' },
                    { status: 404 }
                );
            }

            identifiers = [String(identificacion).trim()];
        } else if (tipo === 'area') {
            // Sincronización para los empleados del área del usuario
            const authToken = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
            const apiNodeUrl = (process.env.API_NODE || '').replace(/\/+$/, '');

            if (!authToken || !apiNodeUrl) {
                return NextResponse.json(
                    { message: 'No fue posible configurar la conexión con el API Node' },
                    { status: 500 }
                );
            }

            const areaResponse = await fetch(`${apiNodeUrl}/api/biometrico/area-identifiers`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ funId: user.funId }),
                cache: 'no-store',
            });

            const areaData = await areaResponse.json().catch(() => ({}));
            if (!areaResponse.ok) {
                return NextResponse.json(
                    { message: areaData?.message || 'No se pudo obtener el área del usuario' },
                    { status: areaResponse.status }
                );
            }

            identifiers = areaData?.data?.identifiers || [];
            if (identifiers.length === 0) {
                return NextResponse.json(
                    { message: 'No se encontraron empleados activos con código biométrico en el área para sincronizar' },
                    { status: 404 }
                );
            }
        } else {
            return NextResponse.json(
                { message: `Tipo de sincronización inválido: ${tipo}` },
                { status: 400 }
            );
        }

        const authToken = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];

        // Ejecutar sincronización con Geovictoria
        const resultado = await sincronizarMarcacionesGeovictoria({
            identifiers,
            inicio,
            final,
            authToken,
        });

        const resumen =
            resultado.marcasNuevas > 0
                ? `Sincronización completada: ${resultado.marcasNuevas} marca(s) nueva(s) insertada(s) de ${resultado.marcasProcesadas} procesada(s) (${resultado.totalUsuarios} usuario(s)).`
                : `Sincronización completada: los datos ya se encontraban actualizados (${resultado.marcasProcesadas} marca(s) verificada(s) de ${resultado.totalUsuarios} usuario(s)).`;

        return NextResponse.json({
            data: {
                ok: true,
                message: resumen,
                ...resultado,
            },
        });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/sincronizar]', error);
        const isClientError = error.message?.includes('rango de fechas') ||
            error.message?.includes('posterior') ||
            error.message?.includes('antigüedad');

        return NextResponse.json(
            {
                message: error.message || 'No se pudo sincronizar el dispositivo biométrico con Geovictoria',
            },
            { status: isClientError ? 400 : 500 }
        );
    }
}
