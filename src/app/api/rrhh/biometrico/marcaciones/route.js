import { NextResponse } from 'next/server';
import { formatDateDDMMYYYY, formatTime12h } from '@/lib/biometricoFormat';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const authToken = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
        const apiNodeUrl = (process.env.API_NODE || '').replace(/\/+$/, '');
        const body = await request.json().catch(() => ({}));

        if (!authToken || !apiNodeUrl) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        if (!body.inicio || !body.final) {
            return NextResponse.json({ message: 'Debe indicar un rango de fechas' }, { status: 400 });
        }

        let targetId = body.idUsuario;

        if (!targetId) {
            const meResponse = await fetch(`${apiNodeUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
                cache: 'no-store',
            });
            if (!meResponse.ok) {
                return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
            }

            const me = await meResponse.json();
            const user = me?.user || me?.data?.user || me?.data;
            targetId = user?.fun_empleado_geminus ?? user?.id_geminus ?? user?.geminus ?? null;

            if (!targetId) {
                const idResponse = await fetch(`${apiNodeUrl}/api/biometrico/user-id`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        funId: user?.fun_id ?? user?.funId ?? user?.id,
                        dni: user?.dni ?? user?.identificacion,
                    }),
                    cache: 'no-store',
                });
                const idData = await idResponse.json().catch(() => ({}));
                if (idResponse.ok) {
                    targetId = idData?.data?.biometricId ?? null;
                }
            }
        }

        if (!targetId) {
            return NextResponse.json({
                data: { rows: [], message: 'El usuario no tiene el id biométrico asociado.' },
            });
        }

        const nodeResponse = await fetch(`${apiNodeUrl}/api/biometrico/marcaciones`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                idUsuario: targetId,
                inicio: body.inicio,
                final: body.final,
            }),
            cache: 'no-store',
        });

        const nodeData = await nodeResponse.json().catch(() => ({}));
        if (!nodeResponse.ok) {
            return NextResponse.json(
                { message: nodeData?.message || 'No se pudieron cargar las marcaciones' },
                { status: nodeResponse.status }
            );
        }

        const grouped = new Map();
        for (const row of nodeData?.data?.rows || []) {
            if (!row.fecha) continue;
            if (!grouped.has(row.fecha)) grouped.set(row.fecha, []);
            if (row.hora) grouped.get(row.fecha).push(formatTime12h(row.hora));
        }

        const rows = Array.from(grouped.entries()).map(([fechaIso, horas]) => ({
            fecha: formatDateDDMMYYYY(fechaIso),
            horas,
        }));

        return NextResponse.json({ data: { rows } });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/marcaciones]', error);
        return NextResponse.json(
            { message: 'No se pudieron cargar las marcaciones' },
            { status: 500 }
        );
    }
}
