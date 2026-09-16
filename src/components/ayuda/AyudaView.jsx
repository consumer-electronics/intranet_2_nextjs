'use client';

import { Box, Paper, Typography } from '@mui/material';

import VideoBrowser from './VideoBrowser';

/**
 * Vista principal de la sección Ayuda.
 * Renderiza el explorador de videos instructivos dentro de
 * un Paper con borde, siguiendo el mismo patrón que InfoDocumentadaView.
 */
export default function AyudaView() {
    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" component="h1">
                    Videos instructivos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Navega las carpetas y selecciona un video para reproducirlo.
                </Typography>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <VideoBrowser active />
            </Box>
        </Paper>
    );
}
