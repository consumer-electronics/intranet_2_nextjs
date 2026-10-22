import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

/**
 * Calcula el último día del mes anterior a las 05:00:00.000Z.
 * Si hoy es octubre de 2026, retorna "2026-09-30T05:00:00.000Z".
 */
function getFechaCorteMesAnterior() {
    const now = new Date();
    const lastDayPrevMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0, 5, 0, 0));
    const yyyy = lastDayPrevMonth.getUTCFullYear();
    const mm = String(lastDayPrevMonth.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(lastDayPrevMonth.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T05:00:00.000Z`;
}

/**
 * Consulta el servicio consolidado de vacaciones de Yéminus.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let contrato = searchParams.get('contrato') || '';
        let funId = searchParams.get('funId') || searchParams.get('id') || '';
        let fechaCorte = searchParams.get('fechaCorte') || '';

        if (!fechaCorte) {
            fechaCorte = getFechaCorteMesAnterior();
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        // Si no se proporcionó contrato, resolverlo desde la sesión del usuario actual
        if (!contrato) {
            try {
                const apiNodeBase = (process.env.API_NODE || 'https://dynamics.appceg.com:3010').replace(/\/+$/, '');
                const meRes = await fetch(`${apiNodeBase}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                    },
                    cache: 'no-store',
                });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    const user = meData?.user || meData?.data?.user;
                    funId = funId || (user?.fun_id ?? user?.funId ?? user?.id ?? '');
                    contrato = user?.useryem ?? user?.fun_empleado_geminus ?? user?.id_geminus ?? '';
                }
            } catch (err) {
                console.error('[Consolidado Vacaciones] Error obteniendo usuario actual:', err);
            }
        }

        let consolidadoData = null;

        // 1. Si tenemos contrato, consultar al gateway de Yéminus directamente
        if (contrato) {
            try {
                consolidadoData = await consultarYeminusDirecto(contrato, fechaCorte);
            } catch (yemErr) {
                console.warn('[Consolidado Vacaciones] Gateway directo Yéminus reportó:', yemErr?.message);
            }
        }

        // 2. Si no se pudo obtener directo o se necesita resolver por funId en backend
        if (!consolidadoData) {
            const apiNodeBase = (process.env.API_NODE || 'https://dynamics.appceg.com:3010').replace(/\/+$/, '');
            const queryParams = new URLSearchParams();
            if (contrato) queryParams.set('contrato', String(contrato));
            if (funId) queryParams.set('funId', String(funId));
            if (fechaCorte) queryParams.set('fechaCorte', fechaCorte);

            try {
                const nodeResponse = await fetch(`${apiNodeBase}/api/users/vacations-consolidado?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                    cache: 'no-store',
                });

                if (nodeResponse.ok) {
                    const json = await nodeResponse.json();
                    // Validar estrictamente que sea respuesta con datos de vacaciones y no el fallback de usuarios
                    if (json?.data && !Array.isArray(json.data) && json.data?.diasHabilesXDisfrutar !== undefined) {
                        consolidadoData = json.data;
                    } else if (Array.isArray(json?.data) && json.data.length > 0 && json.data[0]?.diasHabilesXDisfrutar !== undefined) {
                        consolidadoData = json.data[0];
                    } else if (Array.isArray(json?.datos) && json.datos.length > 0 && json.datos[0]?.diasHabilesXDisfrutar !== undefined) {
                        consolidadoData = json.datos[0];
                    }
                }
            } catch (nodeErr) {
                console.warn('[Consolidado Vacaciones] API_NODE error:', nodeErr?.message);
            }
        }

        if (consolidadoData) {
            return NextResponse.json({
                statusCode: 200,
                message: 'success',
                contrato: Number(consolidadoData.contrato || contrato),
                fechaCorte,
                data: consolidadoData,
            });
        }

        return NextResponse.json({
            statusCode: 404,
            message: 'No se encontraron datos de consolidado de vacaciones en Yéminus para el contrato especificado',
            contrato: contrato ? Number(contrato) : null,
            fechaCorte,
            data: null,
        }, { status: 404 });
    } catch (error) {
        console.error('[Consolidado Vacaciones] Error general:', error);
        return NextResponse.json(
            { message: error?.message || 'Error interno del servidor', data: null },
            { status: 500 }
        );
    }
}

/**
 * Consulta directa al gateway de Yéminus con el payload oficial.
 */
async function consultarYeminusDirecto(contrato, fechaCorte) {
    const loginRes = await fetch('http://192.168.1.211/gateway/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'api', password: '123' }),
        cache: 'no-store',
    });

    if (!loginRes.ok) return null;
    const loginData = await loginRes.json();
    const token = loginData?.accessToken;
    if (!token) return null;

    const payload = {
        filtroCesantias: {
            fechaCorte,
            contrato: Number(contrato),
        },
        filtroEmpleado: {
            activo: null,
            inactivo: null,
            contrato: null,
            tipoIdentificacionTributaria: null,
            idCargo: null,
            idCargoJefe: null,
            idTipoNomina: null,
            tipoDeContrato: null,
            seccion: null,
            idCentroDeCosto: null,
            idCentroOperaciones: null,
            tipoPago: null,
            banco: null,
            grupoEmpleado: null,
            tipoSalario: null,
            fechaIngresoIni: null,
            fechaIngresoFin: null,
            fechaRetiroIni: null,
            fechaRetiroFin: null,
            fechaPeriodoDePruebaInicial: null,
            fechaPeriodoDePruebaFinal: null,
            fechaVencimientoContratoInicial: null,
            fechaVencimientoContratoFinal: null,
            fechaEvaluacionInicial: null,
            fechaEvaluacionFinal: null,
            fechaUltimoDiaInicial: null,
            fechaUltimoDiaFinal: null,
            fechaUltimoAumentoInicial: null,
            fechaUltimoAumentoFinal: null,
            edadInicial: null,
            edadFinal: null,
            MesNacimiento: null,
            idCiudad: null,
            estadoCivil: null,
            sexo: null,
            grupoSanguineo: null,
            cajaCompensacion: null,
            fondoCensantias: null,
            fondoPensiones: null,
            eps: null,
            arlAsignado: null,
            tipoCotizante: null,
            subtipoCotizante: null,
            PagaCesantias: null,
            PagaVacaciones: null,
            PagaPrima: null,
            PagaAuxilioTransporte: null,
            filtrar: null,
            busquedaRapida: null,
            aplicarFiltroParaLiquidarContrato: false,
        },
    };

    const res = await fetch('http://192.168.1.211/gateway/apiyeminus/api/nomina/obtenerConsolidadoVacaciones', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            id_empresa: '01',
            usuario: 'api',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.datos) && json.datos.length > 0 ? json.datos[0] : null;
}
