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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const MAX_DIAS = 30;

// Caja con borde reutilizable para los bloques del formulario
const cardSx = {
    p: 2,
    border: 1,
    borderColor: 'divider',
    borderRadius: 2,
    minWidth: 0,
};

// Grid CSS: minmax(0, 1fr) evita que el contenido ensanche la columna y la desalinee
const gridSx = (columns) => ({
    display: 'grid',
    gap: 2,
    gridTemplateColumns: columns,
    width: '100%',
});

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [fechaInicio, setFechaInicio] = useState(null);
    const [dias, setDias] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [errores, setErrores] = useState({});

    const nombre = usuario?.nombre || usuario?.name || usuario?.fun_nombre_completo || [usuario?.fun_nombre, usuario?.fun_nombre2, usuario?.fun_apellido, usuario?.fun_apellido2].filter(Boolean).join(' ') || usuario?.nombres || usuario?.Nombre || '';
    const cedula =
        usuario?.cedula || usuario?.dni || usuario?.fun_cedula || usuario?.documento || usuario?.Cedula || '';

    const formatArea = (str) => {
        if (!str) return '';
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const area = formatArea(usuario?.area || usuario?.dep_tag || usuario?.fun_area || usuario?.car_area || usuario?.dep_nombre || usuario?.dependencia || usuario?.departamento || usuario?.area_nombre || usuario?.nombre_area || usuario?.cargo || usuario?.car_nombre || '');
    const rol = usuario?.car_nombre || usuario?.car_tag || '';

    const nombreJefe = usuario?.jefe || '';

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

    const pickerSlotProps = (key) => ({
        textField: {
            size: 'small',
            fullWidth: true,
            required: true,
            error: Boolean(errores[key]),
            helperText: errores[key] || '',
        },
    });

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                fullScreen={isMobile}
                maxWidth="md"
                scroll="paper"
            >
                <DialogTitle sx={{ pr: 6, fontWeight: 700, fontSize: '1.25rem' }}>
                    Solicitar Vacaciones
                    <IconButton
                        aria-label="Cerrar"
                        onClick={handleClose}
                        disabled={submitting}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent
                    dividers
                    sx={{
                        overflowX: 'hidden',
                        px: { xs: 2, sm: 3 },
                        py: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        <Alert severity="info" sx={{ mb: 0 }}>
                            <Typography variant="body2">
                                <strong>Importante:</strong> Las vacaciones están sujetas a
                                aprobación por parte de su jefe de área (<strong>{nombreJefe}</strong>). Esta es únicamente una{' '}
                                <strong>solicitud</strong>, no una aprobación automática.
                            </Typography>
                        </Alert>

                        {/* Datos del usuario (informativos) */}
                        <Box
                            sx={gridSx({
                                xs: 'minmax(0, 1fr)',
                                md: 'repeat(3, minmax(0, 1fr))',
                            })}
                        >
                            <TextField label="Nombre" value={nombre} fullWidth size="small" disabled />
                            <TextField label="Cédula" value={cedula} fullWidth size="small" disabled />
                            <TextField label="Área" value={area} fullWidth size="small" disabled />
                        </Box>

                        {/* Fecha de inicio y días */}
                        <Box
                            sx={gridSx({
                                xs: 'minmax(0, 1fr)',
                                md: 'minmax(0, 1fr)',
                            })}
                        >
                            <Box sx={cardSx}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Detalles de Vacaciones
                                </Typography>
                                <Box sx={gridSx({ xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' })}>
                                    <DatePicker
                                        label="Fecha de inicio"
                                        value={fechaInicio}
                                        onChange={(value) => {
                                            setFechaInicio(value);
                                            setErrores((prev) => ({
                                                ...prev,
                                                fechaInicio: undefined,
                                            }));
                                        }}
                                        minDate={dayjs().startOf('day')}
                                        format="DD/MM/YYYY"
                                        slotProps={pickerSlotProps('fechaInicio')}
                                    />
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
                                </Box>
                            </Box>
                        </Box>

                        {/* Observaciones */}
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
                            minRows={5}
                            required
                            error={Boolean(errores.observaciones)}
                            helperText={errores.observaciones || ''}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
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
