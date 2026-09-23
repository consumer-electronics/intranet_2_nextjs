import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const API_NODE = process.env.API_NODE || 'http://localhost:3010';

        // Extraer el token de la cookie de sesión de Next.js
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({ success: false, data: [] }, { status: 401 });
        }

        const res = await fetch(`${API_NODE.replace(/\/+$/, '')}/api/sig/getPermisosMapa`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[SIG] Node API error getPermisosMapa: ${res.status}`);
            return NextResponse.json({ success: false, data: [] });
        }

        const json = await res.json();

        return NextResponse.json({ success: true, data: json.data || [] });

    } catch (error) {
        console.error('[SIG][PROXY] getPermisosMapa', error);
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud de permisos.' },
            { status: 500 }
        );
    }
}
