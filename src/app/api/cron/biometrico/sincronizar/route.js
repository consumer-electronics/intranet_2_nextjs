import { NextResponse } from 'next/server';
import { sincronizarMarcacionesGeovictoria } from '@/services/geovictoria.service';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

function formatBogotaDate(date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

function base64Url(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function createBiometricServiceToken() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Falta JWT_SECRET en la intranet');
    }

    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64Url(JSON.stringify({
        id: 1,
        cronBiometrico: true,
        iat: now,
        exp: now + 600,
    }));

    const unsigned = `${header}.${payload}`;
    const signature = createHmac('sha256', secret)
        .update(unsigned)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${unsigned}.${signature}`;
}

async function getActiveIdentifiers(authToken) {
    const apiNodeUrl = (process.env.API_NODE || '').replace(/\/+$/, '');
    if (!apiNodeUrl) {
        throw new Error('Falta API_NODE en la intranet');
    }

    const response = await fetch(`${apiNodeUrl}/api/biometrico/active-identifiers`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: '{}',
        cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || 'No se pudieron obtener las identificaciones activas');
    }

    return data?.data?.identifiers || [];
}

export async function POST(request) {
    try {
        const secret = request.headers.get('x-cron-secret');
        if (!process.env.CRON_BIOMETRIC_SECRET || secret !== process.env.CRON_BIOMETRIC_SECRET) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));

        const requestedStart = typeof body.inicio === 'string' ? body.inicio.trim() : '';
        const requestedFinal = typeof body.final === 'string' ? body.final.trim() : '';

        let finalDate;
        let startDate;

        if (requestedStart && requestedFinal) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedStart) || !/^\d{4}-\d{2}-\d{2}$/.test(requestedFinal)) {
                return NextResponse.json({ message: 'Las fechas deben tener formato YYYY-MM-DD' }, { status: 400 });
            }
            if (requestedStart > requestedFinal) {
                return NextResponse.json({ message: 'La fecha inicial no puede ser posterior a la fecha final' }, { status: 400 });
            }
            finalDate = requestedFinal;
            startDate = requestedStart;
        } else {
            const lookbackDays = Number.isFinite(Number(body.lookbackDays))
                ? Math.max(1, Math.min(60, Number(body.lookbackDays)))
                : 1;

            finalDate = formatBogotaDate(new Date());
            startDate = formatBogotaDate(new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000));
        }

        const authToken = createBiometricServiceToken();
        const activeIdentifiers = await getActiveIdentifiers(authToken);

        if (activeIdentifiers.length === 0) {
            return NextResponse.json(
                { message: 'No se encontraron identificaciones biométricas activas' },
                { status: 404 }
            );
        }

        const resultado = await sincronizarMarcacionesGeovictoria({
            identifiers: activeIdentifiers,
            inicio: startDate,
            final: finalDate,
            authToken,
        });

        return NextResponse.json({
            data: {
                ok: true,
                inicio: startDate,
                final: finalDate,
                totalUsuarios: resultado.totalUsuarios,
                marcasProcesadas: resultado.marcasProcesadas,
                marcasNuevas: resultado.marcasNuevas,
            },
        });
    } catch (error) {
        console.error('[POST /api/cron/biometrico/sincronizar]', error);
        return NextResponse.json(
            { message: error?.message || 'No se pudo ejecutar la sincronización nocturna' },
            { status: 500 }
        );
    }
}
