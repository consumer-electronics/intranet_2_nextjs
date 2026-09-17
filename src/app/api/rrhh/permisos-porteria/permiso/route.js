import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API_DEV;
const LEGACY_ENDPOINT = `${LEGACY_BASE_URL.replace(/\/+$/, '')}/app/funciones.php`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const funId = body.fun_id ?? body.funId ?? body.id ?? body.userId ?? '';

    const formData = new URLSearchParams();
    formData.set('ejecutar_accion', 'permiso_fun_app');
    formData.set('mod_tipo', 'intranet');
    formData.set('fun_id', String(funId ?? ''));
    formData.set('mod_nombre', 'solicitud_permisos_porteria');

    const legacyResponse = await fetch(LEGACY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formData,
      cache: 'no-store',
    });

    const text = await legacyResponse.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return NextResponse.json(data, { status: legacyResponse.status });
  } catch (error) {
    return NextResponse.json({ message: 'No ha validado el permiso' }, { status: 500 });
  }
}
