// src/services/geovictoria.service.js

const GEOVICTORIA_BASE_URL = 'https://customerapi.geovictoria.com/api/v1';
const BATCH_SIZE = 150; // Límite de Geovictoria: máx 200 usuarios por solicitud
const DELAY_BETWEEN_BATCHES_MS = 400; // Máximo 3 llamadas por segundo

/**
 * Pausa la ejecución por el tiempo indicado en milisegundos.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convierte una fecha YYYY-MM-DD a formato YYYYMMDDHHmmss para Geovictoria.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {'start'|'end'} type - Inicio del día (00:00:00) o fin del día (23:59:59)
 */
function formatToGeovictoriaDate(dateStr, type = 'start') {
    const clean = dateStr.replace(/-/g, '').trim();
    if (type === 'end') {
        return `${clean}235959`;
    }
    return `${clean}000000`;
}

/**
 * Parsea el string de fecha 'yyyyMMddHHmmss' de Geovictoria en:
 * { b_date: 'YYYY-MM-DD', b_time: 'HH:mm:ss' }
 */
export function parseGeovictoriaTimestamp(ts) {
    if (!ts || typeof ts !== 'string' || ts.length < 14) {
        return null;
    }
    const year = ts.slice(0, 4);
    const month = ts.slice(4, 6);
    const day = ts.slice(6, 8);
    const hours = ts.slice(8, 10);
    const minutes = ts.slice(10, 12);
    const seconds = ts.slice(12, 14);

    return {
        b_date: `${year}-${month}-${day}`,
        b_time: `${hours}:${minutes}:${seconds}`,
    };
}

/**
 * Realiza la petición POST a un endpoint de Geovictoria con el token configurado.
 */
async function callGeovictoria(endpoint, body) {
    const token = process.env.GEOVICTORIA_TOKEN;
    if (!token) {
        throw new Error('No se encontró la variable de entorno GEOVICTORIA_TOKEN');
    }

    const response = await fetch(`${GEOVICTORIA_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en API Geovictoria (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
}

/**
 * Sincroniza marcaciones desde Geovictoria para una lista de identificadores (cédulas)
 * dentro de un rango de fechas, insertándolas
 *
 * @param {Object} params
 * @param {string[]} params.identifiers - Arreglo de identificadores/cédulas de los usuarios.
 * @param {string} params.inicio - Fecha inicial 'YYYY-MM-DD'.
 * @param {string} params.final - Fecha final 'YYYY-MM-DD'.
 * @param {string} params.authToken - Token de autenticación para el API Node.
 * @returns {Promise<{ totalUsuarios: number, marcasProcesadas: number, marcasNuevas: number }>}
 */
export async function sincronizarMarcacionesGeovictoria({ identifiers, inicio, final, authToken }) {
    if (!inicio || !final) {
        throw new Error('Debe especificar un rango de fechas válido (inicio y final)');
    }

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    const startDateObj = new Date(`${inicio}T00:00:00`);
    const endDateObj = new Date(`${final}T23:59:59`);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('El formato de las fechas proporcionadas es inválido. Use YYYY-MM-DD');
    }

    if (startDateObj > endDateObj) {
        throw new Error('La fecha inicial no puede ser posterior a la fecha final');
    }

    if (startDateObj > hoy || endDateObj > hoy) {
        throw new Error('Las fechas de sincronización no pueden ser posteriores a la fecha actual');
    }

    const limitDateObj = new Date();
    limitDateObj.setMonth(limitDateObj.getMonth() - 2);
    limitDateObj.setHours(0, 0, 0, 0);

    if (startDateObj < limitDateObj) {
        throw new Error('Geovictoria no permite consultar registros con más de 2 meses de antigüedad respecto a la fecha actual');
    }

    const rawIdentifiers = Array.isArray(identifiers) ? identifiers : [identifiers];
    const finalUserIds = [...new Set(rawIdentifiers
        .map((id) => String(id || '').trim())
        .filter((id) => /^\d{5,15}$/.test(id)))];

    if (finalUserIds.length === 0) {
        return { totalUsuarios: 0, marcasProcesadas: 0, marcasNuevas: 0 };
    }

    const StartDate = formatToGeovictoriaDate(inicio, 'start');
    const EndDate = formatToGeovictoriaDate(final, 'end');

    const batches = [];
    for (let i = 0; i < finalUserIds.length; i += BATCH_SIZE) {
        batches.push(finalUserIds.slice(i, i + BATCH_SIZE));
    }

    const records = [];

    for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const userIdsString = batch.join(',');

        if (b > 0) {
            await sleep(DELAY_BETWEEN_BATCHES_MS);
        }

        const data = await callGeovictoria('AttendanceBook', {
            StartDate,
            EndDate,
            UserIds: userIdsString,
        });

        const users = data?.Users || [];

        for (const user of users) {
            const identifier = String(user?.Identifier || '').trim();
            if (!identifier) continue;

            const intervals = [];
            if (Array.isArray(user.PlannedInterval)) {
                intervals.push(...user.PlannedInterval);
            }
            if (Array.isArray(user.Weeks)) {
                for (const week of user.Weeks) {
                    if (Array.isArray(week.Intervals)) {
                        intervals.push(...week.Intervals);
                    }
                }
            }

            const allPunches = [];
            for (const interval of intervals) {
                if (Array.isArray(interval.Punches)) {
                    allPunches.push(...interval.Punches);
                }
            }
            allPunches.sort((a, b) => String(a.Date || '').localeCompare(String(b.Date || '')));

            for (const punch of allPunches) {
                const parsed = parseGeovictoriaTimestamp(punch.Date);
                if (!parsed) continue;

                const tipoPunch = String(punch.ShiftPunchType || punch.Type || '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase();
                const esSalida = /salida|out|exit|egreso|departure|checkout/.test(tipoPunch);
                records.push({
                    identifier,
                    b_status: esSalida ? 1 : 0,
                    b_date: parsed.b_date,
                    b_time: parsed.b_time,
                });
            }
        }
    }

    const apiNodeUrl = (process.env.API_NODE || '').replace(/\/+$/, '');
    if (!apiNodeUrl) {
        throw new Error('No está configurada la URL del API Node');
    }

    const insertResponse = await fetch(`${apiNodeUrl}/api/biometrico/insert`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ records }),
        cache: 'no-store',
    });

    const insertData = await insertResponse.json().catch(() => ({}));
    if (!insertResponse.ok) {
        throw new Error(insertData?.message || 'No se pudo insertar las marcaciones biométricas');
    }

    return {
        totalUsuarios: finalUserIds.length,
        marcasProcesadas: insertData?.data?.marcasProcesadas ?? records.length,
        marcasNuevas: insertData?.data?.marcasNuevas ?? 0,
    };
}
