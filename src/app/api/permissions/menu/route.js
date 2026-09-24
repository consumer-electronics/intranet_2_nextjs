import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/permissions/menu
 *
 * Proxy al endpoint del Node API: GET /api/permissions/user/:id
 * Devuelve la lista plana de mod_nombre que el usuario tiene permitidos
 * (incluye mod_tipo='intranet' y mod_tipo='web', per_estado=1).
 *
 * El resultado lo consume AppPermissionsProvider para filtrar el menú lateral.
 * Los módulos de la intranet usan mod_tipo='intranet' (menu_fk=17 SIG, menu_fk=19 RRHH).
 */
export async function GET() {
    try {
        const API_NODE = (process.env.API_NODE || '').replace(/\/+$/, '');
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({ success: false, data: [] }, { status: 401 });
        }

        // Decodificamos el JWT para extraer el user.id (sin verificar firma,
        // la verificación ya la hizo el middleware del Node API).
        let userId;
        try {
            const payload = JSON.parse(
                Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8')
            );
            userId = payload?.id;
        } catch {
            return NextResponse.json({ success: false, data: [] }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ success: false, data: [] }, { status: 401 });
        }

        const res = await fetch(`${API_NODE}/api/permissions/user/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error(`[PERMISSIONS][MENU] Node API error: ${res.status}`);
            return NextResponse.json({ success: false, data: [] });
        }

        const json = await res.json();

        // El Node API devuelve: { data: [{ per_id, mod_fk, module: { mod_nombre } }], ... }
        const modNames = (json?.data || [])
            .map((p) => p?.module?.mod_nombre)
            .filter(Boolean);

        return NextResponse.json({ success: true, data: modNames });
    } catch (error) {
        console.error('[PERMISSIONS][MENU] Error:', error);
        return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }
}
