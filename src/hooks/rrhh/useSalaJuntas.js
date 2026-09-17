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
     * Crea una nueva reservación.
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
            ...resto
        }) => {
            setGuardando(true);
            setError('');

            try {
                const data = await crearReservacion({
                    sala,
                    fechaInicio,
                    fechaFinal,
                    descripcion,
                    idusu: idusu ?? idUsu ?? userId,
                    ...resto,
                });

                await cargarReservaciones();

                return data;
            } catch (err) {
                console.error('Error creando reservación:', err);
                setError('No se pudo guardar la reservación.');
                throw err;
            } finally {
                setGuardando(false);
            }
        },
        [cargarReservaciones],
    );

    /**
     * Elimina una reservación.
     */
    const borrarReservacion = useCallback(
        async (id) => {
            setEliminando(true);
            setError('');

            try {
                const data = await eliminarReservacion(id);

                await cargarReservaciones();

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