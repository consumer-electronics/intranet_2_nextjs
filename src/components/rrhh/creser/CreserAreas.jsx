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
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '@/hooks/useAuth';
import { getPersonasArea } from '@/api/rrhh/creser';
import { CreserPieChart, CreserBarChart } from './CreserCharts';

/**
 * CreserAreas
 *
 * Vista de detalle de un área — equivalente a `areas.php`.
 * Muestra la tabla de personas del área con su estado CRESER:
 *   - Verde  (alert-success): Realizado
 *   - Rojo   (alert-danger): Sin definir competencia
 *   - Neutro: No realizado
 *
 * Al hacer click en una persona navega a la encuesta.
 *
 * Props:
 *  - idArea    {string|number}
 *  - idPeriodo {string|number}
 */
export default function CreserAreas({ idArea, idPeriodo }) {
    const router = useRouter();
    const { user } = useAuth();

    const [personas, setPersonas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        if (!idArea || !idPeriodo) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getPersonasArea(idArea, idPeriodo);
            setPersonas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [idArea, idPeriodo]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleEncuesta = (persona) => {
        const competencia = persona.competencia_creser;
        if (!competencia || competencia === 0) return;
        const atributo = Number(competencia) === 2 ? 10 : 31;
        router.push(
            `/rrhh/creser/encuesta?et_id=${competencia}&filtro_atr=${atributo}|${persona.fun_id}`
        );
    };

    // ── Datos para gráficas ─────────────────────────────────────────────────
    const count = personas?.cantidad_registros ?? 0;
    const personas_array = personas
        ? Array.from({ length: count }, (_, i) => personas[i]).filter(Boolean)
        : [];

    const pieGeneralData = personas
        ? [
              { name: 'Pendientes', value: count - (personas.cont_general ?? 0) },
              { name: 'Completados', value: personas.cont_general ?? 0 },
          ]
        : [];

    const pieLideresData = (personas?.cont_lideres_total ?? 0) > 0
        ? [
              { name: 'Pendientes', value: (personas.cont_lideres_total ?? 0) - (personas.cont_lideres ?? 0) },
              { name: 'Completados', value: personas.cont_lideres ?? 0 },
          ]
        : [];

    const barData = (personas?.cont_general ?? 0) > 0 && personas
        ? {
              categorias: ['Orientación al Servicio', 'Trabajo en Equipo', 'Efectividad', 'Innovación y Gestión del Cambio'],
              valores: [
                  personas.orientacion_al_servicio_total > 0
                      ? ((personas.orientacion_al_servicio * 100) / personas.orientacion_al_servicio_total).toFixed(2)
                      : 0,
                  personas.trabajo_en_equipo_total > 0
                      ? ((personas.trabajo_en_equipo * 100) / personas.trabajo_en_equipo_total).toFixed(2)
                      : 0,
                  personas.efectividad_total > 0
                      ? ((personas.efectividad * 100) / personas.efectividad_total).toFixed(2)
                      : 0,
                  personas.innovacion_y_gestion_del_cambio_total > 0
                      ? ((personas.innovacion_y_gestion_del_cambio * 100) / personas.innovacion_y_gestion_del_cambio_total).toFixed(2)
                      : 0,
              ],
          }
        : null;

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 5, px: { xs: 1, sm: 0 } }}>
            {/* Back */}
            <Button
                id="creser-areas-back"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver a Reportes
            </Button>

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Detalle del Área
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Periodo #{idPeriodo}
                    </Typography>
                </Box>

                {error && (
                    <Box sx={{ px: 3 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                <Box sx={{ p: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Tabla de personas */}
                            <Grid item xs={12} md={4}>
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table size="small" aria-label="Personas del área CRESER">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'common.white', fontWeight: 700, bgcolor: 'primary.main' }}>Nombre</TableCell>
                                                <TableCell align="center" sx={{ color: 'common.white', fontWeight: 700, bgcolor: 'primary.main' }}>Estado</TableCell>
                                                <TableCell align="center" sx={{ color: 'common.white', fontWeight: 700, bgcolor: 'primary.main' }}>Intentos</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {personas_array.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                        No hay personas en esta área
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                personas_array.map((p, idx) => {
                                                    const sinCompetencia = !p.competencia_creser || p.competencia_creser === 0;
                                                    const realizado = !sinCompetencia && (p.cantidad_intentos ?? 0) > 0;

                                                    return (
                                                        <TableRow
                                                            key={p.fun_id ?? idx}
                                                            hover={!sinCompetencia}
                                                            onClick={() => handleEncuesta(p)}
                                                            sx={{
                                                                cursor: sinCompetencia ? 'default' : 'pointer',
                                                                bgcolor: sinCompetencia
                                                                    ? 'error.lighter'
                                                                    : realizado
                                                                    ? 'success.lighter'
                                                                    : 'inherit',
                                                            }}
                                                        >
                                                            <TableCell sx={{ fontSize: 11 }}>
                                                                {p.fun_nombre_completo}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Chip
                                                                    label={
                                                                        sinCompetencia
                                                                            ? 'Sin competencia'
                                                                            : realizado
                                                                            ? 'Realizado'
                                                                            : 'No realizado'
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        sinCompetencia
                                                                            ? 'error'
                                                                            : realizado
                                                                            ? 'success'
                                                                            : 'default'
                                                                    }
                                                                    variant="outlined"
                                                                    sx={{ fontSize: 9 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ fontSize: 11 }}>
                                                                {p.cantidad_intentos ?? 0}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            {/* Gráficas */}
                            <Grid item xs={12} md={8}>
                                {count > 0 && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <CreserPieChart
                                                titulo="General"
                                                subtitulo={`Personas ${count}`}
                                                datos={pieGeneralData}
                                            />
                                        </Grid>
                                        {pieLideresData.length > 0 && (pieLideresData[0].value + pieLideresData[1].value) > 0 && (
                                            <Grid item xs={6}>
                                                <CreserPieChart
                                                    titulo="Líderes"
                                                    subtitulo={`Personas ${personas?.cont_lideres_total ?? 0}`}
                                                    datos={pieLideresData}
                                                />
                                            </Grid>
                                        )}
                                        {barData && (
                                            <Grid item xs={12}>
                                                <CreserBarChart
                                                    titulo="Desempeño"
                                                    subtitulo={`Personas ${personas?.cont_general ?? 0}`}
                                                    categorias={barData.categorias}
                                                    valores={barData.valores}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
