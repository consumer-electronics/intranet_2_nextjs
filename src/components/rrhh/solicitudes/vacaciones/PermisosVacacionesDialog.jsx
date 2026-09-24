'use client';

import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';

import { ESTADO_VACACIONES } from '@/hooks/rrhh/useSolicitudesVacaciones';

/**
 * Traducción completa del DataGrid al español.
 */
const SPANISH_LOCALE = {
    ...esES.components.MuiDataGrid.defaultProps.localeText,
    toolbarColumns: 'Columnas',
    toolbarFilters: 'Filtros',
    toolbarDensity: 'Densidad',
    toolbarExport: 'Exportar',
    toolbarQuickFilterPlaceholder: 'Buscar…',
    toolbarQuickFilterLabel: 'Buscar',
    toolbarQuickFilterDeleteIconLabel: 'Limpiar',
    columnsPanelShowAllButton: 'Mostrar todo',
    columnsPanelHideAllButton: 'Ocultar todo',
    columnsPanelTextFieldLabel: 'Buscar columna',
    columnsPanelTextFieldPlaceholder: 'Título de columna',
    filterPanelAddFilter: 'Agregar filtro',
    filterPanelDeleteIconLabel: 'Eliminar',
    filterPanelOperator: 'Operador',
    filterPanelOperatorAnd: 'Y',
    filterPanelOperatorOr: 'O',
    filterPanelColumns: 'Columnas',
    filterPanelInputLabel: 'Valor',
    filterPanelInputPlaceholder: 'Valor del filtro',
    filterOperatorContains: 'contiene',
    filterOperatorEquals: 'es igual a',
    filterOperatorStartsWith: 'empieza con',
    filterOperatorEndsWith: 'termina con',
    filterOperatorIsEmpty: 'está vacío',
    filterOperatorIsNotEmpty: 'no está vacío',
    filterOperatorIsAnyOf: 'es cualquiera de',
    filterValueAny: 'cualquiera',
    filterValueTrue: 'verdadero',
    filterValueFalse: 'falso',
    columnMenuLabel: 'Menú',
    columnMenuShowColumns: 'Mostrar columnas',
    columnMenuManageColumns: 'Administrar columnas',
    columnMenuFilter: 'Filtrar',
    columnMenuHideColumn: 'Ocultar columna',
    columnMenuUnsort: 'Quitar orden',
    columnMenuSortAsc: 'Ordenar ascendentemente',
    columnMenuSortDesc: 'Ordenar descendentemente',
    columnHeaderSortIconLabel: 'Ordenar',
    columnHeaderFilterIconLabel: 'Filtrar',
    columnHeaderMenuIconDescription: 'Menú de columna',
    noRowsLabel: 'No hay datos disponibles',
    noResultsOverlayLabel: 'No se encontraron resultados',
    footerTotalRows: 'Total de filas:',
    footerTotalVisibleRows: (visibleCount, totalCount) =>
        `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
    footerRowSelected: (count) =>
        count > 1
            ? `${count.toLocaleString()} filas seleccionadas`
            : `${count.toLocaleString()} fila seleccionada`,
    checkboxSelectionHeaderName: 'Selección',
    checkboxSelectionSelectAllRows: 'Seleccionar todas las filas',
    checkboxSelectionUnselectAllRows: 'Desmarcar todas las filas',
    checkboxSelectionSelectRow: 'Seleccionar fila',
    checkboxSelectionUnselectRow: 'Desmarcar fila',
    booleanCellTrueLabel: 'sí',
    booleanCellFalseLabel: 'no',
    MuiTablePagination: {
        labelRowsPerPage: 'Filas por página:',
        labelDisplayedRows: ({ from, to, count }) => `${from}–${to} de ${count}`,
    },
};

/**
 * Estados del filtro del modal (coinciden con el backend legacy).
 * - En espera (1) usa lider=1 → muestra botones aprobar/rechazar/reversar.
 * - Aprobados (3), Rechazados (4), Finalizados (5) usan lider=0.
 */
const FILTROS = [
    { id: ESTADO_VACACIONES.EN_ESPERA, label: 'En espera', lider: 1 },
    { id: ESTADO_VACACIONES.APROBADO, label: 'Aprobados', lider: 0 },
    { id: ESTADO_VACACIONES.RECHAZADO, label: 'Rechazados', lider: 0 },
];

/**
 * Diálogo "Vacaciones de un usuario".
 *
 * Muestra las solicitudes de vacaciones del empleado seleccionado con filtros
 * por estado (En espera / Aprobados / Rechazados / Finalizados). En el estado
 * "En espera" se muestran las acciones Aprobar / Rechazar / Reversar y la
 * impresión del PDF.
 *
 * Props:
 *  - open          {boolean}
 *  - onClose       {function}
 *  - usuario       {object}  Empleado seleccionado: { idUsuario, nombre }.
 *  - rows          {Array}   Vacaciones del estado activo.
 *  - loading       {boolean}
 *  - estadoActivo  {number}  Estado actualmente seleccionado.
 *  - onCambiarEstado {function(estadoId, lider)}  Cambia el filtro.
 *  - onAprobar     {function(row)}  Aprueba una solicitud.
 *  - onRechazar    {function(row)}  Rechaza una solicitud.
 *  - onReversar    {function(row)}  Reversa una solicitud.
 *  - onImprimir    {function(row)}  Genera/descarga el PDF de una solicitud.
 *  - accionandoId  {string|number|null}  Id de la solicitud en proceso.
 *  - imprimiendoId {string|number|null}  Id de la solicitud cuyo PDF se genera.
 */
export default function PermisosVacacionesDialog({
    open,
    onClose,
    usuario = {},
    rows = [],
    loading = false,
    estadoActivo = ESTADO_VACACIONES.EN_ESPERA,
    onCambiarEstado,
    onAprobar,
    onRechazar,
    onReversar,
    onImprimir,
    accionandoId = null,
    imprimiendoId = null,
}) {
    const theme = useTheme();
    const [observacionesAbierta, setObservacionesAbierta] = useState(null);

    const nombre = usuario?.nombre || '';

    const esEnEspera = estadoActivo === ESTADO_VACACIONES.EN_ESPERA;

    const columns = [
        {
            field: 'fechaCreacion',
            headerName: 'Fecha Creación',
            width: 170,
            sortable: true,
        },
        {
            field: 'motivo',
            headerName: 'Motivo',
            width: 150,
            sortable: true,
        },
        {
            field: 'autorizo',
            headerName: 'Autorización',
            width: 180,
            sortable: true,
        },
        {
            field: 'fechaInicio',
            headerName: 'Fecha Inicio',
            width: 120,
            sortable: true,
        },
        {
            field: 'dias',
            headerName: 'Días vacaciones',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            sortable: true,
        },
        {
            field: 'fechaFin',
            headerName: 'Fecha Fin',
            width: 120,
            sortable: true,
        },
        {
            field: 'fechaReintegro',
            headerName: 'Fecha reintegro',
            width: 140,
            sortable: true,
        },
        {
            field: 'observaciones',
            headerName: 'Observaciones',
            width: 140,
            sortable: false,
            renderCell: (params) => {
                const obs = params.value || '';
                if (!obs) return <Typography variant="body2" color="text.disabled">—</Typography>;
                return (
                    <Tooltip title={obs} arrow>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={(event) => {
                                event.stopPropagation();
                                setObservacionesAbierta(obs);
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                );
            },
        },
        {
            field: 'imprimir',
            headerName: 'Imprimir',
            width: 100,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const row = params.row;
                const imprimiendo = imprimiendoId === row.idPermiso;
                return (
                    <Tooltip title="Imprimir PDF">
                        <IconButton
                            size="small"
                            color="secondary"
                            disabled={imprimiendo || loading}
                            onClick={(event) => {
                                event.stopPropagation();
                                onImprimir?.(row);
                            }}
                        >
                            {imprimiendo ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <PrintIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                );
            },
        },
        ...(esEnEspera
            ? [
                {
                    field: 'acciones',
                    headerName: 'Acciones',
                    width: 150,
                    sortable: false,
                    align: 'center',
                    headerAlign: 'center',
                    renderCell: (params) => {
                        const row = params.row;
                        const accionando = accionandoId === row.idPermiso;
                        return (
                            <Stack direction="row" spacing={0.5}>
                                {row.puedeAprobar && (
                                    <Tooltip title="Aprobar">
                                        <IconButton
                                            size="small"
                                            color="success"
                                            disabled={accionando || loading}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onAprobar?.(row);
                                            }}
                                        >
                                            {accionando ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : (
                                                <CheckIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {row.puedeRechazar && (
                                    <Tooltip title="Rechazar">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            disabled={accionando || loading}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onRechazar?.(row);
                                            }}
                                        >
                                            <CancelIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {row.puedeReversar && (
                                    <Tooltip title="Reversar">
                                        <IconButton
                                            size="small"
                                            color="warning"
                                            disabled={accionando || loading}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onReversar?.(row);
                                            }}
                                        >
                                            <ReplayIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        );
                    },
                },
            ]
            : []),
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            scroll="body"
        >
            <DialogTitle sx={{ pr: 6 }}>
                <Typography variant="h6" fontWeight={700} noWrap>
                    {nombre || 'Vacaciones del usuario'}
                </Typography>
                <IconButton
                    aria-label="Cerrar"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Botones de filtro por estado */}
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 2 }}
                >
                    {FILTROS.map((f) => (
                        <Button
                            key={f.id}
                            size="small"
                            variant={estadoActivo === f.id ? 'contained' : 'outlined'}
                            color={
                                estadoActivo === f.id
                                    ? f.id === ESTADO_VACACIONES.APROBADO
                                        ? 'success'
                                        : f.id === ESTADO_VACACIONES.RECHAZADO
                                            ? 'error'
                                            : f.id === ESTADO_VACACIONES.FINALIZADO
                                                ? 'info'
                                                : 'primary'
                                    : 'inherit'
                            }
                            onClick={() => onCambiarEstado?.(f.id, f.lider)}
                        >
                            {f.label}
                        </Button>
                    ))}
                </Stack>

                <Box
                    sx={{
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.paper,
                        },
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme.palette.action.hover,
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                            p: 1,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                >
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id ?? row.idPermiso ?? `${row.fechaCreacion}-${row.motivo}`}
                        autoHeight
                        density="compact"
                        disableRowSelectionOnClick
                        localeText={SPANISH_LOCALE}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        slots={{
                            toolbar: () => (
                                <Stack direction="row" alignItems="center" sx={{ p: 1 }}>
                                    <GridToolbar
                                        showQuickFilter
                                        quickFilterProps={{ debounceMs: 300 }}
                                        showColumnSelector={false}
                                        showFilterList={false}
                                        showDensitySelector={false}
                                        showExport={false}
                                    />
                                </Stack>
                            ),
                            noRowsOverlay: () => (
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ height: '100%', py: 4 }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No hay datos disponibles
                                    </Typography>
                                </Stack>
                            ),
                            noResultsOverlay: () => (
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ height: '100%', py: 4 }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No se encontraron resultados
                                    </Typography>
                                </Stack>
                            ),
                        }}
                        slotProps={{
                            pagination: {
                                labelRowsPerPage: 'Filas por página:',
                            },
                        }}
                        sx={{
                            '& .MuiDataGrid-footerContainer': {
                                justifyContent: 'flex-start',
                            },
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>

            {/* Modal de observaciones */}
            <Dialog
                open={Boolean(observacionesAbierta)}
                onClose={() => setObservacionesAbierta(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ pr: 6 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Observaciones
                    </Typography>
                    <IconButton
                        aria-label="Cerrar"
                        onClick={() => setObservacionesAbierta(null)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {observacionesAbierta}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setObservacionesAbierta(null)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
}
