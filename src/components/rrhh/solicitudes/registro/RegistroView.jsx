'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';

import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '@/hooks/useAuth';
import {
    checkPermisoSolicitudes,
} from '@/api/rrhh/solicitudes';
import {
    useSolicitudesRegistro,
    MOTIVOS_REGISTRO,
    NOMBRES_MESES,
} from '@/hooks/rrhh/useSolicitudesRegistro';

import AccessDeniedAlert from '../AccessDeniedAlert';
import RegistroTable from './RegistroTable';

/**
 * Vista del submódulo "Registro de permisos por fecha".
 *
 * Replica el comportamiento del archivo legacy
 * `solicitud_permisos_registro.php`:
 *  - Selector de año y mes.
 *  - Botones de motivo (Médica / Urgencia Médica / Laboral / Personal / Todos).
 *  - Switch "Mostrar no remunerados" (solo visible con motivo "Personal").
 *  - Tabla de registros aprobados/finalizados con exportación a Excel.
 */
export default function RegistroView() {
    const { user, loading: authLoading } = useAuth();

    const funcionarioId =
        user?.fun_id ?? user?.funId ?? user?.id ?? user?.id_usuario ?? null;

    const {
        years,
        months,
        loadingYears,
        loadingMonths,
        ano,
        setAno,
        mes,
        setMes,
        motivo,
        setMotivo,
        rows,
        loadingRows,
        error,
        consultado,
        fetchMonths,
        fetchRegistros,
    } = useSolicitudesRegistro();

    // Acceso al submódulo
    const [accessGranted, setAccessGranted] = useState(null);

    // Switch "Mostrar no remunerados"
    const [mostrarNoRemunerados, setMostrarNoRemunerados] = useState(false);

    // Ref de la tabla para exportar Excel
    const tableRef = useRef(null);

    // Notificaciones
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const notify = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Valida el permiso del submódulo "solicitud_permisos_registros".
    useEffect(() => {
        if (!funcionarioId) return undefined;
        let active = true;

        checkPermisoSolicitudes(funcionarioId, 'solicitud_permisos_registros')
            .then((data) => {
                if (active) setAccessGranted(Boolean(data?.granted));
            })
            .catch(() => {
                if (active) setAccessGranted(false);
            });

        return () => {
            active = false;
        };
    }, [funcionarioId]);

    // Al cambiar el año, se limpia el mes y se cargan los meses disponibles.
    const handleAnoChange = (event) => {
        const value = event.target.value;
        setAno(value);
        setMes('');
        setMotivo('');
        setMostrarNoRemunerados(false);
        if (value) fetchMonths(value);
    };

    // Al cambiar el mes, se habilitan los botones de motivo.
    const handleMesChange = (event) => {
        setMes(event.target.value);
        setMotivo('');
        setMostrarNoRemunerados(false);
    };

    // Al seleccionar un motivo se consultan los registros.
    const handleMotivoClick = (motivoId) => {
        setMotivo(motivoId);
        setMostrarNoRemunerados(false);
        if (ano && mes) {
            fetchRegistros({ ano, mes, motivo: motivoId });
        }
    };

    const handleSync = () => {
        if (ano && mes && motivo) {
            fetchRegistros({ ano, mes, motivo });
        } else {
            notify('Seleccione año, mes y motivo para consultar.', 'info');
        }
    };

    /*
     * =========================================================
     * CARGAS DE AUTENTICACIÓN / ACCESO
     * =========================================================
     */
    if (authLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (accessGranted === null) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (accessGranted === false) {
        return <AccessDeniedAlert />;
    }

    const esMotivoPersonal = motivo === 4;

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 4, mb: 5 }}>
            <Paper
                variant="outlined"
                sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }}
            >
                {/* ── Encabezado ── */}
                <Box sx={{ px: 3, pt: 3, pb: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Tooltip title="Volver a Solicitudes de Permisos">
                            <IconButton
                                component={Link}
                                href="/rrhh/solicitudes"
                                size="small"
                                color="primary"
                                aria-label="Volver a solicitudes de permisos"
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h5" component="h1" fontWeight={700}>
                            Registro de permisos por fecha
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Consulta histórica de permisos aprobados y finalizados
                    </Typography>
                </Box>

                {/* ── Filtros ── */}
                <Stack
                    direction="row"
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                    spacing={2}
                    sx={{ px: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    <TextField
                        select
                        label="Año"
                        value={ano}
                        onChange={handleAnoChange}
                        size="small"
                        sx={{ minWidth: 160 }}
                        disabled={loadingYears}
                    >
                        <MenuItem value="" disabled>
                            Seleccione un año
                        </MenuItem>
                        {years.map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Mes"
                        value={mes}
                        onChange={handleMesChange}
                        size="small"
                        sx={{ minWidth: 180 }}
                        disabled={!ano || loadingMonths}
                    >
                        <MenuItem value="TODOS">-- TODOS --</MenuItem>
                        <MenuItem value="" disabled>
                            Seleccione un mes
                        </MenuItem>
                        {months.map((m) => (
                            <MenuItem key={m} value={m}>
                                {NOMBRES_MESES[m - 1] ?? m}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Divider orientation="vertical" flexItem />

                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                        {MOTIVOS_REGISTRO.map((m) => (
                            <Button
                                key={m.id}
                                variant={motivo === m.id ? 'contained' : 'outlined'}
                                color={motivo === m.id ? 'primary' : 'inherit'}
                                size="small"
                                disabled={!mes}
                                onClick={() => handleMotivoClick(m.id)}
                            >
                                {m.label}
                            </Button>
                        ))}
                    </Stack>

                    <Box sx={{ flexGrow: 1 }} />

                    <Tooltip title="Consultar">
                        <span>
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                disabled={!ano || !mes || !motivo || loadingRows}
                                onClick={() => fetchRegistros({ ano, mes, motivo })}
                            >
                                Consultar
                            </Button>
                        </span>
                    </Tooltip>

                    <Tooltip title="Exportar Excel">
                        <span>
                            <Button
                                variant="outlined"
                                startIcon={<EventNoteIcon />}
                                onClick={() => tableRef.current?.triggerExport()}
                                disabled={rows.length === 0}
                            >
                                Exportar
                            </Button>
                        </span>
                    </Tooltip>

                    <Tooltip title="Sincronizar">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSync}
                            aria-label="Sincronizar datos"
                        >
                            <SyncIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {/* ── Contenido ── */}
                <Box sx={{ p: 3 }}>
                    {esMotivoPersonal && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={mostrarNoRemunerados}
                                    onChange={(e) =>
                                        setMostrarNoRemunerados(e.target.checked)
                                    }
                                />
                            }
                            label="Mostrar no remunerados"
                            sx={{ mb: 2 }}
                        />
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {!consultado ? (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{ py: 6 }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Seleccione año, mes y motivo para consultar los registros.
                            </Typography>
                        </Stack>
                    ) : (
                        <RegistroTable
                            ref={tableRef}
                            rows={rows}
                            loading={loadingRows}
                            exportName="registro-permisos"
                            mostrarNoRemunerados={mostrarNoRemunerados}
                        />
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={closeSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
