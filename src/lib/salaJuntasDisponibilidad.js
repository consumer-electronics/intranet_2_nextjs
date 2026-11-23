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

function extraerEventos(text) {
    if (!text || typeof text !== 'string') return [];
    const trimmed = text.trim();
    try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        const match = trimmed.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (match && match[1]) {
            try {
                const parsed = JSON.parse(match[1]);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
    }
    return [];
}

/**
 * Verifica si una sala específica está disponible en el rango de horario indicado.
 * Consulta las reservaciones reales del backend Dynamics y evalúa el solapamiento
 * estricto de intervalos: (resStart < reqEnd && resEnd > reqStart) SOLO para la sala consultada.
 *
 * @param {object} params
 * @param {string|Date} params.inicio - Fecha y hora de inicio de la reservación
 * @param {string|Date} params.fin - Fecha y hora de fin de la reservación
 * @param {string|number} params.sala - Identificador de la sala (ej: '1' para Sala 1, '3' para ShowRoom)
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
    // Consultar rango amplio alrededor del día solicitado (1 día antes y 1 día después)
    const diaAntes = new Date(reqStart - 24 * 60 * 60 * 1000);
    const diaDespues = new Date(reqEnd + 24 * 60 * 60 * 1000);

    const startQuery = `${diaAntes.getFullYear()}-${pad(diaAntes.getMonth() + 1)}-${pad(diaAntes.getDate())}T00:00:00-05:00`;
    const endQuery = `${diaDespues.getFullYear()}-${pad(diaDespues.getMonth() + 1)}-${pad(diaDespues.getDate())}T23:59:59-05:00`;

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
            const eventos = extraerEventos(text);

            if (Array.isArray(eventos)) {
                const conflicto = eventos.find((ev) => {
                    const evSala =
                        ev.resourceId ??
                        ev.resource ??
                        ev.sj_sala ??
                        ev.sala ??
                        ev.extendedProps?.resourceId ??
                        ev.extendedProps?.resource ??
                        ev.extendedProps?.sj_sala ??
                        ev.extendedProps?.sala;

                    // Si no coincide la sala, NO es conflicto (separa estrictamente Sala 1 de ShowRoom)
                    if (String(evSala).trim() !== String(sala).trim()) {
                        return false;
                    }

                    const evStart = parseDateSafe(ev.start ?? ev.sj_inicio)?.getTime();
                    const evEnd = parseDateSafe(ev.end ?? ev.sj_fin)?.getTime();

                    if (!evStart || !evEnd) return false;

                    // Traslape estricto: empieza estrictamente antes de que termine la solicitada
                    // Y termina estrictamente después de que empiece la solicitada.
                    // Reuniones contiguas (ej: 09:00-10:00 y 10:00-11:00) NO se traslapan.
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
        console.error('Error consultando reservaciones para validar disponibilidad:', err);
    }

    return {
        disponible: true,
        cantidad: 0,
    };
}
