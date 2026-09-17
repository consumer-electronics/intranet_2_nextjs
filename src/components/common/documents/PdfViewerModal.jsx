'use client';

import dynamic from 'next/dynamic';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

/**
 * Carga diferida del visor PDF: react-pdf requiere APIs de navegador
 * (canvas, Worker) que no están disponibles en SSR.
 */
const PdfViewer = dynamic(() => import('./PdfViewer'), {
    ssr: false,
    loading: () => (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ height: 'calc(80vh - 120px)', minHeight: 400 }}
        >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
                Preparando el visor...
            </Typography>
        </Stack>
    ),
});

/**
 * Modal global para visualizar documentos PDF.
 *
 * Reemplaza a SigDocumentViewerModal (que usaba iframe).
 *
 * Props:
 * - open    {boolean}   Controla la visibilidad del modal.
 * - titulo  {string}    Título del documento (opcional).
 * - src     {string}    URL del PDF (opcional).
 * - onClose {function}  Callback para cerrar.
 */
export default function PdfViewerModal({ open, titulo, src, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }} noWrap>
                    {titulo || 'Visualizador de documentos'}
                </Typography>
                <IconButton onClick={onClose} size="small" aria-label="Cerrar visor">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{ p: 0, bgcolor: 'background.default', height: '80vh', overflow: 'hidden' }}
            >
                {src ? (
                    <PdfViewer src={src.startsWith('http') ? `/api/proxy-pdf?url=${encodeURIComponent(src)}` : src} title={titulo} />
                ) : (
                    <Box sx={{ p: 4 }}>
                        <Alert severity="warning" variant="outlined">
                            El documento no tiene una ruta configurada o el archivo aún no ha sido
                            cargado en el servidor.
                        </Alert>
                    </Box>
                )}
            </DialogContent>

            {src && (
                <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                        Si el documento no carga, puedes abrirlo en una pestaña nueva.
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Abrir en pestaña nueva
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
