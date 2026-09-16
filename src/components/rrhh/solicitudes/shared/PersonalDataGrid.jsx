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

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * Traducción completa del DataGrid al español.
 * Centralizada aquí para no duplicar en múltiples componentes.
 */
export const SPANISH_LOCALE = {
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
 * DataGrid unificado de personal para los módulos de Permisos y Vacaciones.
 *
 * Props:
 *  - rows        {Array}              Filas del personal.
 *  - loading     {boolean}            Estado de carga.
 *  - onRowClick  {function(row)}      Callback al hacer clic en una fila.
 *  - exportName  {string}             Nombre base del archivo Excel.
 *  - mode        {'permisos'|'vacaciones'}  Determina columnas y export.
 *
 * Ref expuesto:
 *  - triggerExport() → descarga Excel respetando filtros/orden actuales.
 */
const PersonalDataGrid = forwardRef(function PersonalDataGrid(
    { rows, loading, onRowClick, exportName = 'personal', mode = 'permisos' },
    ref
) {
    const theme = useTheme();
    const apiRef = useGridApiRef();
    const [exporting, setExporting] = useState(false);

    const esVacaciones = mode === 'vacaciones';

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

            const data = esVacaciones
                ? source.map((row) => ({
                      Nombre: row.nombre ?? '',
                      'Solicitudes de vacaciones': row.solicitudesVacaciones ?? '',
                  }))
                : source.map((row) => ({
                      Nombre: row.nombre ?? '',
                      'Permisos pendientes': row.permisosPendientes ?? '',
                      'Carta de retiro': row.cartaRenuncia ?? '',
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
    }, [rows, exportName, apiRef, exporting, esVacaciones]);

    useImperativeHandle(
        ref,
        () => ({ triggerExport, isExporting: exporting }),
        [triggerExport, exporting]
    );

    /* ── Columna de conteo pendientes (compartida lógica, label diferente) ── */
    const columnConteo = esVacaciones
        ? {
              field: 'solicitudesVacaciones',
              headerName: 'Solicitudes pendientes',
              width: 190,
              align: 'center',
              headerAlign: 'center',
              sortable: true,
              renderCell: (params) => {
                  const num = Number(params.value);
                  const esNumero = params.value !== '' && !Number.isNaN(num);
                  return (
                      <Chip
                          size="small"
                          label={esNumero ? String(num) : '—'}
                          color={esNumero && num > 0 ? 'warning' : 'default'}
                          variant={esNumero && num > 0 ? 'filled' : 'outlined'}
                      />
                  );
              },
          }
        : {
              field: 'permisosPendientes',
              headerName: 'Permisos pendientes',
              width: 170,
              align: 'center',
              headerAlign: 'center',
              sortable: true,
              renderCell: (params) => {
                  const num = Number(params.value);
                  const esNumero = params.value !== '' && !Number.isNaN(num);
                  return (
                      <Chip
                          size="small"
                          label={esNumero ? String(num) : '—'}
                          color={esNumero && num > 0 ? 'warning' : 'default'}
                          variant={esNumero && num > 0 ? 'filled' : 'outlined'}
                      />
                  );
              },
          };

    const columns = [
        {
            field: 'nombre',
            headerName: 'Nombre',
            flex: 1,
            minWidth: 220,
            sortable: true,
        },
        columnConteo,
        ...(!esVacaciones
            ? [
                  {
                      field: 'cartaRenuncia',
                      headerName: 'Carta de retiro',
                      width: 150,
                      align: 'center',
                      headerAlign: 'center',
                      sortable: true,
                      renderCell: (params) => {
                          const tiene = String(params.value ?? '')
                              .toLowerCase()
                              .includes('sí');
                          return (
                              <Chip
                                  size="small"
                                  label={tiene ? 'Sí' : 'No'}
                                  color={tiene ? 'success' : 'default'}
                                  variant={tiene ? 'filled' : 'outlined'}
                              />
                          );
                      },
                  },
              ]
            : []),
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Tooltip title={esVacaciones ? 'Ver vacaciones' : 'Ver permisos'}>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRowClick?.(params.row);
                        }}
                        aria-label={esVacaciones ? 'Ver vacaciones' : 'Ver permisos'}
                    >
                        <OpenInNewIcon fontSize="small" />
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

export default PersonalDataGrid;
