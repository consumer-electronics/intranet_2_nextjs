'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import SaveIcon from '@mui/icons-material/Save';

export default function ReservarSalaDialog({
    open,
    seleccion,
    loading = false,
    onClose,
    onSubmit,
}) {
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setDescripcion('');
            setError('');
        }
    }, [open]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!seleccion?.sala) {
            setError('No se ha seleccionado una sala.');
            return;
        }

        if (!seleccion?.fechaInicio || !seleccion?.fechaFinal) {
            setError('El rango de horario es obligatorio.');
            return;
        }

        if (!descripcion.trim()) {
            setError('La descripción es obligatoria.');
            return;
        }

        setError('');

        await onSubmit({
            sala: seleccion.sala,
            fechaInicio: formatearFecha(seleccion.fechaInicio),
            fechaFinal: formatearFecha(seleccion.fechaFinal),
            descripcion: descripcion.trim(),
        });
    };

    const salaNombre = obtenerNombreSala(seleccion?.sala);

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (!loading) {
                    onClose();
                }
            }}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: 24,
                },
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                display: 'flex',
                            }}
                        >
                            <EventSeatIcon />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>
                            Reservar Sala
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        disabled={loading}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                SALA SELECCIONADA
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mt: 0.5 }}>
                                {salaNombre}
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Fecha inicio"
                                value={
                                    seleccion?.fechaInicio
                                        ? formatearFechaVisible(seleccion.fechaInicio)
                                        : ''
                                }
                                fullWidth
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        startAdornment: (
                                            <CalendarMonthIcon
                                                fontSize="small"
                                                sx={{ color: 'text.secondary', mr: 1 }}
                                            />
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                label="Fecha final"
                                value={
                                    seleccion?.fechaFinal
                                        ? formatearFechaVisible(seleccion.fechaFinal)
                                        : ''
                                }
                                fullWidth
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        startAdornment: (
                                            <AccessTimeIcon
                                                fontSize="small"
                                                sx={{ color: 'text.secondary', mr: 1 }}
                                            />
                                        ),
                                    },
                                }}
                            />
                        </Stack>

                        <TextField
                            label="Descripción o Motivo"
                            value={descripcion}
                            onChange={(event) => {
                                setDescripcion(event.target.value);
                                if (error) setError('');
                            }}
                            multiline
                            minRows={3}
                            maxRows={6}
                            fullWidth
                            required
                            error={Boolean(error)}
                            helperText={error}
                            disabled={loading}
                            placeholder="Indica el tema o reunión a tratar..."
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        color="inherit"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={<SaveIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3,
                        }}
                    >
                        {loading ? 'Guardando...' : 'Confirmar Reserva'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

function obtenerNombreSala(id) {
    const salas = {
        '1': 'Sala 1',
        '3': 'ShowRoom',
    };

    return salas[String(id)] || `Sala ${id ?? ''}`;
}

function formatearFecha(date) {
    const pad = (value) => String(value).padStart(2, '0');

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())} ` +
        `${pad(date.getHours())}:` +
        `${pad(date.getMinutes())}:` +
        `${pad(date.getSeconds())}`
    );
}

function formatearFechaVisible(date) {
    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}