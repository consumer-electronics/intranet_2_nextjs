'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BadgeIcon from '@mui/icons-material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAuth } from '@/hooks/useAuth';
import { useCertificadosLaborales } from '@/hooks/rrhh/useCertificadosLaborales';
import AccessDeniedAlert from '@/components/rrhh/solicitudes/AccessDeniedAlert';
import CertificadosLaboralesTable from './CertificadosLaboralesTable';
import CertificadoPdfDialog from './CertificadoPdfDialog';

/**
 * Vista principal del módulo "Certificados Laborales".
 *
 * Muestra el listado de funcionarios activos y permite generar/visualizar
 * el certificado laboral (PDF) de cada uno, así como exportar el listado
 * a Excel.
 */
export default function CertificadosLaboralesView() {
    const { user, loading: authLoading } = useAuth();

    const funcionarioId = user?.fun_id ?? user?.funId ?? user?.id ?? null;

    const tableRef = useRef(null);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Valor de búsqueda con debounce: evita recalcular el filtro (y "pegarse"
    // la tabla) en cada tecla, esperando a que el usuario deje de escribir.
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        rows,
        loading,
        error,
        granted,
        loadingPermiso,
        selectedRow,
        previewUrl,
        previewLoading,
        openPreview,
        closePreview,
        downloadPdf,
        snackbar,
        closeSnackbar,
        refetch,
    } = useCertificadosLaborales(funcionarioId);

    // Filtro por nombre, identificación o cargo (usa el término con debounce).
    const filteredRows = useMemo(() => {
        const term = debouncedSearchTerm.trim().toLowerCase();
        if (!term) return rows;
        return rows.filter((row) => {
            const nombre = String(row.fun_nombre_completo ?? '').toLowerCase();
            const identificacion = String(row.fun_identificacion ?? '').toLowerCase();
            const cargo = String(row.car_tag ?? row.car_nombre ?? '').toLowerCase();
            return (
                nombre.includes(term) ||
                identificacion.includes(term) ||
                cargo.includes(term)
            );
        });
    }, [rows, debouncedSearchTerm]);

    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            await tableRef.current?.triggerExport?.();
        } finally {
            setExporting(false);
        }
    };

    // Mientras se resuelve la autenticación o el permiso, mostramos carga.
    // Se exige también que exista un funcionario autenticado (funcionarioId)
    // para no mostrar "Acceso no autorizado" de forma momentánea.
    if (authLoading || !funcionarioId || loadingPermiso) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                <CircularProgress />
            </Stack>
        );
    }

    // Sin permiso → mensaje de acceso denegado.
    if (!granted) {
        return <AccessDeniedAlert />;
    }

    return (
        <Box>
            <Stack spacing={2}>
                {/* Encabezado */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1.5,
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <BadgeIcon color="primary" />
                        <Box>
                            <Typography variant="h6" component="h1" fontWeight={700}>
                                Certificados Laborales
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Genera el certificado laboral de los funcionarios activos.
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <TextField
                            size="small"
                            placeholder="Buscar por nombre, identificación o cargo…"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            sx={{ minWidth: { xs: '100%', sm: 320 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Tooltip title="Actualizar listado desde el servidor">
                            <span>
                                <IconButton
                                    color="primary"
                                    onClick={() => refetch()}
                                    disabled={loading}
                                    aria-label="Actualizar listado"
                                    sx={{ height: 40, width: 40 }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Descarga el listado visible en la tabla (respeta filtros y orden)">
                            <span>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExport}
                                    disabled={exporting || loading || filteredRows.length === 0}
                                    sx={{ height: 40, whiteSpace: 'nowrap' }}
                                >
                                    {exporting ? 'Exportando…' : 'Exportar Excel'}
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </Paper>

                {/* Errores de carga */}
                {error && (
                    <Alert severity="error" onClose={() => undefined}>
                        {error}
                    </Alert>
                )}

                {/* Tabla */}
                <CertificadosLaboralesTable
                    ref={tableRef}
                    rows={filteredRows}
                    loading={loading}
                    onView={openPreview}
                    onDownload={downloadPdf}
                    exportName="certificados-laborales"
                />
            </Stack>

            {/* Diálogo del certificado PDF */}
            <CertificadoPdfDialog
                open={Boolean(selectedRow) && Boolean(previewUrl) && !previewLoading}
                row={selectedRow}
                previewUrl={previewUrl}
                onClose={closePreview}
            />

            {/* Snackbar */}
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
        </Box>
    );
}
