'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function PersonaDialog({ open, onClose, persona }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle>{persona?.nombre || ''}</DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Empresa</TableCell>
                <TableCell align="center">EPS</TableCell>
                <TableCell align="center">ARL</TableCell>
                <TableCell align="center">Tipo sangre</TableCell>
                <TableCell align="center">Número emergencia</TableCell>
                <TableCell align="center">Contacto emergencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">{persona?.company}</TableCell>
                <TableCell align="center">{persona?.eps}</TableCell>
                <TableCell align="center">{persona?.arl}</TableCell>
                <TableCell align="center">{persona?.blood_type}</TableCell>
                <TableCell align="center">{persona?.emergency_number}</TableCell>
                <TableCell align="center">{persona?.emergency_contact}</TableCell>
              </TableRow>
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
