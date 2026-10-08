'use client';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';

/**
 * Visor de documentos PDF usando el visor nativo del navegador (iframe).
 *
 * Props:
 * - src {string}       URL del PDF (ya procesada, puede ser del proxy interno).
 * - title {string}     Título del documento (accesibilidad).
 * - originalSrc        URL original para el botón "abrir en pestaña nueva".
 */
export default function PdfViewer({ src, title, originalSrc }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = () => setLoading(false);
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && !error && (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'background.default',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress size={36} />
                    <Typography variant="body2" color="text.secondary">
                        Cargando documento...
                    </Typography>
                </Stack>
            )}

            {error ? (
                <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ p: 4, height: '100%' }}>
                    <Alert severity="warning" variant="outlined" sx={{ width: '100%', maxWidth: 520 }}>
                        No fue posible mostrar el documento en el visor integrado.
                    </Alert>
                    {originalSrc && (
                        <Button
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            href={originalSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Abrir en pestaña nueva
                        </Button>
                    )}
                </Stack>
            ) : (
                <Box
                    component="iframe"
                    src={src}
                    title={title || 'Documento PDF'}
                    onLoad={handleLoad}
                    onError={handleError}
                    sx={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        // Ocultar hasta que cargue para evitar parpadeo
                        opacity: loading ? 0 : 1,
                        transition: 'opacity 200ms ease',
                    }}
                />
            )}
        </Box>
    );
}