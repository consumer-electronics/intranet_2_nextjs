import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/certificado_laboral.php`;

/**
 * Resuelve la identidad del usuario autenticado consultando /api/auth/me
 * de forma interna (mismo patrón que desprendibles/route.js).
 */
async function resolveUser(request) {
    const __token = (request.headers.get('cookie') || '').match(/access_token=([^;]+)/)?.[1];
        const meRes = await fetch(`${(process.env.API_NODE || '').replace(/\/+$/, '')}/api/auth/me`, {
            headers: { Authorization: `Bearer ${__token}`, Accept: 'application/json' },
            cache: 'no-store',
        });

    if (!meRes.ok) return null;

    const me = await meRes.json();
    const userObj = me?.user || me?.data?.user || me?.data;

    return {
        funId:
            userObj?.fun_id ??
            userObj?.funId ??
            userObj?.id ??
            userObj?.id_usuario ??
            null,
    };
}

/**
 * Genera el certificado laboral (PDF) de un funcionario.
 *
 * Equivale a la llamada legacy:
 *   certificado_laboral.php?id=<fun_id>
 *
 * El backend legacy (TCPDF) devuelve el binario del PDF. Aquí se hace de
 * proxy y se reenvía como application/pdf para que el visor general del
 * proyecto (PdfViewer) pueda mostrarlo.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Funcionario no especificado' }, { status: 400 });
        }

        const user = await resolveUser(request);
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const dynamicsUrl = `${LEGACY_ENDPOINT}?id=${encodeURIComponent(id)}`;

        const dynamicsRes = await fetch(dynamicsUrl, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!dynamicsRes.ok) {
            return NextResponse.json(
                { error: 'No se pudo generar el certificado laboral' },
                { status: dynamicsRes.status }
            );
        }

        const arrayBuffer = await dynamicsRes.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="certificado_laboral_${id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('[GET /api/rrhh/certificados-laborales/pdf]', error);
        return NextResponse.json(
            { error: 'Error al generar el certificado laboral' },
            { status: 500 }
        );
    }
}
