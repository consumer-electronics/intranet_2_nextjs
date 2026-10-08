'use client';

import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';

import PdfViewer from './PdfViewer';

/**
 * Modal global para visualizar documentos PDF.
 * Usa el visor nativo del navegador (iframe) a través del proxy interno.
 *
 * Props:
 * - open    {boolean}   Controla la visibilidad del modal.
 * - titulo  {string}    Título del documento (opcional).
 * - src     {string}    URL original del PDF (http o ruta relativa).
 * - onClose {function}  Callback para cerrar.
 */
export default function PdfViewerModal({ open, titulo, src, onClose }) {
    // Para PDFs externos se enruta a través del proxy para evitar CORS / Content-Security-Policy
    const proxySrc = src?.startsWith('http')
        ? `/api/proxy-pdf?url=${encodeURIComponent(src)}`
        : src;

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
                    <PdfViewer src={proxySrc} title={titulo} originalSrc={src} />
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
