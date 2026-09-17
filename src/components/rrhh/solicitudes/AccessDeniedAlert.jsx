'use client';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

/**
 * Mensaje mostrado cuando el usuario no tiene acceso al módulo.
 */
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
