const BACKEND_BASE_URL = (process.env.URL_DYNAMICS || '').replace(/\/+$/, '');
const LEGACY_SALA_JUNTAS_URL = `${BACKEND_BASE_URL}/pantallas/intranet/paginas/gestion_humana/sala_juntas.php`;

export function parseDateSafe(val) {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === 'string') {
        const str = val.trim();
        const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (match) {
            const year = match[1];
            const month = match[2];
            const day = match[3];
            const hours = match[4];
            const minutes = match[5];
            const seconds = match[6] || '00';
            // Se normaliza con la zona horaria de Colombia (America/Bogota, UTC-5)
            const isoBogota = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-05:00`;
            const d = new Date(isoBogota);
            if (!isNaN(d.getTime())) return d;
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
}

export function formatearFechaBackend(date) {
    const pad = (value) => String(value).padStart(2, '0');

    return (
        [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}

/**
 * Verifica si una sala está disponible en el rango de horario indicado.
 * Consulta las reservaciones activas del backend Dynamics y evalúa cualquier
 * solapamiento de intervalos: (resStart < reqEnd && resEnd > reqStart).
 *
 * @returns {Promise<{ disponible: boolean, cantidad: number, conflicto?: object }>}
 */
export async function verificarDisponibilidadSala({ inicio, fin, sala }) {
    if (!BACKEND_BASE_URL) {
        throw new Error('No está configurada la variable URL_DYNAMICS.');
    }

    const startDate = parseDateSafe(inicio);
    const endDate = parseDateSafe(fin);

    if (!startDate || !endDate) {
        return { disponible: false, cantidad: 1, error: 'Fechas inválidas' };
    }

    const reqStart = startDate.getTime();
    const reqEnd = endDate.getTime();

    if (reqStart >= reqEnd) {
        return { disponible: false, cantidad: 1, error: 'El rango de horario es inválido' };
    }

    const pad = (v) => String(v).padStart(2, '0');
    // Consultar rango amplio alrededor del día solicitado
    const diaAntes = new Date(reqStart - 24 * 60 * 60 * 1000);
    const diaDespues = new Date(reqEnd + 24 * 60 * 60 * 1000);

    const startQuery = `${diaAntes.getFullYear()}-${pad(diaAntes.getMonth() + 1)}-${pad(diaAntes.getDate())}T00:00:00-05:00`;
    const endQuery = `${diaDespues.getFullYear()}-${pad(diaDespues.getMonth() + 1)}-${pad(diaDespues.getDate())}T23:59:59-05:00`;

    // 1. Consultar reservaciones existentes en el backend
    try {
        const paramsReservas = new URLSearchParams({
            accion: 'reservaciones',
            start: startQuery,
            end: endQuery,
        });

        const resReservas = await fetch(
            `${LEGACY_SALA_JUNTAS_URL}?${paramsReservas.toString()}`,
            {
                method: 'GET',
                cache: 'no-store',
            }
        );

        if (resReservas.ok) {
            const text = await resReservas.text();
            let eventos = [];
            try {
                const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
                if (match && match[1]) {
                    eventos = JSON.parse(match[1]);
                }
            } catch {
                eventos = [];
            }

            if (Array.isArray(eventos)) {
                const conflicto = eventos.find((ev) => {
                    const evSala = ev.resourceId ?? ev.sj_sala ?? ev.sala;
                    if (String(evSala) !== String(sala)) return false;

                    const evStart = parseDateSafe(ev.start ?? ev.sj_inicio)?.getTime();
                    const evEnd = parseDateSafe(ev.end ?? ev.sj_fin)?.getTime();

                    if (!evStart || !evEnd) return false;

                    // Traslape estricto: empieza antes del fin solicitado Y termina después del inicio solicitado
                    return evStart < reqEnd && evEnd > reqStart;
                });

                if (conflicto) {
                    return {
                        disponible: false,
                        cantidad: 1,
                        conflicto,
                    };
                }
            }
        }
    } catch (err) {
        console.error('Error consultando reservaciones para validar:', err);
    }

    // 2. Consulta adicional contra el endpoint legacy validar
    try {
        const paramsValidar = new URLSearchParams({
            accion: 'validar',
            inicio: formatearFechaBackend(startDate),
            fin: formatearFechaBackend(endDate),
            sala: String(sala),
        });

        const resValidar = await fetch(
            `${LEGACY_SALA_JUNTAS_URL}?${paramsValidar.toString()}`,
            {
                method: 'GET',
                cache: 'no-store',
            }
        );

        if (resValidar.ok) {
            const dataValidar = await resValidar.json().catch(() => null);
            const cantidad = Number(
                dataValidar?.cantidad_registros ?? dataValidar?.cantidad ?? 0
            );
            if (cantidad > 0) {
                return {
                    disponible: false,
                    cantidad,
                };
            }
        }
    } catch (err) {
        console.error('Error consultando legacy validar:', err);
    }

    return {
        disponible: true,
        cantidad: 0,
    };
}

