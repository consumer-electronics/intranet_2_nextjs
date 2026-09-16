import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getBaseUrl = () => {
    let url = process.env.NODE_ENV === 'development' 
        ? process.env.RUTA_API_DEV 
        : process.env.RUTA_API;
    if (!url && process.env.NODE_ENV === 'development') {
        url = process.env.RUTA_API;
    }
    return url ? url.replace(/\/$/, '') : '';
};

export async function POST(request) {
    let body;

    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json({ message: 'Cuerpo de la petición inválido' }, { status: 400 });
    }

    const { password, id_usuario } = body ?? {};

    if (!password || !id_usuario) {
        return NextResponse.json({ message: 'Contraseña y ID de usuario son requeridos' }, { status: 400 });
    }

    const baseUrl = getBaseUrl();

    try {
        // 1. Encriptar contraseña
        const encryptUrl = `${baseUrl}/funciones_generales.php?ejecutar_accion_general=encript_user_pass&password=${encodeURIComponent(password)}`;
        const encryptResponse = await fetch(encryptUrl, {
            method: 'POST',
            cache: 'no-store'
        });
        
        const encryptData = await encryptResponse.json();
        const passToVerify = encryptData.password;

        if (!passToVerify) {
            return NextResponse.json({ message: 'Error al procesar la contraseña' }, { status: 500 });
        }

        // 2. Comparar contraseña (evitar reusar contraseñas previas)
        const compareUrl = `${baseUrl}/modulos/configuracion/funcionario/ejecutar_acciones.php?ejecutar_accion=compare_pass&password=${encodeURIComponent(passToVerify)}&id_fun=${id_usuario}`;
        const compareResponse = await fetch(compareUrl, {
            method: 'POST',
            cache: 'no-store'
        });

        const compareData = await compareResponse.json();
        const count = Number(compareData.count || 0);

        if (count !== 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'La contraseña ingresada ya se ha utilizado anteriormente. Por favor, elige una diferente.' 
            }, { status: 400 });
        }

        // 3. Ejecutar cambio de contraseña
        const changeFormData = new FormData();
        changeFormData.append('ejecutar_accion', 'cambiar_contrasena_funcionario');
        changeFormData.append('fun_id', id_usuario);
        changeFormData.append('fun_pass', password);
        changeFormData.append('fun_pass_repeat', password);

        const changeUrl = `${baseUrl}/modulos/configuracion/funcionario/ejecutar_acciones.php`;
        const changeResponse = await fetch(changeUrl, {
            method: 'POST',
            body: changeFormData,
            cache: 'no-store'
        });

        const changeData = await changeResponse.json();

        if (changeData.exito) {
            return NextResponse.json({ success: true, message: 'Contraseña actualizada satisfactoriamente' });
        } else {
            return NextResponse.json({ success: false, message: 'Error al actualizar la contraseña' }, { status: 400 });
        }

    } catch (error) {
        console.error('[CHANGE-PASSWORD] Error conectando con backend PHP:', error);
        return NextResponse.json(
            { message: 'No se pudo contactar al servidor para el cambio de contraseña' },
            { status: 502 }
        );
    }
}
