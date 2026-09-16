'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Modal de confirmación que se muestra antes de registrar
 * la entrega de un carné a un visitante.
 *
 * Props:
 *  - open       {boolean}   Controla la visibilidad del modal.
 *  - onClose    {function}  Cierra sin confirmar.
 *  - onConfirm  {function}  Ejecuta la entrega.
 *  - visitante  {string}    Nombre del visitante a mostrar en el mensaje.
 *  - loading    {boolean}   Deshabilita los botones mientras se procesa.
 */
export default function ConfirmarEntregaDialog({
  open,
  onClose,
  onConfirm,
  visitante,
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Confirmar entrega de carné
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 1,
          }}
        >
          <Box
            sx={(theme) => ({
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(76, 175, 80, 0.15)'
                  : '#E8F5E9',
            })}
          >
            <CreditCardIcon
              sx={{ fontSize: 32 }}
              color="success"
            />
          </Box>

          <DialogContentText align="center">
            ¿Confirmas la entrega del carné al visitante{' '}
            <Typography
              component="span"
              fontWeight={700}
              color="text.primary"
            >
              {visitante ?? '—'}
            </Typography>
            ?
          </DialogContentText>

          <DialogContentText
            align="center"
            variant="body2"
            color="text.secondary"
          >
            Esta acción quedará registrada en el sistema y no
            podrá deshacerse.
          </DialogContentText>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
          disabled={loading}
          fullWidth
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircleOutlineIcon />}
          onClick={onConfirm}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Registrando…' : 'Confirmar entrega'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
