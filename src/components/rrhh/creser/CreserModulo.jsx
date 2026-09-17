'use client';

import { useState, useMemo } from 'react';
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

import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { useAuth } from '@/hooks/useAuth';
import { useCreser } from '@/hooks/rrhh/useCreser';

/**
 * CreserModulo
 *
 * Vista principal del módulo CRESER — equivalente a `index.php`.
 * Muestra la tabla de empleados a cargo del funcionario autenticado
 * con sus intentos de encuesta (columnas: Nombre / Cantidad).
 *
 * El backend devuelve HTML con filas <tr>; se parsean para renderizar
 * en una tabla MUI limpia.
 *
 * Si el usuario tiene permiso `registros_creser`, aparece el botón "Reportes".
 * Cada fila es clickeable y navega a la encuesta correspondiente.
 */
export default function CreserModulo() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const funId = user?.fun_id ?? user?.id ?? user?.id_usuario ?? null;

    const {
        puedeVerRegistros,
        permisoCargado,
        listaHtml,
        listaLoading,
        listaError,
    } = useCreser(funId);

    // ── Parsear HTML del backend → filas de tabla ───────────────────────────
    const filas = useMemo(() => {
        if (!listaHtml) return [];
        return parseTableRows(listaHtml);
    }, [listaHtml]);

    // ── Handlers de navegación ───────────────────────────────────────────────
    const handleEncuesta = (fila) => {
        if (!fila.onClickArgs) return;
        // El HTML tiene: onclick="encuesta(funId, competenciaId)"
        const { funIdDestino, competenciaId } = fila.onClickArgs;
        if (!competenciaId) return;
        const atributo = competenciaId === 2 ? 10 : 31;
        router.push(
            `/rrhh/creser/encuesta?et_id=${competenciaId}&filtro_atr=${atributo}|${funIdDestino}`
        );
    };

    // ── Loading / Error states ───────────────────────────────────────────────
    if (authLoading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 5, px: { xs: 1, sm: 0 } }}>
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Encabezado */}
                <Box
                    sx={{
                        px: 3,
                        pt: 3,
                        pb: 2,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h5" component="h1" fontWeight={700}>
                            CRESER
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Evaluación de desempeño por competencias — colaboradores a cargo
                        </Typography>
                    </Box>

                    {permisoCargado && puedeVerRegistros && (
                        <Button
                            id="creser-btn-reportes"
                            variant="contained"
                            size="small"
                            startIcon={<AssessmentIcon />}
                            onClick={() => router.push('/rrhh/creser/registros')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Reportes
                        </Button>
                    )}
                </Box>

                {/* Tabla */}
                <Box sx={{ px: 3, pb: 4 }}>
                    {listaError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {listaError}
                        </Alert>
                    )}

                    {listaLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            <Table size="small" aria-label="Lista de colaboradores CRESER">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell
                                            sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                                        >
                                            Nombre
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                                        >
                                            Cantidad
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                    <ListAltIcon color="disabled" sx={{ fontSize: 40 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        No tienes personas a cargo
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filas.map((fila, idx) => (
                                            <TableRow
                                                key={idx}
                                                id={`creser-row-${idx}`}
                                                hover={Boolean(fila.onClickArgs)}
                                                onClick={() => handleEncuesta(fila)}
                                                sx={{
                                                    cursor: fila.onClickArgs ? 'pointer' : 'default',
                                                    bgcolor: fila.sinCompetencia
                                                        ? 'error.lighter'
                                                        : 'inherit',
                                                    '&:hover': fila.onClickArgs
                                                        ? { bgcolor: 'action.hover' }
                                                        : {},
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {fila.nombre}
                                                        {fila.sinCompetencia && (
                                                            <Chip
                                                                label="Sin competencia"
                                                                size="small"
                                                                color="error"
                                                                variant="outlined"
                                                                sx={{ fontSize: 10 }}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {fila.cantidad}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

// ── Parser del HTML del backend ──────────────────────────────────────────────
/**
 * Parsea el HTML de filas <tr> devuelto por `listaUsuarioCreser`.
 * El backend genera dos tipos de filas:
 *   1. Con onclick="encuesta(funId, competenciaId)" → colaborador con competencia definida
 *   2. Sin onclick, class="alert-danger"            → sin competencia definida
 *
 * @param {string} html
 * @returns {Array<{ nombre: string, cantidad: string, sinCompetencia: boolean, onClickArgs: { funIdDestino: number, competenciaId: number } | null }>}
 */
function parseTableRows(html) {
    const trMatches = [...html.matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/gi)];

    return trMatches
        .map((match) => {
            const attrs = match[1] ?? '';
            const inner = match[2] ?? '';

            const sinCompetencia = attrs.includes('alert-danger');

            // Extraer onclick="encuesta(123, 2)"
            const onClickMatch = attrs.match(/encuesta\((\d+)\s*,\s*(\d+)\)/i);
            const onClickArgs = onClickMatch
                ? {
                      funIdDestino: Number(onClickMatch[1]),
                      competenciaId: Number(onClickMatch[2]),
                  }
                : null;

            // Extraer texto de las <td>
            const tdMatches = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
            const celdas = tdMatches.map((td) =>
                td[1].replace(/<[^>]+>/g, '').trim()
            );

            return {
                nombre: celdas[0] ?? '',
                cantidad: celdas[1] ?? '0',
                sinCompetencia,
                onClickArgs,
            };
        })
        .filter((f) => f.nombre); // Filtrar filas vacías
}
