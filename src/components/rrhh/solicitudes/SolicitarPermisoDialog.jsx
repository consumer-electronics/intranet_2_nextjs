'use client';

import { useMemo, useState } from 'react';
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
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

/**
 * Motivos de permiso (valores del backend legacy).
 */
const MOTIVOS = [
    { value: '1', label: 'Médica' },
    { value: '2', label: 'Urgencia Médica' },
    { value: '3', label: 'Laboral' },
    { value: '4', label: 'Personal' },
];

/**
 * Opciones de reposición según el motivo.
 * - Personal (4): Reposición en tiempo / No remunerado
 * - Laboral (3): Laboral / Medio día cumpleaños / Licencia por matrimonio / Día descanso remunerado por antigüedad
 */
const REPOSICION_POR_MOTIVO = {
    4: [
        { value: '1', label: 'Reposición en tiempo' },
        { value: '2', label: 'No remunerado' },
    ],
    3: [
        { value: '3', label: 'Laboral' },
        { value: '4', label: 'Medio día cumpleaños' },
        { value: '5', label: 'Licencia por matrimonio' },
        { value: '6', label: 'Día descanso remunerado por antigüedad' },
    ],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

function formatFechaBackend(date) {
    return dayjs(date).format('DD/MM/YYYY');
}

function formatHoraBackend(date) {
    return dayjs(date).format('hh:mm A');
}

/**
 * Diálogo "Solicitar Permiso".
 *
 * Props:
 *  - open        {boolean}
 *  - onClose     {function}
 *  - usuario     {object}  Usuario autenticado (nombre, cedula/dni, area).
 *  - onSubmit    {function(formData)}  Recibe el FormData listo para enviar.
 *  - submitting  {boolean}
 */
export default function SolicitarPermisoDialog({
    open,
    onClose,
    usuario = {},
    onSubmit,
    submitting = false,
}) {
    const [motivo, setMotivo] = useState('');
    const [reposicion, setReposicion] = useState('');
    const [fechaInicio, setFechaInicio] = useState(null);
    const [horaInicio, setHoraInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [horaFin, setHoraFin] = useState(null);
    const [observaciones, setObservaciones] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [errores, setErrores] = useState({});

    const nombre = usuario?.nombre || '';
    const cedula =
        usuario?.cedula || usuario?.dni || usuario?.fun_cedula || '';
    const area = usuario?.area || usuario?.fun_area || '';

    const reposicionOpciones = useMemo(
        () => REPOSICION_POR_MOTIVO[motivo] || [],
        [motivo]
    );

    const resetForm = () => {
        setMotivo('');
        setReposicion('');
        setFechaInicio(null);
        setHoraInicio(null);
        setFechaFin(null);
        setHoraFin(null);
        setObservaciones('');
        setArchivo(null);
        setErrores({});
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const handleMotivoChange = (event) => {
        const value = event.target.value;
        setMotivo(value);
        setReposicion('');
        setErrores((prev) => ({ ...prev, motivo: undefined, reposicion: undefined }));
    };

    const handleArchivoChange = (event) => {
        const file = event.target.files?.[0] || null;
        setArchivo(file);
        setErrores((prev) => ({ ...prev, archivo: undefined }));
    };

    const validar = () => {
        const nuevos = {};

        if (!motivo) nuevos.motivo = 'Seleccione un motivo.';

        if ((motivo === '3' || motivo === '4') && !reposicion) {
            nuevos.reposicion = 'Seleccione una opción.';
        }

        if (!fechaInicio) nuevos.fechaInicio = 'Seleccione fecha de inicio.';
        if (!horaInicio) nuevos.horaInicio = 'Seleccione hora de inicio.';
        if (!fechaFin) nuevos.fechaFin = 'Seleccione fecha final.';
        if (!horaFin) nuevos.horaFin = 'Seleccione hora final.';

        if (fechaInicio && horaInicio && fechaFin && horaFin) {
            const inicio = dayjs(fechaInicio)
                .hour(dayjs(horaInicio).hour())
                .minute(dayjs(horaInicio).minute());
            const fin = dayjs(fechaFin)
                .hour(dayjs(horaFin).hour())
                .minute(dayjs(horaFin).minute());
            if (!fin.isAfter(inicio)) {
                nuevos.horaFin = 'La hora final debe ser mayor a la inicial.';
            }
        }

        if (!observaciones.trim()) {
            nuevos.observaciones = 'Debe escribir una observación.';
        } else if (observaciones.trim().length < 10) {
            nuevos.observaciones =
                'La observación debe tener al menos 10 caracteres.';
        }

        if (archivo) {
            if (archivo.size > MAX_FILE_SIZE) {
                nuevos.archivo = 'El tamaño máximo del archivo debe ser 5MB.';
            } else {
                const ext = archivo.name.split('.').pop()?.toLowerCase();
                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                    nuevos.archivo = 'Tipo de archivo no permitido.';
                }
            }
        }

        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleSubmit = () => {
        if (!validar()) return;

        const formData = new FormData();
        formData.set('idUsu', String(usuario?.fun_id ?? usuario?.funId ?? usuario?.id ?? ''));
        formData.set('motivo_permiso', motivo);
        if (reposicion) formData.set('reposicion', reposicion);
        formData.set('formInicioPermiso', formatFechaBackend(fechaInicio));
        formData.set('formInicioHora', formatHoraBackend(horaInicio));
        formData.set('formFinalPermiso', formatFechaBackend(fechaFin));
        formData.set('formFinHora', formatHoraBackend(horaFin));
        formData.set('observaciones', observaciones.trim());
        formData.set('fecha', dayjs().format('DD/MM/YYYY HH:mm:ss'));
        if (nombre) formData.set('nombre', nombre);
        if (cedula) formData.set('cedula', cedula);
        if (area) formData.set('area', area);
        if (archivo) formData.set('docPermission', archivo);

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
                        Solicitar Permiso
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

                        {/* Motivo */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Motivo del permiso <Box component="span" color="error.main">*</Box>
                            </Typography>
                            <RadioGroup
                                row
                                value={motivo}
                                onChange={handleMotivoChange}
                            >
                                {MOTIVOS.map((m) => (
                                    <FormControlLabel
                                        key={m.value}
                                        value={m.value}
                                        control={<Radio size="small" />}
                                        label={m.label}
                                    />
                                ))}
                            </RadioGroup>
                            {errores.motivo && (
                                <FormHelperText error>{errores.motivo}</FormHelperText>
                            )}
                        </Grid>

                        {/* Reposición (solo motivo 3 o 4) */}
                        {reposicionOpciones.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Reposición <Box component="span" color="error.main">*</Box>
                                </Typography>
                                <RadioGroup
                                    row
                                    value={reposicion}
                                    onChange={(e) => {
                                        setReposicion(e.target.value);
                                        setErrores((prev) => ({ ...prev, reposicion: undefined }));
                                    }}
                                >
                                    {reposicionOpciones.map((op) => (
                                        <FormControlLabel
                                            key={op.value}
                                            value={op.value}
                                            control={<Radio size="small" />}
                                            label={op.label}
                                        />
                                    ))}
                                </RadioGroup>
                                {errores.reposicion && (
                                    <FormHelperText error>{errores.reposicion}</FormHelperText>
                                )}
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {/* Fechas y horas */}
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Fecha inicio permiso *"
                                value={fechaInicio}
                                onChange={(v) => {
                                    setFechaInicio(v);
                                    setErrores((prev) => ({ ...prev, fechaInicio: undefined }));
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: Boolean(errores.fechaInicio),
                                        helperText: errores.fechaInicio || '',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TimePicker
                                label="Hora de salida *"
                                value={horaInicio}
                                onChange={(v) => {
                                    setHoraInicio(v);
                                    setErrores((prev) => ({ ...prev, horaInicio: undefined }));
                                }}
                                ampm
                                format="hh:mm A"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: Boolean(errores.horaInicio),
                                        helperText: errores.horaInicio || '',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Fecha fin permiso *"
                                value={fechaFin}
                                onChange={(v) => {
                                    setFechaFin(v);
                                    setErrores((prev) => ({ ...prev, fechaFin: undefined }));
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: Boolean(errores.fechaFin),
                                        helperText: errores.fechaFin || '',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TimePicker
                                label="Hora fin permiso *"
                                value={horaFin}
                                onChange={(v) => {
                                    setHoraFin(v);
                                    setErrores((prev) => ({ ...prev, horaFin: undefined }));
                                }}
                                ampm
                                format="hh:mm A"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: Boolean(errores.horaFin),
                                        helperText: errores.horaFin || '',
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {/* Archivo */}
                        <Grid item xs={12}>
                            <TextField
                                type="file"
                                inputProps={{ accept: '.pdf,.jpg,.jpeg,.png' }}
                                onChange={handleArchivoChange}
                                fullWidth
                                size="small"
                                error={Boolean(errores.archivo)}
                                helperText={
                                    errores.archivo ||
                                    'El tamaño máximo del archivo debe ser 5MB (pdf, jpg, jpeg, png)'
                                }
                            />
                        </Grid>

                        {/* Observaciones */}
                        <Grid item xs={12}>
                            <TextField
                                label="Observaciones *"
                                value={observaciones}
                                onChange={(e) => {
                                    setObservaciones(e.target.value);
                                    setErrores((prev) => ({ ...prev, observaciones: undefined }));
                                }}
                                multiline
                                rows={3}
                                fullWidth
                                size="small"
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
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={
                            submitting ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                    >
                        {submitting ? 'Enviando…' : 'Enviar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
