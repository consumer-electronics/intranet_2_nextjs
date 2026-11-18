import { NextResponse } from 'next/server';
import { verificarDisponibilidadSala } from '@/lib/salaJuntasDisponibilidad';

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            inicio,
            fin,
            sala,
        } = body;

        if (!inicio || !fin || !sala) {
            return NextResponse.json(
                {
                    error:
                        'inicio, fin y sala son obligatorios.',
                },
                { status: 400 },
            );
        }

        const resultado = await verificarDisponibilidadSala({ inicio, fin, sala });

        return NextResponse.json({
            cantidad_registros: resultado.cantidad,
            disponible: resultado.disponible,
            conflicto: resultado.conflicto ?? null,
        });
    } catch (error) {
        console.error(
            'POST /api/rrhh/sala-juntas/validar:',
            error,
        );

        return NextResponse.json(
            {
                error:
                    'Error interno validando disponibilidad.',
            },
            { status: 500 },
        );
    }
}
