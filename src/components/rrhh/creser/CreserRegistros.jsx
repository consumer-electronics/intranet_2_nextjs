'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { useAuth } from '@/hooks/useAuth';
import { useCreser } from '@/hooks/rrhh/useCreser';
import { getAreasCreser, getProyectosFormacion } from '@/api/rrhh/creser';
import { CreserChartsPanel } from './CreserCharts';
import CreserPeriodosModal from './CreserPeriodosModal';

/** Calcula porcentaje seguro (evita división por cero) */
const pct = (parcial, total) =>
    total > 0 ? ((parcial * 100) / total).toFixed(2) : 0;

/**
 * CreserRegistros
 *
 * Vista de reportes CRESER — equivalente a `registros.php`.
 * Permite seleccionar un periodo y ver:
 *  - Tab "Registro": tabla de áreas (Área / Usuarios / Completados) + gráficas
 *      · Arriba: 2 ruedas (General y Líderes)
 *      · Abajo: 2 barras (Desempeño y Líderes)
 *  - Tab "Proyectos": tabla con Área / Usuario / Formación / Proyecto
 *
 * Botón "Periodos" abre el modal de gestión.
 * Click en fila de área navega a /rrhh/creser/areas?idArea=X&idPeriodo=Y.
 */
export default function CreserRegistros() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const { periodos, periodosLoading, recargarPeriodos } = useCreser(
        user?.fun_id ?? user?.id ?? null
    );

    const [tab, setTab] = useState(0);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
    const [modalPeriodosOpen, setModalPeriodosOpen] = useState(false);

    // ── Datos Tab Registro ──────────────────────────────────────────────────
    const [areas, setAreas] = useState(null);
    const [areasLoading, setAreasLoading] = useState(false);
    const [areasError, setAreasError] = useState(null);

    // ── Datos Tab Proyectos ─────────────────────────────────────────────────
    const [proyectos, setProyectos] = useState([]);
    const [proyectosLoading, setProyectosLoading] = useState(false);
    const [proyectosError, setProyectosError] = useState(null);

    // Seleccionar último periodo automáticamente al cargar
    useEffect(() => {
        if (periodos.length > 0 && !periodoSeleccionado) {
            setPeriodoSeleccionado(String(periodos[periodos.length - 1].cp_id));
        }
    }, [periodos, periodoSeleccionado]);

    // Cargar áreas cuando cambia el periodo
    const cargarAreas = useCallback(async (periodoId) => {
        if (!periodoId) return;
        setAreasLoading(true);
        setAreasError(null);
        setAreas(null);
        try {
            const data = await getAreasCreser(periodoId);
            if (data?.success) {
                setAreas(data.msj);
            } else {
                setAreasError(data?.msj ?? 'No se pudo cargar los datos');
            }
        } catch (err) {
            setAreasError(err.message);
        } finally {
            setAreasLoading(false);
        }
    }, []);

    const cargarProyectos = useCallback(async (periodoId) => {
        if (!periodoId) return;
        setProyectosLoading(true);
        setProyectosError(null);
        try {
            const data = await getProyectosFormacion(periodoId);
            if (data?.success) {
                const count = data.msj?.cantidad_registros ?? 0;
                const lista = [];
                for (let i = 0; i < count; i++) {
                    if (data.msj[i]) lista.push(data.msj[i]);
                }
                setProyectos(lista);
            } else {
                setProyectosError(data?.msj ?? 'No se pudo cargar los proyectos');
            }
        } catch (err) {
            setProyectosError(err.message);
        } finally {
            setProyectosLoading(false);
        }
    }, []);

    useEffect(() => {
        if (periodoSeleccionado) {
            cargarAreas(periodoSeleccionado);
            cargarProyectos(periodoSeleccionado);
        }
    }, [periodoSeleccionado, cargarAreas, cargarProyectos]);

    // ── Datos para gráficas ─────────────────────────────────────────────────
    const totalUsuarios = areas
        ? Array.from(
            { length: areas.cantidad_registros ?? 0 },
            (_, i) => areas[i]
        )
            .filter(Boolean)
            .reduce((acc, a) => acc + (a.usuarios_total ?? 0), 0)
        : 0;

    const pieGeneralData = areas
        ? [
            { name: 'Pendientes', value: totalUsuarios - (areas.cont_general ?? 0) },
            { name: 'Completados', value: areas.cont_general ?? 0 },
        ]
        : [];

    const pieLideresData = areas?.cont_lideres_total > 0
        ? [
            { name: 'Pendientes', value: (areas.cont_lideres_total ?? 0) - (areas.cont_lideres ?? 0) },
            { name: 'Completados', value: areas.cont_lideres ?? 0 },
        ]
        : [];

    const barGeneralData = areas?.cont_general > 0
        ? {
            categorias: ['Orientación al Servicio', 'Trabajo en Equipo', 'Efectividad'],
            valores: [
                pct(areas.orientacion_al_servicio, areas.orientacion_al_servicio_total),
                pct(areas.trabajo_en_equipo, areas.trabajo_en_equipo_total),
                pct(areas.efectividad, areas.efectividad_total),
            ],
        }
        : null;

    // TODO: barra de Líderes. Ajusta las competencias y los nombres de campo
    // según lo que devuelve tu API. Mientras sea null, no se muestra.
    // Ejemplo de estructura:
    // const barLideresData = areas?.cont_lideres > 0
    //     ? {
    //           categorias: ['Competencia 1', 'Competencia 2'],
    //           valores: [
    //               pct(areas.campo_lider_1, areas.campo_lider_1_total),
    //               pct(areas.campo_lider_2, areas.campo_lider_2_total),
    //           ],
    //       }
    //     : null;
    const barLideresData = null;

    // ── Armado del panel de gráficas (2 ruedas arriba, 2 barras abajo) ──────
    const hayLideres =
        pieLideresData.length > 0 &&
        pieLideresData[0].value + pieLideresData[1].value > 0;

    const pies = [
        {
            titulo: 'General',
            subtitulo: `Personas ${totalUsuarios}`,
            datos: pieGeneralData,
        },
        ...(hayLideres
            ? [
                {
                    titulo: 'Líderes',
                    subtitulo: `Personas ${areas?.cont_lideres_total ?? 0}`,
                    datos: pieLideresData,
                },
            ]
            : []),
    ];

    const bars = [
        ...(barGeneralData
            ? [
                {
                    titulo: 'Desempeño',
                    subtitulo: `Personas ${areas?.cont_general ?? 0}`,
                    categorias: barGeneralData.categorias,
                    valores: barGeneralData.valores,
                },
            ]
            : []),
        ...(barLideresData
            ? [
                {
                    titulo: 'Desempeño Líderes',
                    subtitulo: `Personas ${areas?.cont_lideres ?? 0}`,
                    categorias: barLideresData.categorias,
                    valores: barLideresData.valores,
                },
            ]
            : []),
    ];

    // ── Pagination and Sorting ──────────────────────────────────────────────
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('dep_tag');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ── Loading ─────────────────────────────────────────────────────────────
    if (authLoading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const filteredAreas = areas
        ? Array.from({ length: areas.cantidad_registros ?? 0 }, (_, i) => areas[i])
            .filter(Boolean)
            .filter((a) => a.usuarios_total > 0)
        : [];

    const sortedAreas = [...filteredAreas].sort((a, b) => {
        let valA = a[orderBy];
        let valB = b[orderBy];

        if (orderBy === 'dep_tag') {
            valA = valA ? String(valA).toLowerCase() : '';
            valB = valB ? String(valB).toLowerCase() : '';
            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        }

        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedAreas = sortedAreas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const headCellSx = { color: 'common.white', fontWeight: 700, bgcolor: 'primary.main' };
    const sortLabelSx = {
        color: 'inherit !important',
        '& .MuiTableSortLabel-icon': { color: 'inherit !important' },
    };

    return (
        <>
            <Box sx={{ maxWidth: 1300, mx: 'auto', mt: 4, mb: 5, px: { xs: 1, sm: 0 } }}>
                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {/* Encabezado */}
                    <Box
                        sx={{
                            px: 3,
                            pt: 3,
                            pb: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                            <Button
                                id="creser-registros-back"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => router.push('/rrhh/creser')}
                                sx={{ textTransform: 'none', fontWeight: 500 }}
                                size="small"
                            >
                                Volver a CRESER
                            </Button>
                            <FormControl size="small" sx={{ minWidth: { xs: 200, sm: 240 } }}>
                                <InputLabel id="creser-periodo-label">Periodo</InputLabel>
                                <Select
                                    labelId="creser-periodo-label"
                                    id="creser-periodo-select"
                                    value={periodoSeleccionado}
                                    label="Periodo"
                                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                                    disabled={periodosLoading}
                                >
                                    {periodos.map((p) => (
                                        <MenuItem key={p.cp_id} value={String(p.cp_id)}>
                                            {`${p.cp_fecha_inicio} — ${p.cp_fecha_fin}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Button
                            id="creser-btn-periodos"
                            variant="outlined"
                            size="small"
                            startIcon={<CalendarMonthIcon />}
                            onClick={() => setModalPeriodosOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Periodos
                        </Button>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            px: { xs: 1, sm: 3 },
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                        }}
                    >
                        <Tab id="creser-tab-registro" label="Registro" />
                        <Tab id="creser-tab-proyectos" label="Proyectos" icon={<SchoolIcon fontSize="small" />} iconPosition="start" />
                    </Tabs>

                    {/* ── Tab Registro ──────────────────────────────────────── */}
                    <Box role="tabpanel" sx={{ display: tab === 0 ? 'block' : 'none', p: { xs: 1.5, sm: 3 } }}>
                        {areasError && <Alert severity="error" sx={{ mb: 2 }}>{areasError}</Alert>}

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', lg: 'row' },
                                alignItems: { xs: 'stretch', lg: 'flex-start' },
                                gap: 3,
                            }}
                        >
                            {/* Tabla de áreas */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                {areasLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                        <CircularProgress size={28} />
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Table size="small" aria-label="Tabla de áreas CRESER">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={headCellSx}>
                                                        <TableSortLabel
                                                            active={orderBy === 'dep_tag'}
                                                            direction={orderBy === 'dep_tag' ? order : 'asc'}
                                                            onClick={() => handleRequestSort('dep_tag')}
                                                            sx={sortLabelSx}
                                                        >
                                                            Área
                                                        </TableSortLabel>
                                                    </TableCell>
                                                    <TableCell align="center" sx={headCellSx}>
                                                        <TableSortLabel
                                                            active={orderBy === 'usuarios_total'}
                                                            direction={orderBy === 'usuarios_total' ? order : 'asc'}
                                                            onClick={() => handleRequestSort('usuarios_total')}
                                                            sx={sortLabelSx}
                                                        >
                                                            Usuarios
                                                        </TableSortLabel>
                                                    </TableCell>
                                                    <TableCell align="center" sx={headCellSx}>
                                                        <TableSortLabel
                                                            active={orderBy === 'usuarios_realizado'}
                                                            direction={orderBy === 'usuarios_realizado' ? order : 'asc'}
                                                            onClick={() => handleRequestSort('usuarios_realizado')}
                                                            sx={sortLabelSx}
                                                        >
                                                            Completados
                                                        </TableSortLabel>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {paginatedAreas.map((area, idx) => (
                                                    <TableRow
                                                        key={area.dep_id ?? idx}
                                                        hover
                                                        onClick={() =>
                                                            router.push(
                                                                `/rrhh/creser/areas?idArea=${area.dep_id}&idPeriodo=${periodoSeleccionado}`
                                                            )
                                                        }
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell sx={{ fontSize: 11 }}>{area.dep_tag}</TableCell>
                                                        <TableCell align="center" sx={{ fontSize: 11 }}>{area.usuarios_total}</TableCell>
                                                        <TableCell align="center" sx={{ fontSize: 11 }}>{area.usuarios_realizado}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {filteredAreas.length === 0 && !areasLoading && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                            No hay datos para este periodo
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25]}
                                            component="div"
                                            count={filteredAreas.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            labelRowsPerPage="Filas por página"
                                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                                        />
                                    </TableContainer>
                                )}
                            </Box>

                            {/* Gráficas: 2 ruedas arriba, 2 barras abajo */}
                            {totalUsuarios > 0 && (
                                <Box sx={{ width: { xs: '100%', lg: 460 }, flexShrink: 0 }}>
                                    <CreserChartsPanel pies={pies} bars={bars} />
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* ── Tab Proyectos ──────────────────────────────────────── */}
                    <Box role="tabpanel" sx={{ display: tab === 1 ? 'block' : 'none', p: { xs: 1.5, sm: 3 } }}>
                        {proyectosError && <Alert severity="error" sx={{ mb: 2 }}>{proyectosError}</Alert>}

                        {proyectosLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small" aria-label="Tabla proyectos y formación CRESER">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={headCellSx}>Área</TableCell>
                                            <TableCell sx={headCellSx}>Usuarios</TableCell>
                                            <TableCell sx={headCellSx}>Formación</TableCell>
                                            <TableCell sx={headCellSx}>Proyecto</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {proyectos.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    No hay proyectos registrados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            proyectos.map((p, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell sx={{ fontSize: 11 }}>{p.area}</TableCell>
                                                    <TableCell sx={{ fontSize: 11 }}>{p.nombre_completo}</TableCell>
                                                    <TableCell sx={{ fontSize: 11 }}>{p.formacion}</TableCell>
                                                    <TableCell sx={{ fontSize: 11 }}>{p.proyecto}</TableCell>
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

            <CreserPeriodosModal
                open={modalPeriodosOpen}
                onClose={() => setModalPeriodosOpen(false)}
                onPeriodoGuardado={() => {
                    recargarPeriodos();
                    setModalPeriodosOpen(false);
                }}
                userId={user?.fun_id ?? user?.id ?? null}
            />
        </>
    );
}