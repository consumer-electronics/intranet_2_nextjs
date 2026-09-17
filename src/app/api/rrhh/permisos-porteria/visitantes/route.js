import { NextResponse } from 'next/server';

const DYNAMICS_API_URL = process.env.RUTA_API_2;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicial = searchParams.get('fechaInicial');
    const fechaFinal = searchParams.get('fechaFinal');

    const query = new URLSearchParams();
    if (fechaInicial) query.set('fechaInicial', fechaInicial);
    if (fechaFinal) query.set('fechaFinal', fechaFinal);
    const qs = query.toString();

    const legacyResponse = await fetch(`${DYNAMICS_API_URL.replace(/\/+$/, '')}/api/forms/list-active${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
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
    return NextResponse.json({ message: 'No se ha podido cargar la tabla de visitantes' }, { status: 500 });
  }
}
