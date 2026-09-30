import { NextResponse } from 'next/server';
import { decodeHtmlEntities } from '@/lib/htmlEntities';

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
      // Normaliza entidades HTML en campos de nombre dentro del objeto msj
      if (data && typeof data === 'object' && data.msj) {
        const nameFields = ['fun_nombre_completo', 'fun_nombre', 'nombre'];
        const normalize = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          const result = { ...obj };
          for (const field of nameFields) {
            if (typeof result[field] === 'string') {
              result[field] = decodeHtmlEntities(result[field]);
            }
          }
          return result;
        };
        if (Array.isArray(data.msj)) {
          data.msj = data.msj.map(normalize);
        } else if (typeof data.msj === 'object') {
          const normalizedMsj = {};
          for (const [k, v] of Object.entries(data.msj)) {
            normalizedMsj[k] = typeof v === 'object' ? normalize(v) : v;
          }
          data.msj = normalizedMsj;
        }
      }
    } catch {
      data = text;
    }

    return NextResponse.json(data, { status: legacyResponse.status });
  } catch (error) {
    return NextResponse.json({ message: 'No se ha cargado la tabla' }, { status: 500 });
  }
}
