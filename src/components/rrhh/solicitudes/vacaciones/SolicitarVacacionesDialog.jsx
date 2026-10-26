'use client';

import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getConsolidadoVacaciones } from '@/api/rrhh/solicitudesVacaciones';

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
 * Formulario minimalista con integración de días disponibles de Yéminus
 * (redondeados al entero más cercano y al corte del mes anterior).
 */
export default function SolicitarVacacionesDialog({
    open,
    onClose,
    usuario = {},
    onSubmit,
    submitting = false,
    consolidadoProp = undefined,
    loadingConsolidadoProp = false,
    corteInfoProp = '',
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [fechaInicio, setFechaInicio] = useState(null);
    const [dias, setDias] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [errores, setErrores] = useState({});

    // Consolidado de vacaciones Yéminus (fallback si no se pasa precargado)
    const [consolidadoInterno, setConsolidadoInterno] = useState(null);
    const [loadingInterno, setLoadingInterno] = useState(false);
    const [corteInterno, setCorteInterno] = useState('');

    const isPropProvided = consolidadoProp !== undefined;
    const consolidado = isPropProvided ? consolidadoProp : consolidadoInterno;
    const loadingConsolidado = isPropProvided ? loadingConsolidadoProp : loadingInterno;
    const corteInfo = isPropProvided ? (corteInfoProp || '') : corteInterno;

    const funId =
        usuario?.fun_id ??
        usuario?.funId ??
        usuario?.id ??
        usuario?.id_usuario ??
        '';

    const contrato =
        usuario?.useryem ??
        usuario?.fun_empleado_geminus ??
        usuario?.id_geminus ??
        usuario?.idUserYem ??
        usuario?.contrato ??
        '';

    const nombre =
        usuario?.nombre ||
        usuario?.name ||
        usuario?.fun_nombre_completo ||
        [usuario?.fun_nombre, usuario?.fun_nombre2, usuario?.fun_apellido, usuario?.fun_apellido2]
            .filter(Boolean)
            .join(' ') ||
        usuario?.nombres ||
        usuario?.Nombre ||
        '';

    const cedula =
        usuario?.cedula ||
        usuario?.dni ||
        usuario?.fun_cedula ||
        usuario?.documento ||
        usuario?.Cedula ||
        '';

    const formatArea = (str) => {
        if (!str) return '';
        return str
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const area = formatArea(
        usuario?.area ||
        usuario?.dep_tag ||
        usuario?.fun_area ||
        usuario?.car_area ||
        usuario?.dep_nombre ||
        usuario?.dependencia ||
        usuario?.departamento ||
        usuario?.area_nombre ||
        usuario?.nombre_area ||
        usuario?.cargo ||
        usuario?.car_nombre ||
        ''
    );
    const rol = usuario?.car_nombre || usuario?.car_tag || '';
    const nombreJefe = usuario?.jefe || '';

    // Cargar consolidado de Yéminus (fallback bajo demanda)
    const cargarConsolidado = useCallback(async () => {
        if (!funId && !contrato) return;

        setLoadingInterno(true);
        try {
            const res = await getConsolidadoVacaciones({
                contrato: contrato || undefined,
                funId: funId || undefined,
            });

            const datos = res?.data ?? null;
            setConsolidadoInterno(datos);
            if (res?.fechaCorte) {
                setCorteInterno(res.fechaCorte);
            }
        } catch (err) {
            console.error('Error al cargar consolidado de vacaciones:', err);
            setConsolidadoInterno(null);
        } finally {
            setLoadingInterno(false);
        }
    }, [funId, contrato]);

    useEffect(() => {
        // Solo cargamos internamente si open=true y NO fue provisto desde el componente padre
        if (open && !isPropProvided) {
            cargarConsolidado();
        }
    }, [open, isPropProvided, cargarConsolidado]);

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
            nuevos.observaciones = 'La observación debe tener al menos 10 caracteres.';
        }

        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleSubmit = () => {
        if (!validar()) return;

        const formData = new FormData();
        formData.set('idUsu', String(funId));
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

    // Días disponibles redondeados: >= 0.5 sube al siguiente entero, < 0.5 baja
    const diasBrutos =
        consolidado?.diasHabilesXDisfrutar !== undefined && consolidado?.diasHabilesXDisfrutar !== null
            ? Number(consolidado.diasHabilesXDisfrutar)
            : null;

    const diasDisponibles = diasBrutos !== null ? Math.round(diasBrutos) : null;

    const fechaCorteFormateada = corteInfo
        ? dayjs(corteInfo).locale('es').format('D [de] MMMM [de] YYYY')
        : null;

    // Alerta si la cantidad solicitada supera los días disponibles
    const numDiasSolicitados = Number(dias);
    const estaAdelantando =
        diasDisponibles !== null &&
        numDiasSolicitados > 0 &&
        numDiasSolicitados > diasDisponibles;

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
                <DialogTitle
                    sx={{
                        pr: 6,
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <BeachAccessIcon color="primary" />
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
                        {/* Alerta informativa sobre la aprobación */}
                        <Alert severity="info" sx={{ mb: 0 }}>
                            <Typography variant="body2">
                                <strong>Importante:</strong> Las vacaciones están sujetas a
                                aprobación por parte de su jefe de área{' '}
                                {nombreJefe ? <strong>({nombreJefe})</strong> : ''}. Esta es únicamente una{' '}
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

                        {/* Detalles de la Solicitud con Días Disponibles integrados */}
                        <Box sx={cardSx}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Detalles de la Solicitud
                                </Typography>

                                {loadingConsolidado ? (
                                    <Skeleton variant="rounded" width={170} height={28} />
                                ) : diasDisponibles !== null ? (
                                    <Tooltip
                                        title={
                                            fechaCorteFormateada
                                                ? `Calculado al corte del ${fechaCorteFormateada} (${diasBrutos} días hábiles en Yéminus)`
                                                : `Días hábiles calculados en Yéminus: ${diasBrutos}`
                                        }
                                        arrow
                                    >
                                        <Chip
                                            icon={<EventAvailableIcon fontSize="small" />}
                                            label={`Disponibles: ${diasDisponibles} días`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.8125rem',
                                                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                                                borderColor: (t) => alpha(t.palette.primary.main, 0.3),
                                            }}
                                        />
                                    </Tooltip>
                                ) : null}
                            </Box>

                            <Box
                                sx={gridSx({
                                    xs: 'minmax(0, 1fr)',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                })}
                            >
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
                                        `Límite máximo: ${MAX_DIAS} días`
                                    }
                                />
                            </Box>

                            {/* Alerta si solicita más días de los disponibles */}
                            {estaAdelantando && (
                                <Alert
                                    severity="info"
                                    icon={<InfoOutlinedIcon fontSize="small" />}
                                    sx={{
                                        mt: 2,
                                        py: 0.5,
                                        px: 1.5,
                                        fontSize: '0.8125rem',
                                        alignItems: 'center',
                                        '& .MuiAlert-message': { py: 0 },
                                    }}
                                >
                                    Está solicitando <strong>{numDiasSolicitados} días</strong> ({diasDisponibles} disponibles).
                                    Tenga en cuenta que estará <strong>adelantando vacaciones de un periodo próximo</strong>.
                                </Alert>
                            )}
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
                            minRows={4}
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
                            ) : (
                                <BeachAccessIcon fontSize="small" />
                            )
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
