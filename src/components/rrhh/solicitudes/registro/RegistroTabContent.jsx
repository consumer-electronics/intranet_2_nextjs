'use client';

import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
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

import { useAuth } from '@/hooks/useAuth';
import { checkPermisoSolicitudes } from '@/api/rrhh/solicitudes';
import {
    useSolicitudesRegistro,
    MOTIVOS_REGISTRO,
    NOMBRES_MESES,
} from '@/hooks/rrhh/useSolicitudesRegistro';

import AccessDeniedAlert from '../AccessDeniedAlert';
import RegistroTable from './RegistroTable';

/**
 * Contenido del Tab "Registro".
 *
 * Es la misma funcionalidad que RegistroView pero sin el Paper exterior
 * (lo provee SolicitudesModulo) y sin el botón ArrowBack
 * (reemplazado por los Tabs del módulo).
 */
export default function RegistroTabContent() {
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

    const [accessGranted, setAccessGranted] = useState(null);
    const [mostrarNoRemunerados, setMostrarNoRemunerados] = useState(false);
    const tableRef = useRef(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const notify = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });
    const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

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

        return () => { active = false; };
    }, [funcionarioId]);

    const handleAnoChange = (event) => {
        const value = event.target.value;
        setAno(value);
        setMes('');
        setMotivo('');
        setMostrarNoRemunerados(false);
        if (value) fetchMonths(value);
    };

    const handleMesChange = (event) => {
        setMes(event.target.value);
        setMotivo('');
        setMostrarNoRemunerados(false);
    };

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

    /* ── Carga / acceso ── */
    if (authLoading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (accessGranted === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (accessGranted === false) {
        return <AccessDeniedAlert />;
    }

    const esMotivoPersonal = motivo === 4;

    return (
        <Box>
            {/* ── Filtros ── */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                flexWrap="wrap"
                gap={2}
                sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <TextField
                    select
                    label="Año"
                    value={ano}
                    onChange={handleAnoChange}
                    size="small"
                    sx={{ minWidth: 140 }}
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
                    sx={{ minWidth: 160 }}
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

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                {/* Motivos */}
                <Stack direction="row" flexWrap="wrap" gap={1}>
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

                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

                {/* Acciones */}
                <Stack direction="row" alignItems="center" gap={1}>
                    <Tooltip title="Consultar">
                        <span>
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                disabled={!ano || !mes || !motivo || loadingRows}
                                onClick={() => fetchRegistros({ ano, mes, motivo })}
                                size="small"
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
                                size="small"
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
            </Stack>

            {/* ── Contenido ── */}
            <Box sx={{ p: 3 }}>
                {esMotivoPersonal && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mostrarNoRemunerados}
                                onChange={(e) => setMostrarNoRemunerados(e.target.checked)}
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
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
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

            {/* ── Notificaciones ── */}
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
