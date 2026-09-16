'use client';

import { useRef, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/es';

import { useAuth } from '@/hooks/useAuth';
import { useBiometrico } from '@/hooks/useBiometrico';
import BiometricoTable from './BiometricoTable';

const TAB_MARCACIONES = 'marcaciones';
const TAB_AREA = 'area';
const TAB_TODOS = 'todos';

// Estilo compacto para los DatePickers (misma altura que los botones).
const compactPickerSx = {
    '& .MuiOutlinedInput-root': { py: 0.5 },
};

/**
 * Columnas del modal de marcaciones por empleado.
 * Se definen fuera del render para que triggerExport() las lea
 * igual que las ve el DataGrid (con valueGetter para aplanar arrays).
 */
const MODAL_COLUMNS = [
    {
        field: 'fecha',
        headerName: 'Fecha',
        flex: 1,
        minWidth: 140,
        sortable: true,
    },
    {
        field: 'horas',
        headerName: 'Hora(s)',
        flex: 2,
        minWidth: 280,
        sortable: false,
        // Para el Excel: aplana el array de horas a string separado por coma
        valueGetter: (value) =>
            Array.isArray(value) ? value.join(', ') : value ?? '',
        // Para la UI: muestra cada hora como un Chip
        renderCell: (params) => {
            const horas = Array.isArray(params.value)
                ? params.value
                : typeof params.value === 'string' && params.value
                  ? params.value.split(', ')
                  : [];
            if (horas.length === 0) return '—';
            return (
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
                    {horas.map((h, idx) => (
                        <Chip
                            key={idx}
                            label={h}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                    ))}
                </Stack>
            );
        },
    },
];

/**
 * Vista principal del módulo "Control Biométrico".
 * Orquesta las pestañas, el rango de fechas, las acciones
 * (consultar / sincronizar / exportar) y la tabla de datos.
 */
export default function BiometricoView() {
    const { user, loading: authLoading } = useAuth();

    const funcionarioId = user?.fun_id ?? user?.funId ?? user?.id ?? null;

    // Refs a los dos BiometricoTable para invocar triggerExport() desde aquí
    const mainTableRef = useRef(null);
    const modalTableRef = useRef(null);

    // Estado local para el botón "Exportar Excel" de la barra principal
    const [exportingMain, setExportingMain] = useState(false);
    const [exportingModal, setExportingModal] = useState(false);

    const {
        tab,
        setTab,
        permisos,

        dateRange,
        setDateRange,
        inicio,
        final,

        rows,
        misMarcaciones,
        loading,
        error,

        selectedEmpleado,
        empleadoMarcaciones,
        loadingEmpleado,
        empleadoError,
        verMarcaciones,
        cerrarMarcaciones,

        consultar,
        sincronizar,
        sincronizando,

        snackbar,
        showSnackbar,
        closeSnackbar,
    } = useBiometrico(funcionarioId);

    // ── Columnas de la tabla principal ────────────────────────────────────
    const columns = useMemo(() => {
        if (tab === TAB_MARCACIONES) {
            return [
                {
                    field: 'fecha',
                    headerName: 'Fecha',
                    flex: 1,
                    minWidth: 140,
                    sortable: true,
                },
                {
                    field: 'horas',
                    headerName: 'Hora(s)',
                    flex: 2,
                    minWidth: 220,
                    sortable: false,
                    valueGetter: (value) =>
                        Array.isArray(value) ? value.join(', ') : value ?? '',
                },
            ];
        }

        const base = [
            {
                field: 'nombre',
                headerName: 'Nombre',
                flex: 2,
                minWidth: 220,
                sortable: true,
            },
            {
                field: 'fecha',
                headerName: 'Fecha',
                flex: 1,
                minWidth: 130,
                sortable: true,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        color={params.row.esHoy ? 'text.primary' : 'error'}
                        fontWeight={params.row.esHoy ? 400 : 600}
                    >
                        {params.value || '—'}
                    </Typography>
                ),
            },
            {
                field: 'hora',
                headerName: 'Hora',
                flex: 1,
                minWidth: 130,
                sortable: true,
            },
        ];

        if (tab === TAB_TODOS) {
            base.unshift({
                field: 'departamento',
                headerName: 'Departamento',
                flex: 1,
                minWidth: 160,
                sortable: true,
            });
        }

        return base;
    }, [tab]);

    const tableRows =
        tab === TAB_MARCACIONES
            ? misMarcaciones.map((m, i) => ({ id: i, ...m }))
            : rows;

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleRowClick = (row) => {
        console.log('[BiometricoView] handleRowClick row:', row);
        if (tab === TAB_MARCACIONES) return;

        if (!row.idUsuario) {
            console.warn('[BiometricoView] idUsuario es null en la fila:', row);
            showSnackbar(
                'No se pudo obtener el id del empleado para consultar sus marcaciones.',
                'warning'
            );
            return;
        }

        verMarcaciones({ idUsuario: row.idUsuario, nombre: row.nombre });
    };

    const handleExportMain = async () => {
        if (!mainTableRef.current) return;
        setExportingMain(true);
        await mainTableRef.current.triggerExport();
        setExportingMain(false);
    };

    const handleExportModal = async () => {
        if (!modalTableRef.current) return;
        setExportingModal(true);
        await modalTableRef.current.triggerExport();
        setExportingModal(false);
    };

    // ── Nombre del archivo Excel según pestaña ────────────────────────────
    const exportNameMain = `control-biometrico-${tab}-${inicio ?? 'sin-fecha'}`;
    const exportNameModal = selectedEmpleado?.nombre
        ? `marcaciones-${selectedEmpleado.nombre.replace(/\s+/g, '_')}-${inicio ?? ''}`
        : `marcaciones-${selectedEmpleado?.idUsuario ?? 'empleado'}`;

    if (authLoading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Stack spacing={2}>
                <Typography variant="h4" component="h1" fontWeight={700}>
                    Control Biométrico
                </Typography>

                {/* ── Barra de control: tabs + fechas + acciones ── */}
                <Paper variant="outlined" sx={{ p: 1 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        spacing={1}
                        flexWrap="wrap"
                    >
                        {/* Pestañas */}
                        <Tabs
                            value={tab}
                            onChange={(_, value) => setTab(value)}
                            variant="scrollable"
                            scrollButtons="auto"
                            textColor="primary"
                            indicatorColor="primary"
                            aria-label="Secciones de control biométrico"
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': { minHeight: 40, py: 0.5 },
                            }}
                        >
                            <Tab
                                value={TAB_MARCACIONES}
                                label="Mis Marcaciones"
                                icon={<FingerprintIcon fontSize="small" />}
                                iconPosition="start"
                            />
                            {permisos.areas && (
                                <Tab
                                    value={TAB_AREA}
                                    label="Mi Área"
                                    icon={<GroupIcon fontSize="small" />}
                                    iconPosition="start"
                                />
                            )}
                            {permisos.todos && (
                                <Tab
                                    value={TAB_TODOS}
                                    label="Todos"
                                    icon={<PeopleIcon fontSize="small" />}
                                    iconPosition="start"
                                />
                            )}
                        </Tabs>

                        {/* Fechas + acciones */}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                            flexWrap="wrap"
                        >
                            <DatePicker
                                label="Inicio"
                                value={dateRange[0]}
                                onChange={(value) => setDateRange([value, dateRange[1]])}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: 'small' } }}
                                sx={compactPickerSx}
                            />
                            <DatePicker
                                label="Fin"
                                value={dateRange[1]}
                                onChange={(value) => setDateRange([dateRange[0], value])}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: 'small' } }}
                                sx={compactPickerSx}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<SearchIcon />}
                                onClick={consultar}
                                sx={{ height: 40 }}
                            >
                                Consultar
                            </Button>

                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<SyncIcon />}
                                onClick={sincronizar}
                                disabled={sincronizando}
                                sx={{ height: 40 }}
                            >
                                {sincronizando ? 'Sincronizando…' : 'Sincronizar'}
                            </Button>

                            {/* Separador visual */}
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

                            {/* Botón Excel principal — orgánico junto a las acciones */}
                            <Tooltip title="Descarga los datos visibles en la tabla (respeta filtros y orden)">
                                <span>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        size="small"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={handleExportMain}
                                        disabled={exportingMain || loading || tableRows.length === 0}
                                        sx={{ height: 40, whiteSpace: 'nowrap' }}
                                    >
                                        {exportingMain ? 'Exportando…' : 'Excel'}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Indicador visual: filas clickeables */}
                {tab !== TAB_MARCACIONES && (
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: -1 }}>
                        <Tooltip title="Haz clic en cualquier empleado para ver sus marcaciones en el período seleccionado">
                            <Chip
                                icon={<TouchAppIcon fontSize="small" />}
                                label="Clic en un empleado para ver sus marcaciones"
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ cursor: 'default', fontSize: '0.72rem' }}
                            />
                        </Tooltip>
                    </Stack>
                )}

                {/* ── Contenido de la pestaña activa ── */}
                <Box role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <BiometricoTable
                        ref={mainTableRef}
                        rows={tableRows}
                        loading={loading}
                        columns={columns}
                        onRowClick={handleRowClick}
                        exportName={exportNameMain}
                    />
                </Box>

                {/* ── Diálogo de marcaciones de un empleado ── */}
                <Dialog
                    open={Boolean(selectedEmpleado)}
                    onClose={cerrarMarcaciones}
                    maxWidth="md"
                    fullWidth
                    scroll="paper"
                >
                    <DialogTitle sx={{ pr: 6 }}>
                        <Stack spacing={0.25}>
                            <Typography variant="h6" component="span" fontWeight={600}>
                                {selectedEmpleado?.nombre || 'Marcaciones'}
                            </Typography>
                            {inicio && final && (
                                <Typography variant="caption" color="text.secondary">
                                    Período: {inicio} → {final}
                                </Typography>
                            )}
                        </Stack>
                        <IconButton
                            onClick={cerrarMarcaciones}
                            aria-label="Cerrar"
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        {empleadoError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {empleadoError}
                            </Alert>
                        )}
                        {loadingEmpleado ? (
                            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                                <CircularProgress />
                            </Stack>
                        ) : (
                            <BiometricoTable
                                ref={modalTableRef}
                                rows={empleadoMarcaciones.map((m, i) => ({ id: i, ...m }))}
                                loading={false}
                                autoRowHeight
                                columns={MODAL_COLUMNS}
                                exportName={exportNameModal}
                            />
                        )}
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
                        {/* Botón Excel del modal — a la izquierda en DialogActions */}
                        <Tooltip title="Descarga las marcaciones de este empleado en Excel">
                            <span>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExportModal}
                                    disabled={
                                        exportingModal ||
                                        loadingEmpleado ||
                                        empleadoMarcaciones.length === 0
                                    }
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {exportingModal ? 'Exportando…' : 'Exportar Excel'}
                                </Button>
                            </span>
                        </Tooltip>

                        <Button onClick={cerrarMarcaciones} color="inherit">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Snackbar ── */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
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
            </Stack>
        </LocalizationProvider>
    );
}
