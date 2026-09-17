import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('id');
        const forceDownload = searchParams.get('download') === 'true';

        if (!fileName) {
            return NextResponse.json({ error: 'Documento no especificado' }, { status: 400 });
        }

        const cookieHeader = request.headers.get('cookie') ?? '';
        const meRes = await fetch(new URL('/api/auth/me', request.url), {
            headers: { cookie: cookieHeader },
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

        const storageBase = process.env.STORAGE_PATH || '\\\\192.168.1.141\\htdocs\\ceg\\almacenamiento';
        const filePath = require('path').join(storageBase, 'desprendibles', fileName);
        
        let fileBuffer;
        try {
            fileBuffer = await require('fs').promises.readFile(filePath);
        } catch (err) {
            console.error('[GET /api/rrhh/desprendibles/download] Archivo no encontrado:', filePath, err);
            return NextResponse.json({ error: 'El documento no se encuentra disponible en el servidor' }, { status: 404 });
        }

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