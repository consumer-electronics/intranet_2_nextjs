'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// TODO: si el proyecto ya envuelve la app en un <LocalizationProvider> global,
// eliminar el de este componente.

export default function EntregadosDialog({ open, onClose, rows, loading, onBuscar }) {
  const [fechaInicial, setFechaInicial] = useState(dayjs());
  const [fechaFinal, setFechaFinal] = useState(dayjs());

  const handleBuscar = () => {
    onBuscar(fechaInicial.format('YYYY-MM-DD'), fechaFinal.format('YYYY-MM-DD'));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        Carnets entregados
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <DatePicker label="Fecha inicial" value={fechaInicial} onChange={setFechaInicial} format="DD/MM/YYYY" />
            <DatePicker label="Fecha final" value={fechaFinal} onChange={setFechaFinal} format="DD/MM/YYYY" />
          </Stack>
        </LocalizationProvider>

        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Button variant="contained" color="secondary" startIcon={<SearchIcon />} onClick={handleBuscar}>
            Buscar
          </Button>
        </Stack>

        <TableContainer component={Paper} variant="outlined">
          {loading && <LinearProgress />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Visitante</TableCell>
                <TableCell align="center">N° Carné</TableCell>
                <TableCell align="center">Fecha Entrega</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center">{row.guest_name}</TableCell>
                  <TableCell align="center">{row.carnet_number}</TableCell>
                  <TableCell align="center">{row.date}</TableCell>
                  <TableCell align="center">Entregado</TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No hay datos disponibles en la tabla
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
