'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

// TODO: si el proyecto ya envuelve la app en un <LocalizationProvider> global,
// eliminar el de este componente para no anidarlo innecesariamente.

export default function FinalizarPermisoDialog({ open, onClose, onSubmit }) {
  const [hora, setHora] = useState(dayjs());
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hora || !hora.isValid()) return;
    setSubmitting(true);
    try {
      await onSubmit(hora.format('hh:mm A'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Finalizar Permiso
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Hora de llegada"
              value={hora}
              onChange={setHora}
              sx={{ width: '100%' }}
              slotProps={{ textField: { required: true } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button type="submit" variant="contained" color="success" startIcon={<SendIcon />} disabled={submitting}>
            Finalizar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
