'use client';

import { useCallback, useState } from 'react';
import {
    crearReservacion,
    eliminarReservacion,
    getReservaciones,
    validarDisponibilidad,
    verificarPermisoEliminar,
} from '@/api/rrhh/salaJuntas';

export default function useSalaJuntas() {
    const [reservaciones, setReservaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validando, setValidando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const [error, setError] = useState('');

    /**
     * Obtiene todas las reservaciones.
     */
    const cargarReservaciones = useCallback(async ({ start, end, idUsu } = {}) => {
        setLoading(true);
        setError('');

        try {
            const data = await getReservaciones({ start, end, idUsu });

            const eventos = Array.isArray(data)
                ? data
                : Array.isArray(data?.eventos)
                    ? data.eventos
                    : [];

            setReservaciones(eventos);

            return eventos;
        } catch (err) {
            console.error('Error cargando reservaciones:', err);
            setError('No se pudieron cargar las reservaciones.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Valida si existe una reservación en el rango seleccionado.
     */
    const comprobarDisponibilidad = useCallback(
        async ({ inicio, fin, sala }) => {
            setValidando(true);
            setError('');

            try {
                const data = await validarDisponibilidad({
                    inicio,
                    fin,
                    sala,
                });

                return data;
            } catch (err) {
                console.error('Error validando disponibilidad:', err);
                setError('No se pudo validar la disponibilidad.');
                throw err;
            } finally {
                setValidando(false);
            }
        },
        [],
    );

    /**
     * Crea una nueva reservación previa validación de disponibilidad.
     * @param {object} rango - Rango activo del calendario { start, end } para recargar.
     */
    const guardarReservacion = useCallback(
        async ({
            sala,
            fechaInicio,
            fechaFinal,
            descripcion,
            idusu,
            idUsu,
            userId,
            _rango,
            ...resto
        }) => {
            setGuardando(true);
            setError('');

            try {
                // 1. Validar disponibilidad antes de crear para evitar colisiones
                const startDate = parsearFecha(fechaInicio);
                const endDate = parsearFecha(fechaFinal);

                const disp = await validarDisponibilidad({
                    inicio: formatearFechaBackend(startDate),
                    fin: formatearFechaBackend(endDate),
                    sala,
                });

                const cantidad = Number(
                    disp?.cantidad_registros ?? disp?.cantidad ?? 0,
                );

                if (cantidad > 0 || disp?.disponible === false) {
                    await cargarReservaciones(_rango ?? undefined);
                    const errorDisp = new Error(
                        'La sala ya no se encuentra disponible en el horario seleccionado.',
                    );
                    errorDisp.codigo = 'SALA_NO_DISPONIBLE';
                    throw errorDisp;
                }

                // 2. Si está disponible, proceder a crear la reservación
                const data = await crearReservacion({
                    sala,
                    fechaInicio,
                    fechaFinal,
                    descripcion,
                    idusu: idusu ?? idUsu ?? userId,
                    ...resto,
                });

                await cargarReservaciones(_rango ?? undefined);

                return data;
            } catch (err) {
                console.error('Error creando reservación:', err);
                const mensaje =
                    err?.payload?.message ||
                    err?.payload?.error ||
                    err.message ||
                    'No se pudo guardar la reservación.';
                setError(mensaje);
                await cargarReservaciones(_rango ?? undefined).catch(() => {});
                const errorFinal = new Error(mensaje);
                if (err?.status === 409 || err?.codigo === 'SALA_NO_DISPONIBLE') {
                    errorFinal.codigo = 'SALA_NO_DISPONIBLE';
                }
                throw errorFinal;
            } finally {
                setGuardando(false);
            }
        },
        [cargarReservaciones],
    );

    /**
     * Elimina una reservación y recarga el rango activo del calendario.
     * @param {string|number} id - ID de la reservación a eliminar.
     * @param {object} [rango] - Rango activo { start, end } para recargar la vista correcta.
     */
    const borrarReservacion = useCallback(
        async (id, rango) => {
            setEliminando(true);
            setError('');

            try {
                const data = await eliminarReservacion(id);

                // Recargar con el rango que el usuario tenía visible, no el rango inicial
                await cargarReservaciones(rango ?? undefined);

                return data;
            } catch (err) {
                console.error('Error eliminando reservación:', err);
                setError('No se pudo eliminar la reservación.');
                throw err;
            } finally {
                setEliminando(false);
            }
        },
        [cargarReservaciones],
    );

    /**
     * Consulta si el usuario tiene permiso para eliminar
     * reservaciones de otros usuarios.
     */
    const comprobarPermisoEliminar = useCallback(async (funId) => {
        try {
            const data = await verificarPermisoEliminar(funId);

            if (typeof data === 'boolean') {
                return data;
            }

            if (Array.isArray(data)) {
                return data.length === 1;
            }

            if (typeof data?.permitido === 'boolean') {
                return data.permitido;
            }

            if (typeof data?.tienePermiso === 'boolean') {
                return data.tienePermiso;
            }

            return false;
        } catch (err) {
            console.error('Error verificando permiso:', err);
            return false;
        }
    }, []);

    return {
        reservaciones,
        loading,
        validando,
        guardando,
        eliminando,
        error,

        cargarReservaciones,
        comprobarDisponibilidad,
        guardarReservacion,
        borrarReservacion,
        comprobarPermisoEliminar,
    };
}

function parsearFecha(valor) {
    if (!valor) return new Date();
    if (valor instanceof Date) return valor;
    if (typeof valor === 'string') {
        const str = valor.trim();
        const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (match) {
            return new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3]),
                Number(match[4]),
                Number(match[5]),
                Number(match[6] || 0),
            );
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;
    }
    return new Date(valor);
}

function formatearFechaBackend(date) {
    const pad = (value) => String(value).padStart(2, '0');

    return (
        [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}
