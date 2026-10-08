'use client';

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Modal de previsualización de desprendibles de nómina (Usando iframe nativo).
 *
 * Props:
 * - open        {boolean}   Si el modal está abierto.
 * - file        {object}    Objeto del desprendible seleccionado { doc, date, ... }.
 * - previewUrl  {string}    URL del PDF para previsualizar.
 * - loading     {boolean}   Si está cargando la URL de previsualización.
 * - isMobile    {boolean}   Si el dispositivo es móvil (activa fullScreen).
 * - onClose     {function}  Callback para cerrar el modal.
 * - onDownload  {function}  Callback para descargar el desprendible.
 */
export default function PayslipPreviewModal({
    open,
    file,
    previewUrl,
    loading: parentLoading,
    isMobile = false,
    onClose,
    onDownload,
}) {
    const [iframeLoading, setIframeLoading] = useState(true);

    const handleIframeLoad = () => {
        setIframeLoading(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ pr: 6 }}>
                {file?.doc || 'Vista previa del PDF'}
                <IconButton
                    onClick={onClose}
                    aria-label="Cerrar"
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    height: isMobile ? 'calc(100dvh - 130px)' : '70vh',
                    p: 0,
                    backgroundColor: '#525659',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {parentLoading ? (
                    <Stack alignItems="center" justifyContent="center" height="100%">
                        <CircularProgress sx={{ color: 'white' }} />
                    </Stack>
                ) : (
                    previewUrl && (
                        <>
                            {iframeLoading && (
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    <CircularProgress sx={{ color: 'white' }} />
                                </Stack>
                            )}
                            <Box
                                component="iframe"
                                src={previewUrl}
                                title={file?.doc || 'Desprendible PDF'}
                                onLoad={handleIframeLoad}
                                sx={{
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    opacity: iframeLoading ? 0 : 1,
                                    transition: 'opacity 200ms ease',
                                }}
                            />
                        </>
                    )
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, textAlign: 'left' }}>
                    * El navegador podría pedirte la contraseña (tu cédula) para ver el documento.
                </Typography>
                
                {previewUrl && (
                    <Button
                        variant="outlined"
                        startIcon={<OpenInNewIcon />}
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        Abrir en pestaña nueva
                    </Button>
                )}

                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={onDownload}
                    color="primary"
                    size="small"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Descargar
                </Button>
                <Button
                    onClick={onClose}
                    color="inherit"
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}