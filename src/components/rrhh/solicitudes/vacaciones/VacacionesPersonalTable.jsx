'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import { gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid/hooks';
import { esES } from '@mui/x-data-grid/locales';

import LogoutIcon from '@mui/icons-material/Logout';

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
 * Tabla de personal para el módulo de vacaciones
 * (Personal a cargo / Todo el personal).
 *
 * Props:
 *  - rows        {Array}    Filas: { id, idUsuario, nombre, solicitudesVacaciones }.
 *  - loading     {boolean}  Estado de carga.
 *  - onRowClick  {function} Callback al hacer clic en una fila (abre vacaciones del usuario).
 *  - exportName  {string}   Nombre base del archivo Excel.
 *
 * Ref expuesto:
 *  - triggerExport() → descarga el Excel respetando filtros/orden actuales.
 */
const VacacionesPersonalTable = forwardRef(function VacacionesPersonalTable(
    { rows, loading, onRowClick, exportName = 'personal-vacaciones' },
    ref
) {
    const theme = useTheme();
    const apiRef = useGridApiRef();
    const [exporting, setExporting] = useState(false);

    const triggerExport = useCallback(async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const XLSX = await import('xlsx');

            let source = rows;
            if (apiRef.current) {
                const ids = gridFilteredSortedRowIdsSelector(apiRef.current.state);
                const filtered = ids
                    .map((id) => apiRef.current?.getRow?.(id))
                    .filter(Boolean);
                if (filtered.length > 0) source = filtered;
            }

            const data = source.map((row) => ({
                Nombre: row.nombre ?? '',
                'Solicitudes de vacaciones': row.solicitudesVacaciones ?? '',
            }));

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
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Personal');
            XLSX.writeFile(workbook, `${exportName}.xlsx`);
        } finally {
            setExporting(false);
        }
    }, [rows, exportName, apiRef, exporting]);

    useImperativeHandle(
        ref,
        () => ({ triggerExport, isExporting: exporting }),
        [triggerExport, exporting]
    );

    const columns = [
        {
            field: 'nombre',
            headerName: 'Nombre',
            flex: 1,
            minWidth: 220,
            sortable: true,
        },
        {
            field: 'solicitudesVacaciones',
            headerName: 'Solicitudes de vacaciones',
            width: 210,
            align: 'center',
            headerAlign: 'center',
            sortable: true,
            renderCell: (params) => {
                const value = params.value;
                const num = Number(value);
                const esNumero = value !== '' && !Number.isNaN(num);
                return (
                    <Chip
                        size="small"
                        label={esNumero ? String(num) : '—'}
                        color={esNumero && num > 0 ? 'warning' : 'default'}
                        variant={esNumero && num > 0 ? 'filled' : 'outlined'}
                    />
                );
            },
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="Ver vacaciones">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRowClick?.(params.row);
                        }}
                    >
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

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
                ...(onRowClick && {
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: theme.palette.action.selected,
                    },
                }),
            }}
        >
            <DataGrid
                apiRef={apiRef}
                rows={rows}
                columns={columns}
                loading={loading}
                onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
                getRowId={(row) => row.id ?? row.idUsuario ?? row.nombre}
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

export default VacacionesPersonalTable;
