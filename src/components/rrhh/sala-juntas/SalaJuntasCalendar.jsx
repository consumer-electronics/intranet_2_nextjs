'use client';

import { useEffect, useMemo, useRef } from 'react';

import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

const SALAS = [
    {
        id: '1',
        title: 'Sala 1',
    },
    {
        id: '3',
        title: 'ShowRoom',
    },
];

export default function SalaJuntasCalendar({
    eventos = [],
    onSeleccion,
    onEventoClick,
    onDatesSet,
    loading = false,
}) {
    const theme = useTheme();
    const resources = useMemo(() => SALAS, []);
    const calendarRef = useRef(null);
    const containerRef = useRef(null);

    // Cuando el sidebar se abre/cierra el contenedor cambia de ancho.
    // FullCalendar no lo detecta solo, hay que llamar updateSize() manualmente.
    useEffect(() => {
        if (!containerRef.current) return undefined;

        const observer = new ResizeObserver(() => {
            const api = calendarRef.current?.getApi();
            if (api) api.updateSize();
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const calendarEvents = useMemo(() => {
        return eventos.map((evento) => normalizarEvento(evento));
    }, [eventos]);

    return (
        <Box
            ref={containerRef}
            sx={{
                width: '100%',
                position: 'relative',

                '& .fc': {
                    fontFamily: theme.typography.fontFamily,
                    '--fc-border-color': theme.palette.divider,
                    '--fc-today-bg-color': theme.palette.action.hover,
                },

                '& .fc-toolbar-title': {
                    fontSize: {
                        xs: '1.1rem',
                        sm: '1.35rem',
                    },
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    textTransform: 'capitalize',
                },

                '& .fc-button': {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: `${theme.shape.borderRadius}px`,
                    padding: '6px 14px',
                    boxShadow: 'none !important',
                    backgroundColor: theme.palette.action.selected,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                },

                '& .fc-button-primary:not(:disabled).fc-button-active, & .fc-button-primary:not(:disabled):active': {
                    backgroundColor: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                },

                '& .fc-col-header-cell': {
                    backgroundColor: theme.palette.background.default,
                    py: 1,
                },

                '& .fc-col-header-cell-cushion': {
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                },

                '& .fc-resource-cell': {
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                },

                '& .fc-event': {
                    cursor: 'pointer',
                    border: 'none',
                    borderRadius: `${theme.shape.borderRadius}px`,
                    boxShadow: theme.shadows[1],
                    backgroundColor: theme.palette.primary.main,
                    padding: '2px 4px',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    '&:hover': {
                        transform: 'scale(1.01)',
                        boxShadow: theme.shadows[3],
                    },
                },

                '& .fc-timegrid-slot': {
                    height: '3rem',
                },

                '& .fc-timegrid-now-indicator-line': {
                    borderColor: theme.palette.error.main,
                },

                '& .fc-timegrid-now-indicator-arrow': {
                    borderColor: theme.palette.error.main,
                    backgroundColor: theme.palette.error.main,
                },
            }}
        >
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: theme.palette.background.paper,
                        padding: '4px 12px',
                        borderRadius: 2,
                        boxShadow: theme.shadows[2],
                    }}
                >
                    <CircularProgress size={16} color="primary" />
                </Box>
            )}

            <FullCalendar
                ref={calendarRef}
                plugins={[interactionPlugin, resourceTimeGridPlugin]}
                schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                locale="es"
                buttonText={{
                    today: 'Hoy',
                    day: 'Día',
                    week: 'Semana',
                }}
                allDayText="Todo el día"
                timeZone="local"
                initialView="resourceTimeGridDay"
                height={610}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'resourceTimeGridWeek,resourceTimeGridDay',
                }}
                allDaySlot={false}
                datesAboveResources
                navLinks
                selectable
                selectMirror
                selectOverlap={false}
                weekNumbers
                editable={false}
                eventDurationEditable={false}
                eventStartEditable={false}
                eventTextColor="#ffffff"
                resourceAreaHeaderContent="Salas Disponibles"
                resourceAreaWidth="130px"
                slotMinTime="07:00:00"
                slotMaxTime="18:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                nowIndicator
                resources={resources}
                events={calendarEvents}
                select={onSeleccion}
                datesSet={onDatesSet}
                eventClick={(info) => {
                    const evento = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start,
                        end: info.event.end,
                        resourceId:
                            info.event.getResources()[0]?.id ??
                            info.event.extendedProps?.resourceId,
                        extendedProps: info.event.extendedProps,
                    };

                    onEventoClick(evento);
                }}
            />
        </Box>
    );
}

function normalizarEvento(evento) {
    const extendedProps = {
        ...(evento.extendedProps || {}),
    };

    if (evento.description && !extendedProps.description) {
        extendedProps.description = evento.description;
    }

    if (evento.usuario && !extendedProps.usuario) {
        extendedProps.usuario = evento.usuario;
    }

    if (evento.user != null && extendedProps.user == null) {
        extendedProps.user = evento.user;
    }

    return {
        ...evento,
        resourceId:
            evento.resourceId ??
            evento.resource ??
            evento.sala ??
            extendedProps.resourceId ??
            extendedProps.sala,
        title: evento.title ?? evento.usuario ?? 'Reservación',
        start: evento.start,
        end: evento.end,
        extendedProps,
    };
}