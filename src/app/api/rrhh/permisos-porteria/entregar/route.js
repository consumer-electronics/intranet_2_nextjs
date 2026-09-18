import { NextResponse } from 'next/server';

// TODO: mover a variable de entorno.
const DYNAMICS_API_URL = process.env.URL_DYNAMICS;

export async function PATCH(request) {
  try {
    const { id, estado } = await request.json();

    const legacyResponse = await fetch(`${DYNAMICS_API_URL}api/forms/update-register`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado: estado ?? 2 }),
      // mode: 'cors' no aplica en fetch de servidor, se deja el CORS original
      // documentado por si el endpoint legacy lo requiere desde el cliente.
    });

    if (!legacyResponse.ok) {
      return NextResponse.json({ message: 'Error al entregar el carnet' }, { status: legacyResponse.status });
    }

    const data = await legacyResponse.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error al entregar el carnet' }, { status: 500 });
  }
}
