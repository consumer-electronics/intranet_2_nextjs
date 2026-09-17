'use client';

import { forwardRef, useCallback, useImperativeHandle, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import { gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid/hooks';
import { esES } from '@mui/x-data-grid/locales';

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

/* ─────────────────────────────────────────────────────────────
 * Formateadores (replican la lógica del archivo legacy
 * `solicitud_permisos_registro.php`).
 * ───────────────────────────────────────────────────────────── */

/** Convierte minutos a "HH:mm" (p.ej. 90 → "01:30"). */
function minutosAHorasyminutos(mins) {
    const n = Number(mins);
    if (Number.isNaN(n) || n < 0) return '';
    const h = Math.floor(n / 60);
    const m = Math.floor(n % 60);
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
}

/** Formatea una hora "HH:mm:ss" o "HH:mm" a formato 12h "hh:mm a". */
function formatHora(hora) {
    if (!hora) return '';
    const match = String(hora).match(/(\d{1,2}):(\d{2})/);
    if (!match) return String(hora);
    let h = Number(match[1]);
    const m = match[2];
    const suffix = h >= 12 ? 'p. m.' : 'a. m.';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${suffix}`;
}

/** Extrae solo la fecha (YYYY-MM-DD) de un valor fecha/hora. */
function formatFecha(valor) {
    if (!valor) return '';
    return String(valor).split(' ')[0];
}

/** Mapea el valor de reposición a su etiqueta. */
function formatReposicion(valor) {
    if (valor === null || valor === undefined || valor === '') return 'N/A';
    if (Number(valor) === 1) return 'Reposición en tiempo';
    return 'No remunerado';
}

/**
 * Tabla de "Registro de permisos por fecha" basada en MUI DataGrid.
 *
 * Props:
 *  - rows        {Array}   Filas normalizadas (con `codigo`, `persona`, etc.).
 *  - loading     {boolean} Estado de carga.
 *  - exportName  {string}  Nombre base del archivo Excel.
 *  - mostrarNoRemunerados {boolean} Si true, filtra solo "No remunerado".
 *
 * Ref expuesto:
 *  - triggerExport() → descarga el Excel respetando filtros/orden actuales.
 */
const RegistroTable = forwardRef(function RegistroTable(
    { rows, loading, exportName = 'registro-permisos', mostrarNoRemunerados = false },
    ref
) {
    const theme = useTheme();
    const apiRef = useGridApiRef();
    const [exporting, setExporting] = useState(false);

    // Cuando el switch "Mostrar no remunerados" está activo, se filtran
    // únicamente las filas cuya reposición es "No remunerado".
    const visibleRows = mostrarNoRemunerados
        ? rows.filter((row) => formatReposicion(row.sp_reposicion) === 'No remunerado')
        : rows;

    const columns = useMemo(() => [
        {
            field: 'persona',
            headerName: 'Persona',
            flex: 1.6,
            minWidth: 180,
        },
        {
            field: 'codigo',
            headerName: 'Identificación',
            flex: 1,
            minWidth: 110,
        },
        {
            field: 'area',
            headerName: 'Área',
            flex: 1,
            minWidth: 120,
        },
        {
            field: 'reposicion',
            headerName: 'Reposición',
            flex: 1.2,
            minWidth: 150,
            valueGetter: (value) => formatReposicion(value),
        },
        {
            field: 'fechaInicio',
            headerName: 'Fecha Inicio',
            flex: 1,
            minWidth: 110,
            valueGetter: (value, row) => formatFecha(row.sp_fecha_inicio),
        },
        {
            field: 'horaInicio',
            headerName: 'Hora Inicio',
            flex: 0.9,
            minWidth: 100,
            valueGetter: (value, row) => formatHora(row.sp_hora_inicio),
        },
        {
            field: 'fechaFin',
            headerName: 'Fecha Fin',
            flex: 1,
            minWidth: 110,
            valueGetter: (value, row) => formatFecha(row.sp_fecha_fin),
        },
        {
            field: 'horaFin',
            headerName: 'Hora Fin',
            flex: 0.9,
            minWidth: 100,
            valueGetter: (value, row) => formatHora(row.sp_hora_llegada),
        },
        {
            field: 'tiempo',
            headerName: 'Tiempo',
            flex: 0.8,
            minWidth: 90,
            valueGetter: (value, row) => minutosAHorasyminutos(row.tiempo),
        },
        {
            field: 'observaciones',
            headerName: 'Observaciones',
            flex: 1.6,
            minWidth: 180,
            renderCell: (params) => {
                const texto = params.row.sp_observaciones || '';
                return (
                    <Tooltip title={texto} arrow>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ width: '100%', cursor: 'default' }}
                        >
                            {texto}
                        </Typography>
                    </Tooltip>
                );
            },
        },
        {
            field: 'autorizo',
            headerName: 'Autorizó',
            flex: 1.2,
            minWidth: 140,
        },
    ], []);

    /**
     * Descarga un archivo .xlsx respetando el orden y los filtros actuales.
     */
    const triggerExport = useCallback(async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const XLSX = await import('xlsx');

            let source = visibleRows;
            if (apiRef.current) {
                const ids = gridFilteredSortedRowIdsSelector(apiRef.current.state);
                const filtered = ids
                    .map((id) => apiRef.current?.getRow?.(id))
                    .filter(Boolean);
                if (filtered.length > 0) source = filtered;
            }

            const data = source.map((row) => {
                const flat = {};
                columns.forEach((col) => {
                    if (!col.field) return;
                    let value;
                    if (col.valueGetter) {
                        value = col.valueGetter(undefined, row);
                    } else {
                        value = row[col.field];
                    }
                    flat[col.headerName || col.field] = value ?? '';
                });
                return flat;
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
                wch:
                    Math.max(
                        key.length,
                        ...data.map((r) => String(r[key] ?? '').length)
                    ) + 2,
            }));
            worksheet['!cols'] = colWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Registro');
            XLSX.writeFile(workbook, `${exportName}.xlsx`);
        } finally {
            setExporting(false);
        }
    }, [visibleRows, columns, exportName, apiRef, exporting]);

    useImperativeHandle(
        ref,
        () => ({ triggerExport, isExporting: exporting }),
        [triggerExport, exporting]
    );

    return (
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
                apiRef={apiRef}
                rows={visibleRows}
                columns={columns}
                loading={loading}
                getRowId={(row) =>
                    row.id ??
                    `${row.persona}-${row.sp_fecha_inicio}-${row.sp_hora_inicio}-${row.codigo}`
                }
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
    );
});

export default RegistroTable;
