'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useAuth } from '@/hooks/useAuth';
import { getEncuestaView } from '@/api/rrhh/creser';

/**
 * CreserEncuesta
 *
 * Vista de encuesta CRESER renderizada como JSX — equivalente a `encuesta.php`.
 *
 * En lugar de cargar un iframe al legacy de Dynamics, este componente:
 * 1. Hace fetch al route handler `/api/rrhh/creser/encuesta-view`
 *    que obtiene el HTML de Dynamics y lo parsea en { titulo, columns, rows }.
 * 2. Renderiza los datos en una tabla MUI limpia y accesible.
 *
 * Props (vienen de searchParams en la page):
 *  - et_id      {string|number}  ID del tipo de encuesta (2 = general, 3 = líderes)
 *  - filtro_atr {string}         "atributo|userId" ej: "10|123"
 */
export default function CreserEncuesta({ et_id, filtro_atr }) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const id_usuario = user?.fun_id ?? user?.id ?? user?.id_usuario ?? null;

    const cargar = useCallback(async () => {
        if (!et_id || !id_usuario) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getEncuestaView({ et_id, filtro_atr, id_usuario });
            setDatos(result);
        } catch (err) {
            setError(err.message ?? 'No se pudo cargar la encuesta');
        } finally {
            setLoading(false);
        }
    }, [et_id, filtro_atr, id_usuario]);

    useEffect(() => { cargar(); }, [cargar]);

    if (authLoading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const titulo = datos?.titulo ?? 'Evaluación CRESER';
    const columns = datos?.columns ?? [];
    const rows = datos?.rows ?? [];

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 5, px: { xs: 1, sm: 0 } }}>
            {/* Botón volver */}
            <Button
                id="creser-encuesta-back"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Encabezado */}
                <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                    <Typography
                        variant="h6"
                        component="h1"
                        fontWeight={700}
                        color="primary"
                        align="center"
                    >
                        {titulo}
                    </Typography>
                    {et_id && (
                        <Stack direction="row" justifyContent="center" mt={1} spacing={1}>
                            <Chip
                                label={`Tipo encuesta: ${et_id}`}
                                size="small"
                                variant="outlined"
                            />
                            {rows.length > 0 && (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`${rows.length} evaluación${rows.length !== 1 ? 'es' : ''} registrada${rows.length !== 1 ? 's' : ''}`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                    )}
                </Box>

                {/* Error */}
                {error && (
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <Stack alignItems="center" spacing={1}>
                            <CircularProgress />
                            <Typography variant="caption" color="text.secondary">
                                Cargando evaluaciones...
                            </Typography>
                        </Stack>
                    </Box>
                )}

                {/* Tabla de evaluaciones */}
                {!loading && datos && (
                    <Box sx={{ px: 3, pb: 4 }}>
                        {rows.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    color: 'text.secondary',
                                }}
                            >
                                <DoDisturbIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                                <Typography variant="body2">
                                    No se han registrado evaluaciones aún
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            >
                                <Table
                                    size="small"
                                    aria-label="Evaluaciones CRESER registradas"
                                    sx={{ fontSize: 11 }}
                                >
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                                            {columns.map((col, idx) => (
                                                <TableCell
                                                    key={idx}
                                                    align="center"
                                                    sx={{
                                                        color: 'primary.contrastText',
                                                        fontWeight: 700,
                                                        fontSize: 11,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {col}
                                                </TableCell>
                                            ))}
                                            {/* Columna de acciones */}
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    color: 'primary.contrastText',
                                                    fontWeight: 700,
                                                    fontSize: 11,
                                                }}
                                            >
                                                Acciones
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, rowIdx) => (
                                            <TableRow
                                                key={rowIdx}
                                                hover
                                                sx={{ '&:last-child td': { border: 0 } }}
                                            >
                                                {/* Celdas de datos */}
                                                {(row.cells ?? []).map((cell, cellIdx) => (
                                                    <TableCell
                                                        key={cellIdx}
                                                        align="center"
                                                        sx={{ fontSize: 11 }}
                                                    >
                                                        <CeldaContenido valor={cell} />
                                                    </TableCell>
                                                ))}

                                                {/* Celda acciones */}
                                                <TableCell align="center">
                                                    {row.ereId ? (
                                                        <Tooltip title="Ver detalle de evaluación">
                                                            <Button
                                                                id={`creser-encuesta-ver-${row.ereId}`}
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/rrhh/creser/encuesta-rta?et_id=${et_id}&ere_id=${row.ereId}&idUsu=${row.idUsu ?? ''}`
                                                                    )
                                                                }
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: 11,
                                                                    borderRadius: 1.5,
                                                                }}
                                                            >
                                                                Ver
                                                            </Button>
                                                        </Tooltip>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

/**
 * Renderiza el contenido de una celda.
 * Si el valor está vacío muestra "—". Los valores numéricos y texto se muestran directamente.
 */
function CeldaContenido({ valor }) {
    if (!valor || valor.trim() === '') return <span style={{ color: '#aaa' }}>—</span>;
    return <span>{valor}</span>;
}
