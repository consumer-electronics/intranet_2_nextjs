'use client';

import { useMemo, useState } from 'react';
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
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';

function formatHora(hora) {
  // La API entrega "HH:mm:ss" -> se muestra como "hh:mm A" (igual que moment() en el original)
  if (!hora) return '';
  const [h, m] = hora.split(':');
  const hourNum = parseInt(h, 10);
  const suffix = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = ((hourNum + 11) % 12) + 1;
  return `${String(hour12).padStart(2, '0')}:${m} ${suffix}`;
}

/**
 * Tabla de permisos aprobados.
 * La columna "Finalizar" fue eliminada según solicitud (ver FinalizarPermisoDialog
 * que queda en el código por si se reactiva en el futuro).
 *
 * Props:
 *  - rows    {Array}   Datos del servidor.
 *  - loading {boolean} Muestra barra de progreso.
 */
export default function PermisosTable({ rows, loading }) {
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((row) =>
      [row.fun_nombre_completo, row.sp_fecha_inicio, row.sp_fecha_fin]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [rows, search]);

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const data = filteredRows.map((row) => ({
      Funcionario: row.fun_nombre_completo,
      'Fecha Inicio': row.sp_fecha_inicio,
      'Hora Inicio': formatHora(row.sp_hora_inicio),
      'Fecha Fin': row.sp_fecha_fin,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Permisos');
    XLSX.writeFile(workbook, 'permisos-aprobados.xlsx');
  };

  return (
    <Stack spacing={2}>
      {/* Barra de herramientas */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Button
          startIcon={<FileDownloadIcon />}
          size="small"
          variant="outlined"
          color="success"
          onClick={handleExport}
        >
          Exportar Excel
        </Button>

        <TextField
          size="small"
          placeholder="Buscar funcionario…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      {/* Tabla */}
      <TableContainer component={Paper} variant="outlined">
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
            {filteredRows.map((row) => (
              <TableRow
                key={
                  row.sp_id ??
                  `${row.fun_nombre_completo}-${row.sp_fecha_inicio}`
                }
                hover
              >
                <TableCell>{row.fun_nombre_completo}</TableCell>
                <TableCell align="center">
                  {row.sp_fecha_inicio}
                </TableCell>
                <TableCell align="center">
                  {formatHora(row.sp_hora_inicio)}
                </TableCell>
                <TableCell align="center">
                  {row.sp_fecha_fin}
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredRows.length === 0 && (
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
    </Stack>
  );
}
