import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.RUTA_API_DEV;
const LEGACY_ENDPOINT = `${LEGACY_BASE_URL.replace(/\/+$/, '')}/pantallas/intranet/paginas/gestion_humana/solicitud_permisos.php`;

export async function POST(request) {
  try {
    const { idSolicitudPermiso, formLlegadaHora } = await request.json();

    const formData = new URLSearchParams();
    formData.set('accion', 'finalizarPermiso');
    formData.set('idSolicitudPermiso', String(idSolicitudPermiso ?? ''));
    formData.set('formLlegadaHora', formLlegadaHora ?? '');

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
    if (text.trim() !== 'Ok') {
      return NextResponse.json({ message: text || 'No se ha podido enviar el formulario.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Ok' });
  } catch (error) {
    return NextResponse.json({ message: 'No se ha podido enviar el formulario.' }, { status: 500 });
  }
}
