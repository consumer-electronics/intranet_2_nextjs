'use client';

import dynamic from 'next/dynamic';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';

/**
 * El visor PDF necesita APIs de navegador (canvas, Worker), no disponibles en SSR.
 * Se carga de forma diferida con dynamic() + ssr:false.
 */
const PdfViewer = dynamic(() => import('@/components/common/documents/PdfViewer'), {
    ssr: false,
    loading: () => (
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: 'calc(100vh - 260px)', minHeight: 600 }}>
            <CircularProgress />
            <Typography color="text.secondary">Preparando el catálogo...</Typography>
        </Stack>
    ),
});

/**
 * Vista de convenios con visor PDF integrado.
 *
 * Refactorizado para usar PdfViewer global (common/documents/PdfViewer)
 * en lugar de ConveniosPdfViewer específico.
 * El título de la sección lo muestra el TopBar via menuConfig.js.
 *
 * Props:
 * - title      {string}  Título del documento (se pasa al visor para pantalla completa).
 * - description {string} (ya no se muestra aquí; la descripción está en el TopBar/menú).
 * - pdfUrl     {string}  URL del PDF.
 */
export default function ConveniosPdfView({ title, pdfUrl }) {
    return (
        <Stack spacing={3}>
            <Paper variant="outlined" sx={{ overflow: 'hidden', height: 'calc(100vh - 200px)', minHeight: 640 }}>
                <PdfViewer src={pdfUrl} title={title} />
            </Paper>

            <Box>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Abrir catálogo en una pestaña nueva
                </Button>
            </Box>
        </Stack>
    );
}
