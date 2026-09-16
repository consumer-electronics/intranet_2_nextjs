'use client';

import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import { gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid/hooks';
import { esES } from '@mui/x-data-grid/locales';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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
 * Tabla de certificados laborales basada en MUI DataGrid.
 *
 * Props:
 *  - rows          {Array}    Filas a mostrar (funcionarios activos).
 *  - loading       {boolean}  Muestra el estado de carga.
 *  - onView        {function} Callback al pulsar "Ver certificado" (recibe la fila).
 *  - onDownload    {function} Callback al pulsar "Descargar" (recibe la fila).
 *  - exportName    {string}   Nombre base del archivo Excel.
 *
 * Ref expuesto:
 *  - triggerExport()  → descarga el Excel respetando filtros/orden actuales.
 *  - isExporting      → boolean del estado de exportación.
 */
const CertificadosLaboralesTable = forwardRef(function CertificadosLaboralesTable(
    {
        rows,
        loading,
        onView,
        onDownload,
        exportName = 'certificados-laborales',
    },
    ref
) {
    const theme = useTheme();
    const apiRef = useGridApiRef();
    const [exporting, setExporting] = useState(false);

    const columns = useMemo(
        () => [
            {
                field: 'fun_nombre_completo',
                headerName: 'Nombre',
                flex: 2,
                minWidth: 220,
                sortable: true,
                filterable: true,
            },
            {
                field: 'fun_identificacion',
                headerName: 'Identificación',
                flex: 1,
                minWidth: 130,
                sortable: true,
                filterable: true,
            },
            {
                field: 'car_tag',
                headerName: 'Cargo',
                flex: 1.5,
                minWidth: 180,
                sortable: true,
                filterable: true,
            },
            {
                field: 'dep_tag',
                headerName: 'Dependencia',
                flex: 1.5,
                minWidth: 180,
                sortable: true,
                filterable: true,
            },
            {
                field: 'fun_correo',
                headerName: 'Correo',
                flex: 1.5,
                minWidth: 200,
                sortable: true,
                filterable: true,
            },
            {
                field: '__acciones__',
                headerName: 'Acciones',
                width: 110,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params) => (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Ver certificado">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onView?.(params.row);
                                }}
                                aria-label="Ver certificado"
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Descargar PDF">
                            <IconButton
                                size="small"
                                color="secondary"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDownload?.(params.row);
                                }}
                                aria-label="Descargar certificado"
                            >
                                <FileDownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ),
            },
        ],
        [onView, onDownload]
    );

    /**
     * Descarga un archivo .xlsx respetando el orden y los filtros actuales
     * del DataGrid. Las columnas se mapean usando col.headerName como
     * encabezado y col.field como fuente del dato.
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
                    if (!col.field || col.field === '__acciones__') return;
                    let value = row[col.field];
                    if (Array.isArray(value)) value = value.join(', ');
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
            }}
        >
            <DataGrid
                apiRef={apiRef}
                rows={rows}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id ?? row.fun_id ?? `${row.fun_nombre_completo}-${row.fun_identificacion}`}
                autoHeight
                density="compact"
                disableRowSelectionOnClick
                localeText={SPANISH_LOCALE}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[10, 25, 50]}
                slots={{
                    // La búsqueda por nombre/identificación/cargo se realiza en el
                    // encabezado de la vista; aquí solo se conserva el botón de
                    // filtros por columna. El botón Excel vive en el padre.
                    toolbar: () => (
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ p: 1 }}
                        >
                            <GridToolbar
                                showQuickFilter={false}
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

export default CertificadosLaboralesTable;
