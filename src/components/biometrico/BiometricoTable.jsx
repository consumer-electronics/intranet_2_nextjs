'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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

/**
 * Tabla de control biométrico basada en MUI DataGrid.
 *
 * Props:
 *  - rows         {Array}    Filas a mostrar.
 *  - loading      {boolean}  Muestra el estado de carga.
 *  - columns      {Array}    Definición de columnas (campo, headerName, etc.).
 *  - onRowClick   {function} Callback al hacer clic en una fila (opcional).
 *  - exportName   {string}   Nombre base del archivo Excel.
 *  - autoRowHeight {boolean} Si true, la altura de fila se adapta al contenido.
 *
 * Ref expuesto:
 *  - triggerExport()  → descarga el Excel respetando filtros/orden actuales.
 *  - isExporting      → boolean del estado de exportación.
 */
const BiometricoTable = forwardRef(function BiometricoTable(
    {
        rows,
        loading,
        columns,
        onRowClick,
        exportName = 'control-biometrico',
        autoRowHeight = false,
    },
    ref
) {
    const theme = useTheme();
    const apiRef = useGridApiRef();
    const [exporting, setExporting] = useState(false);

    /**
     * Descarga un archivo .xlsx respetando el orden y los filtros actuales
     * del DataGrid. Las columnas se mapean usando col.headerName como
     * encabezado y col.field como fuente del dato. Los arrays (p.ej. horas)
     * se aplanan a cadena separada por coma para que el Excel sea legible.
     */
    const triggerExport = useCallback(async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const XLSX = await import('xlsx');

            // Usa las filas filtradas/ordenadas del DataGrid si están disponibles
            let source = rows;
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
                    if (!col.field || col.field === '__check__') return;
                    let value = row[col.field];
                    // Aplana arrays (p.ej. horas: ['08:00', '12:00'])
                    if (Array.isArray(value)) value = value.join(', ');
                    // Limpia valores nulos/undefined
                    flat[col.headerName || col.field] = value ?? '';
                });
                return flat;
            });

            const worksheet = XLSX.utils.json_to_sheet(data);

            // Ajusta el ancho de columnas automáticamente
            const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
                wch: Math.max(
                    key.length,
                    ...data.map((row) => String(row[key] ?? '').length)
                ) + 2,
            }));
            worksheet['!cols'] = colWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
            XLSX.writeFile(workbook, `${exportName}.xlsx`);
        } finally {
            setExporting(false);
        }
    }, [rows, columns, exportName, apiRef, exporting]);

    // Expone triggerExport e isExporting al componente padre via ref
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
                // Cursor pointer en filas cuando hay handler de clic
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
                getRowId={(row) =>
                    row.id ?? row.idUsuario ?? `${row.nombre}-${row.fecha}-${row.hora}`
                }
                autoHeight
                getRowHeight={autoRowHeight ? () => 'auto' : undefined}
                density="compact"
                disableRowSelectionOnClick
                localeText={SPANISH_LOCALE}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[10, 25, 50]}
                slots={{
                    // Solo el buscador rápido; el botón Excel queda en el padre
                    toolbar: () => (
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ p: 1 }}
                        >
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
                        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                No hay datos disponibles
                            </Typography>
                        </Stack>
                    ),
                    noResultsOverlay: () => (
                        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4 }}>
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

export default BiometricoTable;
