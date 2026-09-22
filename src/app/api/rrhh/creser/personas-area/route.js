import { NextResponse } from 'next/server';

const LEGACY_BASE_URL = process.env.URL_DYNAMICS;
const LEGACY_ENDPOINT = `${(LEGACY_BASE_URL || '').replace(/\/+$/, '')}/pantallas/intranet/ajax/usuarios.php`;

/**
 * Personas de un área específica con su estado CRESER.
 *
 * Equivale a la llamada legacy:
 *   POST ajax/usuarios.php
 *     accion  = PersonasAreas
 *     idDep   = <dep_id>
 *     periodo = <id_periodo>
 *
 * Devuelve JSON array con { fun_id, fun_nombre_completo, competencia_creser, cantidad_intentos, ... }
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idDep = body.idDep ?? body.dep_id ?? '';
        const periodo = body.periodo ?? '';

        const formData = new URLSearchParams();
        formData.set('accion', 'PersonasAreas');
        formData.set('idDep', String(idDep));
        formData.set('periodo', String(periodo));

        const legacyResponse = await fetch(LEGACY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: formData,
            cache: 'no-store',
        });

        if (!legacyResponse.ok) {
            throw new Error(`Error legacy: ${legacyResponse.status}`);
        }

        const text = await legacyResponse.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { cantidad_registros: 0 };
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { cantidad_registros: 0, message: 'No se ha podido traer la lista de personas' },
            { status: 500 }
        );
    }
}
