'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import BadgeIcon from '@mui/icons-material/Badge';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';


import { useAuth } from '@/hooks/useAuth';
import CertificadoPdfDialog from './CertificadoPdfDialog';

/**
 * Vista individual del módulo "Certificado Laboral".
 * 
 * Permite al funcionario en sesión visualizar y descargar su propio certificado laboral.
 * Cumple con los requerimientos de la UI utilizando MUI DataGrid para mostrar la información.
 */
export default function CertificadoIndividualView() {
    const { user, loading: authLoading } = useAuth();

    // Vista previa del certificado PDF
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });
    const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

    const [rows, setRows] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        let active = true;
        async function fetchUserData() {
            if (!user) return;
            try {
                const funId = user.fun_id ?? user.funId ?? user.id ?? user.id_usuario;
                const { getListaCertificados } = await import('@/api/rrhh/certificadosLaborales');
                const listRes = await getListaCertificados();
                const allRows = listRes?.data?.rows ?? listRes?.rows ?? [];

                if (active) {
                    const myRow = allRows.find(r => String(r.fun_id) === String(funId));
                    if (myRow) {
                        setRows([{ ...myRow, id: myRow.fun_id }]);
                    } else {
                        // Fallback si no está en la vista vrol
                        setRows([
                            {
                                id: funId,
                                fun_id: funId,
                                fun_nombre_completo: user.fun_nombre ?? user.nombre ?? user.name ?? 'Funcionario',
                                fun_identificacion: user.fun_cedula ?? user.dni ?? user.cedula ?? '',
                                car_tag: user.car_nombre ?? user.cargo ?? 'No especificado',
                            }
                        ]);
                    }
                }
            } catch (err) {
                console.error('Error al obtener datos del usuario:', err);
                // Fallback en caso de error
                if (active) {
                    const funId = user.fun_id ?? user.funId ?? user.id ?? user.id_usuario;
                    setRows([
                        {
                            id: funId,
                            fun_id: funId,
                            fun_nombre_completo: user.fun_nombre ?? user.nombre ?? user.name ?? 'Funcionario',
                            fun_identificacion: user.fun_cedula ?? user.dni ?? user.cedula ?? '',
                            car_tag: user.car_nombre ?? user.cargo ?? 'No especificado',
                        }
                    ]);
                }
            } finally {
                if (active) setLoadingData(false);
            }
        }
        fetchUserData();
        return () => { active = false; };
    }, [user]);

    const openPreview = useCallback(async () => {
        if (!user) return;
        setPreviewLoading(true);
        setError(null);
        try {
            const funId = user.fun_id ?? user.funId ?? user.id;
            const res = await fetch(`/api/rrhh/certificados-laborales/pdf?id=${encodeURIComponent(funId)}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('No se pudo generar el certificado');
            const blob = await res.blob();
            setPreviewUrl(URL.createObjectURL(blob));
        } catch (err) {
            setError(err.message || 'Error al generar el documento');
        } finally {
            setPreviewLoading(false);
        }
    }, [user]);

    const closePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const downloadPdf = async () => {
        if (!user) return;
        try {
            const funId = user.fun_id ?? user.funId ?? user.id;
            const res = await fetch(`/api/rrhh/certificados-laborales/pdf?id=${encodeURIComponent(funId)}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('No se pudo descargar el certificado');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificado_Laboral_${funId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showSnackbar('Certificado descargado con éxito');
        } catch {
            showSnackbar('Error al descargar el documento', 'error');
        }
    };

    const columns = useMemo(() => [
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Acciones',
            width: 100,
            getActions: () => [
                <GridActionsCellItem
                    key="view"
                    icon={<VisibilityIcon color="primary" />}
                    label="Ver"
                    onClick={openPreview}
                    showInMenu={false}
                />
            ],
        },
        {
            field: 'fun_identificacion',
            headerName: 'Identificación',
            width: 150,
        },
        {
            field: 'fun_nombre_completo',
            headerName: 'Nombre del Funcionario',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'car_tag',
            headerName: 'Cargo',
            flex: 1,
            minWidth: 200,
        },
    ], [openPreview]);

    if (authLoading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                <CircularProgress />
            </Stack>
        );
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
                                Mi Certificado Laboral
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Visualiza y descarga tu certificado laboral personal.
                            </Typography>
                        </Box>
                    </Stack>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FileDownloadIcon />}
                        onClick={downloadPdf}
                        disabled={previewLoading}
                    >
                        Descargar Certificado
                    </Button>
                </Paper>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Tabla */}
                <Paper variant="outlined" sx={{ height: 300, width: '100%', overflow: 'hidden' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={previewLoading}
                        hideFooter
                        disableColumnMenu
                        localeText={{
                            noRowsLabel: 'No hay información disponible',
                            errorOverlayDefaultLabel: 'Ha ocurrido un error.',
                        }}
                        sx={{
                            border: 0,
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'background.default',
                                borderBottom: 1,
                                borderColor: 'divider',
                            },
                        }}
                    />
                </Paper>
            </Stack>

            {/* Diálogo del PDF */}
            <CertificadoPdfDialog
                open={Boolean(previewUrl) && !previewLoading}
                row={rows[0]}
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
