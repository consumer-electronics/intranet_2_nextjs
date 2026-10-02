'use client';

import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';

function formatHora(hora) {
  // La API entrega "HH:mm:ss" -> se muestra como "hh:mm A" (igual que moment() en el original)
  if (!hora) return '';
  const [h, m] = hora.split(':');
  const hourNum = parseInt(h, 10);
  const suffix = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = ((hourNum + 11) % 12) + 1;
  return `${String(hour12).padStart(2, '0')}:${m} ${suffix}`;
}

function formatFecha(fecha) {
  if (!fecha) return '';
  const cleanDate = String(fecha).split('T')[0].split(' ')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day}/${month}/${year}`;
    }
  }
  return fecha;
}

/**
 * Tabla de permisos aprobados.
 * La columna "Finalizar" fue eliminada según solicitud (ver FinalizarPermisoDialog
 * que queda en el código por si se reactiva en el futuro).
 *
 * Props:
 *  - rows    {Array}   Datos del servidor.
 *  - loading {boolean} Muestra barra de progreso.
 *  - search  {string}  Texto de búsqueda.
 */
const PermisosTable = forwardRef(({ rows, loading, search = '' }, ref) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((row) =>
      [
        row.fun_nombre_completo,
        row.sp_fecha_inicio,
        formatFecha(row.sp_fecha_inicio),
        row.sp_fecha_fin,
        formatFecha(row.sp_fecha_fin),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [rows, search]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const data = filteredRows.map((row) => ({
      Funcionario: row.fun_nombre_completo,
      'Fecha Inicio': formatFecha(row.sp_fecha_inicio),
      'Hora Inicio': formatHora(row.sp_hora_inicio),
      'Fecha Fin': formatFecha(row.sp_fecha_fin),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Permisos');
    XLSX.writeFile(workbook, 'permisos-aprobados.xlsx');
  };

  useImperativeHandle(ref, () => ({
    handleExport,
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={2}>
      {/* Tabla */}
      <Paper variant="outlined">
        <TableContainer>
          {loading && <LinearProgress />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Funcionario</TableCell>
                <TableCell align="center">Fecha Inicio</TableCell>
                <TableCell align="center">Hora Inicio</TableCell>
                <TableCell align="center">Fecha Fin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow
                  key={
                    row.sp_id ??
                    `${row.fun_nombre_completo}-${row.sp_fecha_inicio}`
                  }
                  hover
                >
                  <TableCell>{row.fun_nombre_completo}</TableCell>
                  <TableCell align="center">
                    {formatFecha(row.sp_fecha_inicio)}
                  </TableCell>
                  <TableCell align="center">
                    {formatHora(row.sp_hora_inicio)}
                  </TableCell>
                  <TableCell align="center">
                    {formatFecha(row.sp_fecha_fin)}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 3 }}
                    >
                      No hay datos disponibles en la tabla
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Stack>
  );
});

PermisosTable.displayName = 'PermisosTable';
export default PermisosTable;
