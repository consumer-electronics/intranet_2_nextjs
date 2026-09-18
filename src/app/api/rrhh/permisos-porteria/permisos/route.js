import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${LEGACY_BASE_URL.replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const formData = new URLSearchParams();
    formData.set('accion', body.accion || 'listaUsuarioPorteria');

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
    return NextResponse.json({ message: 'No se ha cargado la tabla' }, { status: 500 });
  }
}
