import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('id');
        const forceDownload = searchParams.get('download') === 'true';

        if (!fileName) {
            return NextResponse.json({ error: 'Documento no especificado' }, { status: 400 });
        }

        const __token = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
        const meRes = await fetch(`${(process.env.API_NODE || '').replace(/\/+$/, '')}/api/auth/me`, {
            headers: { Authorization: `Bearer ${__token}`, Accept: 'application/json' },
            cache: 'no-store',
        });

        if (!meRes.ok) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const me = await meRes.json();
        const userObj = me?.user || me?.data?.user || me?.data;
        const cedula = userObj?.dni || userObj?.cedula || userObj?.fun_cedula || userObj?.fun_usuario || userObj?.id_usuario;

        if (!cedula) {
            return NextResponse.json({ error: 'No se pudo identificar la cédula del usuario' }, { status: 401 });
        }

        // El archivo solicitado siempre debe corresponder a la cédula de la sesión activa.
        // Esto reemplaza la verificación por password reenviado que hacía el PHP legacy.
        const pattern = new RegExp(`^(\\d{8})(?:\\d{13,15}${cedula}|_${cedula})\\.pdf$`);
        if (!pattern.test(fileName)) {
            return NextResponse.json({ error: 'No tienes permiso para acceder a este archivo' }, { status: 403 });
        }

        // Proxy to Legacy PHP instead of local filesystem
        const baseUrl = process.env.URL_DYNAMICS.endsWith('/') ? process.env.URL_DYNAMICS : `${process.env.URL_DYNAMICS}/`;
        const legacyEndpoint = `${baseUrl}pantallas/intranet/paginas/gestion_humana/obtener_documento.php`;
        
        const internalSecret = process.env.DYNAMICS_INTERNAL_SECRET || '';

        const formData = new URLSearchParams();
        formData.append('user', cedula);
        formData.append('file', fileName);
        formData.append('internal_secret', internalSecret);
        if (forceDownload) {
            formData.append('download', 'true');
        }

        const legacyRes = await fetch(legacyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
            cache: 'no-store'
        });

        if (!legacyRes.ok) {
            console.error('[GET /api/rrhh/desprendibles/download] Legacy retornó status:', legacyRes.status);
            return NextResponse.json({ error: 'El documento no se encuentra disponible en el servidor' }, { status: 404 });
        }

        const fileBuffer = await legacyRes.arrayBuffer();

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `${forceDownload ? 'attachment' : 'inline'}; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error('[GET /api/rrhh/desprendibles/download]', error);
        return NextResponse.json({ error: 'Error al obtener el documento' }, { status: 500 });
    }
}