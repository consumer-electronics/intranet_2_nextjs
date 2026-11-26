import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const authToken = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
        const apiNodeUrl = (process.env.API_NODE || '').replace(/\/+$/, '');
        const body = await request.json().catch(() => ({}));
        const modNombre = body.mod_nombre;
        const funId = body.fun_id ?? body.funId ?? body.id ?? body.userId;

        if (!modNombre) {
            return NextResponse.json({ message: 'Falta el nombre del permiso' }, { status: 400 });
        }
        if (!authToken || !apiNodeUrl || !funId) {
            return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
        }

        const nodeResponse = await fetch(`${apiNodeUrl}/api/permissions/user`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ userId: funId, listModules: [modNombre] }),
            cache: 'no-store',
        });

        const nodeData = await nodeResponse.json().catch(() => ({}));
        if (!nodeResponse.ok) {
            return NextResponse.json(
                { message: nodeData?.message || nodeData?.msg || 'No ha validado el permiso' },
                { status: nodeResponse.status }
            );
        }

        return NextResponse.json(nodeData?.data || []);
    } catch (error) {
        console.error('[POST /api/rrhh/biometrico/permiso]', error);
        return NextResponse.json(
            { message: 'No ha validado el permiso' },
            { status: 500 }
        );
    }
}
