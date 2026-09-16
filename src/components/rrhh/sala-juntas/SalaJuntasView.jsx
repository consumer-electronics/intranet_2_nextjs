'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';

import dynamic from 'next/dynamic';

import { getCurrentUser } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import useSalaJuntas from '@/hooks/rrhh/useSalaJuntas';

import ReservarSalaDialog from './ReservarSalaDialog';
import DetalleReservacionDialog from './DetalleReservacionDialog';

const SalaJuntasCalendar = dynamic(
    () => import('./SalaJuntasCalendar'),
    {
        ssr: false,
        loading: () => (
            <Box
                sx={{
                    minHeight: 610,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                    Cargando calendario de salas...
                </Typography>
            </Box>
        ),
    },
);

export default function SalaJuntasView() {
    const { user } = useAuth({ redirectOnUnauthenticated: false });

    const {
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
    } = useSalaJuntas();

    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [dialogReservaOpen, setDialogReservaOpen] = useState(false);
    const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
    const [seleccion, setSeleccion] = useState(null);

    const [notificacion, setNotificacion] = useState({
        open: false,
        severity: 'info',
        message: '',
    });

    useEffect(() => {
        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);

        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 1);

        cargarReservaciones({
            start: formatearFechaConsulta(inicio),
            end: formatearFechaConsulta(fin),
        }).catch(() => { });
    }, [cargarReservaciones]);

    const mostrarNotificacion = useCallback((message, severity = 'info') => {
        setNotificacion({
            open: true,
            severity,
            message,
        });
    }, []);

    const cerrarNotificacion = useCallback(() => {
        setNotificacion((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    const handleSeleccion = useCallback(
        async (selection) => {
            try {
                const sala =
                    selection.resource?.id ??
                    selection.resourceId ??
                    selection.resource?.publicId ??
                    null;

                if (!sala) {
                    throw new Error('Debe seleccionar una sala antes de validar disponibilidad.');
                }

                const inicio = new Date(selection.start.getTime() + 60 * 1000);
                const fin = new Date(selection.end.getTime() - 60 * 1000);

                const data = await comprobarDisponibilidad({
                    inicio: formatearFechaBackend(inicio),
                    fin: formatearFechaBackend(fin),
                    sala,
                });

                const cantidad = Number(data?.cantidad_registros ?? data?.cantidad ?? 0);

                if (cantidad === 0) {
                    setSeleccion({
                        sala,
                        fechaInicio: selection.start,
                        fechaFinal: selection.end,
                    });

                    setDialogReservaOpen(true);
                } else {
                    mostrarNotificacion(
                        `La sala ya está reservada entre ${formatearHora(selection.start)} y ${formatearHora(selection.end)}.`,
                        'error',
                    );
                }
            } catch (err) {
                mostrarNotificacion(
                    'Error al validar la disponibilidad de la sala.',
                    'error',
                );
            }
        },
        [comprobarDisponibilidad, mostrarNotificacion],
    );

    const handleEventoClick = useCallback(
        async (evento) => {
            let usuarioActual = user;

            if (!usuarioActual) {
                try {
                    const respuesta = await getCurrentUser();
                    usuarioActual = respuesta?.user ?? null;
                } catch {
                    usuarioActual = null;
                }
            }

            const currentUserId = obtenerUsuarioId(usuarioActual);
            const permiso = await comprobarPermisoEliminar(currentUserId);

            const usuarioEvento =
                evento.extendedProps?.user ??
                evento.extendedProps?.idusu ??
                evento.extendedProps?.usuarioId;

            const idUsuarioActualEvento = evento.extendedProps?.usuarioActual ?? currentUserId;

            const esPropietario =
                idUsuarioActualEvento != null &&
                usuarioEvento != null &&
                String(idUsuarioActualEvento) === String(usuarioEvento);

            setReservaSeleccionada({
                ...evento,
                puedeEliminar: permiso || esPropietario,
            });

            setDialogDetalleOpen(true);
        },
        [comprobarPermisoEliminar, user],
    );

    const handleGuardar = useCallback(
        async (datos) => {
            try {
                let usuarioActual = user;

                if (!usuarioActual) {
                    const respuesta = await getCurrentUser();
                    usuarioActual = respuesta?.user ?? null;
                }

                const idusu = obtenerUsuarioId(usuarioActual);

                if (!idusu) {
                    throw new Error('No se pudo identificar el usuario actual para guardar la reserva.');
                }

                const response = await guardarReservacion({
                    ...datos,
                    idusu,
                });

                const correcto =
                    response === 1 ||
                    response === '1' ||
                    response?.success === true ||
                    response?.resultado === 1;

                if (!correcto) {
                    const mensaje =
                        typeof response === 'string'
                            ? response
                            : response?.mensaje || 'No se pudo guardar la reservación.';

                    throw new Error(mensaje);
                }

                setDialogReservaOpen(false);
                setSeleccion(null);

                mostrarNotificacion('La sala ha sido reservada correctamente.', 'success');
            } catch (err) {
                mostrarNotificacion(
                    err.message || 'Error al guardar la reservación.',
                    'error',
                );
                throw err;
            }
        },
        [guardarReservacion, mostrarNotificacion, user],
    );

    const handleEliminar = useCallback(
        async (evento) => {
            try {
                const response = await borrarReservacion(evento.id);

                const correcto =
                    response === 1 ||
                    response === '1' ||
                    response?.success === true ||
                    response?.resultado === 1;

                if (!correcto) {
                    throw new Error(
                        response?.mensaje || 'Error al eliminar la reservación.',
                    );
                }

                setDialogDetalleOpen(false);
                setReservaSeleccionada(null);

                mostrarNotificacion(
                    'La reservación se ha eliminado correctamente.',
                    'success',
                );
            } catch (err) {
                mostrarNotificacion(
                    err.message || 'No se pudo eliminar la reservación.',
                    'error',
                );
                throw err;
            }
        },
        [borrarReservacion, mostrarNotificacion],
    );

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                p: { xs: 1.5, sm: 3 },
            }}
        >
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.9,
                    }}
                >
                    <MeetingRoomRoundedIcon fontSize="medium" />
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                        Gestión de Salas de Juntas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Selecciona un horario en el calendario para agendar o consultar disponibilidad.
                    </Typography>
                </Box>
            </Box>

            <Card
                elevation={0}
                sx={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 650,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    p: { xs: 1.5, sm: 2.5 },
                    overflow: 'hidden',
                }}
            >
                <Fade in={loading}>
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.75)',
                            backdropFilter: 'blur(2px)',
                        }}
                    >
                        <CircularProgress size={44} />
                    </Box>
                </Fade>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <SalaJuntasCalendar
                    eventos={reservaciones}
                    onSeleccion={handleSeleccion}
                    onEventoClick={handleEventoClick}
                    onDatesSet={(dateInfo) => {
                        cargarReservaciones({
                            start: formatearFechaConsulta(dateInfo.start),
                            end: formatearFechaConsulta(dateInfo.end),
                        }).catch(() => { });
                    }}
                    loading={loading || validando}
                />
            </Card>

            <ReservarSalaDialog
                open={dialogReservaOpen}
                seleccion={seleccion}
                loading={guardando}
                onClose={() => {
                    if (!guardando) {
                        setDialogReservaOpen(false);
                        setSeleccion(null);
                    }
                }}
                onSubmit={handleGuardar}
            />

            <DetalleReservacionDialog
                open={dialogDetalleOpen}
                evento={reservaSeleccionada}
                loading={eliminando}
                onClose={() => {
                    if (!eliminando) {
                        setDialogDetalleOpen(false);
                        setReservaSeleccionada(null);
                    }
                }}
                onDelete={handleEliminar}
            />

            <Snackbar
                open={notificacion.open}
                autoHideDuration={4500}
                onClose={cerrarNotificacion}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    onClose={cerrarNotificacion}
                    severity={notificacion.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
                >
                    {notificacion.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

function formatearFechaBackend(date) {
    const pad = (value) => String(value).padStart(2, '0');

    return (
        [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}

function formatearFechaConsulta(date) {
    const pad = (value) => String(value).padStart(2, '0');
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absolute = Math.abs(offset);
    const hours = pad(Math.floor(absolute / 60));
    const minutes = pad(absolute % 60);

    return (
        [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
            date.getSeconds(),
        )}${sign}${hours}:${minutes}`
    );
}

function formatearHora(date) {
    return new Intl.DateTimeFormat('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function obtenerUsuarioId(usuarioActual) {
    if (!usuarioActual) return null;

    return (
        usuarioActual?.fun_id ??
        usuarioActual?.funId ??
        usuarioActual?.id ??
        usuarioActual?.usuario?.id ??
        usuarioActual?.usuario?.fun_id ??
        usuarioActual?.userId ??
        usuarioActual?.idusuario ??
        usuarioActual?.usuarioId ??
        usuarioActual?.id_Usuario ??
        usuarioActual?.idUsuario ??
        null
    );
}