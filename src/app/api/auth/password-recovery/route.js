import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Configurar URL base dependiendo del entorno
const getBaseUrl = () => {
    let url = process.env.NODE_ENV === 'development' 
        ? process.env.URL_DYNAMICS 
        : process.env.URL_DYNAMICS;
    
    // Fallback si no está definida en dev
    if (!url && process.env.NODE_ENV === 'development') {
        url = process.env.URL_DYNAMICS;
    }
    
    // Remover slash al final si existe
    return url ? url.replace(/\/$/, '') : '';
};

export async function POST(request) {
    let body;

    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json(
            { message: 'Cuerpo de la petición inválido' },
            { status: 400 }
        );
    }

    const { action, userDataToSearch, codigoVerificado, id_usuario } = body ?? {};

    if (!action) {
        return NextResponse.json(
            { message: 'Falta la acción (action)' },
            { status: 400 }
        );
    }

    const baseUrl = getBaseUrl();
    const recoveryUrl = `${baseUrl}/pantallas/intranet/passwordrecovery/PassRecovery.php`;

    let payload = {};

    if (action === 'verifyUser') {
        payload = {
            class: "RecuperarPass",
            method: "verifyUser",
            param: { userDataToSearch }
        };
    } else if (action === 'verifyCode') {
        payload = {
            class: "RecuperarPass",
            method: "verifyCode",
            param: { codigoVerificado, id_usuario }
        };
    } else {
        return NextResponse.json(
            { message: 'Acción no permitida' },
            { status: 400 }
        );
    }

    try {
        const backendResponse = await fetch(recoveryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        const rawText = await backendResponse.text();
        console.log(`[PASSWORD-RECOVERY] Fetch to: ${recoveryUrl}`);
        console.log(`[PASSWORD-RECOVERY] Payload: ${JSON.stringify(payload)}`);
        console.log(`[PASSWORD-RECOVERY] PHP Response Text:`, rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            throw new Error(`Invalid JSON from PHP: ${rawText.substring(0, 100)}`);
        }

        // Si falló en la verificación, retornamos 400
        if (data && data.success === 0) {
            return NextResponse.json(
                data,
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[PASSWORD-RECOVERY] Error conectando con backend PHP:', error);
        return NextResponse.json(
            { message: 'No se pudo contactar al servidor' },
            { status: 502 }
        );
    }
}
