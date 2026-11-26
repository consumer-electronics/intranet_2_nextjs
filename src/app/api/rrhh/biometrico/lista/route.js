import { NextResponse } from 'next/server';
import { decodeHtmlEntities } from '@/lib/htmlEntities';
import { formatTime12h, getTodayBogota } from '@/lib/biometricoFormat';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const authToken = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
        const apiNodeUrl = (process.env.API_NODE || '').replace(/\/+$/, '');
        const body = await request.json().catch(() => ({}));

        if (!authToken || !apiNodeUrl) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        const meResponse = await fetch(`${apiNodeUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
            cache: 'no-store',
        });
        if (!meResponse.ok) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        const me = await meResponse.json();
        const user = me?.user || me?.data?.user || me?.data;
        const funId = user?.fun_id ?? user?.funId ?? user?.id ?? null;

        if (!funId) {
            return NextResponse.json({ message: 'No se pudo identificar el usuario' }, { status: 400 });
        }

        const nodeResponse = await fetch(`${apiNodeUrl}/api/biometrico/lista`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ tipo: body.tipo, funId }),
            cache: 'no-store',
        });

        const nodeData = await nodeResponse.json().catch(() => ({}));
        if (!nodeResponse.ok) {
            return NextResponse.json(
                { message: nodeData?.message || 'No se pudo cargar el listado biométrico' },
                { status: nodeResponse.status }
            );
        }

        const hoy = getTodayBogota();
        const seenIds = new Set();
        const rows = (nodeData?.data?.rows || []).flatMap((row) => {
            const idUsuario = String(row.idUsuario ?? '').trim();
            if (!idUsuario || seenIds.has(idUsuario)) return [];
            seenIds.add(idUsuario);

            const nombre = decodeHtmlEntities(String(row.nombre || '').replace(/\s+/g, ' ').trim());
            const departamento = decodeHtmlEntities(String(row.departamento || '').trim());
            const fecha = row.fecha || '';

            return {
                id: `biometrico-${idUsuario}-${fecha}-${row.hora || ''}`,
                idUsuario,
                nombre,
                departamento: body.tipo === 'todos' ? departamento : '',
                fecha,
                hora: formatTime12h(row.hora || ''),
                esHoy: Boolean(fecha) && fecha === hoy,
            };
        });

        return NextResponse.json({ data: { rows } });
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/lista]', error);
        return NextResponse.json(
            { message: 'No se pudo cargar el listado biométrico' },
            { status: 500 }
        );
    }
}
