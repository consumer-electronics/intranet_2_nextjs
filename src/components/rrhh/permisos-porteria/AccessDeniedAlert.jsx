'use client';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

// Equivalente al `window.location.href = "index.php"` del original cuando
// la validación de permiso ('permiso_fun_app') falla.
export default function AccessDeniedAlert() {
  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8 }}>
      <Alert severity="error" variant="filled">
        <AlertTitle>Acceso no autorizado</AlertTitle>
        No tienes permiso para acceder a este módulo.
      </Alert>
    </Box>
  );
}
