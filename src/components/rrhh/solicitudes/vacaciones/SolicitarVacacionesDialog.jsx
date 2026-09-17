'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const MAX_DIAS = 30;

/**
 * Diálogo "Solicitar Vacaciones".
 *
 * Replica el formulario del archivo legacy
 * `solicitud_permisos_vacas.php` (modal #modal_solicitarPermiso):
 *  - Datos del usuario (Nombre, Cédula, Fecha, Área) de solo lectura.
 *  - Fecha de inicio de vacaciones (mínimo: hoy).
 *  - Días de vacaciones (1 a 30).
 *  - Observaciones (obligatorias, mínimo 10 caracteres).
 *
 * Props:
 *  - open        {boolean}
 *  - onClose     {function}
 *  - usuario     {object}  Usuario autenticado (nombre, cedula/dni, area, rol).
 *  - onSubmit    {function(formData)}  Recibe el FormData listo para enviar.
 *  - submitting  {boolean}
 */
export default function SolicitarVacacionesDialog({
    open,
    onClose,
    usuario = {},
    onSubmit,
    submitting = false,
}) {
    const [fechaInicio, setFechaInicio] = useState(null);
    const [dias, setDias] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [errores, setErrores] = useState({});

    const nombre = usuario?.nombre || usuario?.fun_nombre_completo || '';
    const cedula =
        usuario?.cedula || usuario?.dni || usuario?.fun_cedula || '';
    const area = usuario?.area || usuario?.fun_area || '';
    const rol = usuario?.car_nombre || usuario?.car_tag || '';

    const resetForm = () => {
        setFechaInicio(null);
        setDias('');
        setObservaciones('');
        setErrores({});
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const validar = () => {
        const nuevos = {};

        if (!fechaInicio) {
            nuevos.fechaInicio = 'Seleccione la fecha de inicio.';
        }

        const numDias = Number(dias);
        if (!dias || Number.isNaN(numDias) || numDias < 1) {
            nuevos.dias = 'Indique la cantidad de días.';
        } else if (numDias > MAX_DIAS) {
            nuevos.dias = `El límite de días son ${MAX_DIAS}.`;
        }

        if (!observaciones.trim()) {
            nuevos.observaciones = 'Debe escribir una observación.';
        } else if (observaciones.trim().length < 10) {
            nuevos.observaciones =
                'La observación debe tener al menos 10 caracteres.';
        }

        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleSubmit = () => {
        if (!validar()) return;

        const formData = new FormData();
        formData.set(
            'idUsu',
            String(
                usuario?.fun_id ??
                usuario?.funId ??
                usuario?.id ??
                usuario?.id_usuario ??
                ''
            )
        );
        formData.set('formInicioPermiso', dayjs(fechaInicio).format('YYYY-MM-DD'));
        formData.set('formInicioDias', String(Number(dias)));
        formData.set('observaciones', observaciones.trim());
        if (rol) formData.set('rol', rol);

        onSubmit(formData);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                scroll="body"
            >
                <DialogTitle sx={{ pr: 6 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Solicitar Vacaciones
                    </Typography>
                    <IconButton
                        aria-label="Cerrar"
                        onClick={handleClose}
                        disabled={submitting}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Importante:</strong> Las vacaciones están sujetas a
                            aprobación por parte de su jefe de área. Esta es únicamente una{' '}
                            <strong>solicitud</strong>, no una aprobación automática.
                        </Typography>
                    </Alert>

                    <Grid container spacing={2}>
                        {/* Datos del usuario */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nombre"
                                value={nombre}
                                fullWidth
                                size="small"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Cédula"
                                value={cedula}
                                fullWidth
                                size="small"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Fecha"
                                value={dayjs().format('DD/MM/YYYY HH:mm:ss')}
                                fullWidth
                                size="small"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Área"
                                value={area}
                                fullWidth
                                size="small"
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {/* Fecha de inicio */}
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Fecha de inicio vacaciones"
                                value={fechaInicio}
                                onChange={(value) => {
                                    setFechaInicio(value);
                                    setErrores((prev) => ({
                                        ...prev,
                                        fechaInicio: undefined,
                                    }));
                                }}
                                minDate={dayjs().startOf('day')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        required: true,
                                        error: Boolean(errores.fechaInicio),
                                        helperText: errores.fechaInicio || '',
                                    },
                                }}
                            />
                        </Grid>

                        {/* Días */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Días de vacaciones"
                                type="number"
                                value={dias}
                                onChange={(event) => {
                                    setDias(event.target.value);
                                    setErrores((prev) => ({
                                        ...prev,
                                        dias: undefined,
                                    }));
                                }}
                                fullWidth
                                size="small"
                                required
                                inputProps={{ min: 1, max: MAX_DIAS }}
                                error={Boolean(errores.dias)}
                                helperText={
                                    errores.dias ||
                                    `El límite de días son ${MAX_DIAS}`
                                }
                            />
                        </Grid>

                        {/* Observaciones */}
                        <Grid item xs={12}>
                            <TextField
                                label="Observaciones"
                                value={observaciones}
                                onChange={(event) => {
                                    setObservaciones(event.target.value);
                                    setErrores((prev) => ({
                                        ...prev,
                                        observaciones: undefined,
                                    }));
                                }}
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                required
                                error={Boolean(errores.observaciones)}
                                helperText={errores.observaciones || ''}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={
                            submitting ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                        disabled={submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? 'Enviando…' : 'Enviar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
