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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';

import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Tabla de visitantes activos.
 *
 * Props:
 *  - rows               {Array}    Datos del servidor.
 *  - loading            {boolean}  Muestra barra de progreso.
 *  - onSolicitarEntregar {function} Solicita confirmación en la vista padre.
 *  - onVerPersona       {function} Abre el diálogo de datos personales.
 */
export default function VisitantesTable({
  rows,
  loading,
  onSolicitarEntregar,
  onVerPersona,
}) {
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((row) =>
      [
        row.guest_name,
        row.carnet_number,
        row.guest_form?.identification,
        row.area,
        row.name_host,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [rows, search]);

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const data = filteredRows.map((row) => ({
      Visitante: row.guest_name,
      'N° Carné': row.carnet_number,
      Cédula: row.guest_form?.identification,
      'Área a visitar': capitalizeFirstLetter(row.area),
      'Persona a visitar': row.name_host,
      Estado: row.state === 2 ? 'Entregado' : 'Sin entregar',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitantes');
    XLSX.writeFile(workbook, 'visitantes.xlsx');
  };

  return (
    <Stack spacing={1.5}>
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
          placeholder="Buscar visitante…"
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
              <TableCell align="center">Visitante</TableCell>
              <TableCell align="center">N° Carné</TableCell>
              <TableCell align="center">Cédula</TableCell>
              <TableCell align="center">Área a visitar</TableCell>
              <TableCell align="center">Persona a visitar</TableCell>
              <TableCell align="center">Carné</TableCell>
              <TableCell align="center">Datos persona</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell align="center">
                  {row.guest_name}
                </TableCell>
                <TableCell align="center">
                  {row.carnet_number}
                </TableCell>
                <TableCell align="center">
                  {row.guest_form?.identification}
                </TableCell>
                <TableCell align="center">
                  {capitalizeFirstLetter(row.area)}
                </TableCell>
                <TableCell align="center">
                  {row.name_host}
                </TableCell>

                {/* Columna carné: Chip interactivo */}
                <TableCell align="center">
                  {row.state === 2 ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Entregado"
                      color="success"
                      size="small"
                      variant="filled"
                    />
                  ) : (
                    <Tooltip title="Registrar entrega del carné">
                      <Chip
                        icon={<CreditCardIcon />}
                        label="Recibir carné"
                        color="warning"
                        size="small"
                        variant="outlined"
                        clickable
                        onClick={() => onSolicitarEntregar(row)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Tooltip>
                  )}
                </TableCell>

                {/* Datos persona */}
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Tooltip title="Ver datos del visitante">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() =>
                          onVerPersona({
                            nombre: row.guest_name,
                            ...row.guest_form,
                          })
                        }
                      >
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {row.guest_form?.computer === 'si' && (
                      <Tooltip
                        title={`${row.guest_form.brand} — ${row.guest_form.serial}`}
                      >
                        <LaptopMacIcon
                          fontSize="small"
                          color="success"
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 3 }}
                  >
                    No se encontraron registros
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
