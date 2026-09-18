import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/permisos_vacas/sendMail.php`;

/**
 * Reenvía las notificaciones por correo del módulo de vacaciones.
 *
 * Equivale a las llamadas legacy a `permisos_vacas/sendMail.php`:
 *   - enviarCorreoVacas            → al jefe al crear la solicitud
 *   - enviarCorreoVacasUserAprobar → al usuario al aprobar
 *   - enviarCorreoVacasUserRechazo → al usuario al rechazar
 *   - enviarCorreoVacasUserReversado → al usuario al reversar
 *
 * El frontend legacy dispara estas llamadas "fire-and-forget" (sin usar la
 * respuesta). Este handler reenvía los parámetros recibidos tal cual.
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const accion = body.accion ?? '';

        if (!accion) {
            return NextResponse.json(
                { message: 'Falta la acción de correo.' },
                { status: 400 }
            );
        }

        const formData = new URLSearchParams();
        formData.set('accion', accion);

        // Reenvía todos los campos recibidos (nombre, id, fechas, token, etc.)
        Object.entries(body).forEach(([key, value]) => {
            if (key === 'accion') return;
            if (value == null) return;
            formData.set(key, String(value));
        });

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        const text = (await legacyResponse.text()).trim();

        return NextResponse.json({
            ok: legacyResponse.ok,
            message: text || (legacyResponse.ok ? 'Correo enviado.' : 'Error al enviar el correo.'),
        });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: 'Error al enviar el correo.' },
            { status: 500 }
        );
    }
}
